-- Migration: 027_periodic_treatment.sql
-- Periodic treatment tracking & reminder system.
--
-- Extends the existing treatment/vaccine catalogs with configurable
-- reminder intervals, links medical records to their definitions, and
-- adds next-reminder tracking. Fully backwards-compatible: all new
-- columns have safe defaults so existing rows are unaffected.
--
-- Idempotent: safe to re-run.

-- ============================================================
-- 1. EXTEND VACCINES WITH REMINDER CONFIG
-- ============================================================
ALTER TABLE public.vaccines
    ADD COLUMN IF NOT EXISTS is_periodic boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS reminder_interval_value int,
    ADD COLUMN IF NOT EXISTS reminder_interval_unit text DEFAULT 'months'
        CHECK (reminder_interval_unit IS NULL OR reminder_interval_unit IN ('days', 'weeks', 'months', 'years'));

-- ============================================================
-- 2. EXTEND TREATMENT_TYPES WITH REMINDER CONFIG
-- ============================================================
ALTER TABLE public.treatment_types
    ADD COLUMN IF NOT EXISTS is_periodic boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS reminder_interval_value int,
    ADD COLUMN IF NOT EXISTS reminder_interval_unit text DEFAULT 'months'
        CHECK (reminder_interval_unit IS NULL OR reminder_interval_unit IN ('days', 'weeks', 'months', 'years'));

-- ============================================================
-- 3. EXTEND MEDICAL_RECORDS WITH DEFINITION REFERENCES
-- ============================================================
ALTER TABLE public.medical_records
    ADD COLUMN IF NOT EXISTS vaccine_id uuid REFERENCES public.vaccines(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS treatment_type_id uuid REFERENCES public.treatment_types(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS next_reminder_date date;

-- ============================================================
-- 4. EXTEND REMINDERS WITH DEFINITION REFERENCES
-- ============================================================
ALTER TABLE public.reminders
    ADD COLUMN IF NOT EXISTS treatment_type_id uuid REFERENCES public.treatment_types(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS vaccine_id uuid REFERENCES public.vaccines(id) ON DELETE SET NULL;

-- ============================================================
-- 5. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_medical_records_vaccine_id ON public.medical_records(vaccine_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_treatment_type_id ON public.medical_records(treatment_type_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_reminders_treatment_type_id ON public.reminders(treatment_type_id);
CREATE INDEX IF NOT EXISTS idx_reminders_vaccine_id ON public.reminders(vaccine_id);

-- ============================================================
-- 6. SEED: Set periodic config on existing vaccines
--    (Rabies → 12 months, others leave as-is for clinic to decide)
-- ============================================================
UPDATE public.vaccines
SET is_periodic = true,
    reminder_interval_value = 12,
    reminder_interval_unit = 'months'
WHERE name = 'هاری' AND is_periodic = false;

UPDATE public.vaccines
SET is_periodic = true,
    reminder_interval_value = 12,
    reminder_interval_unit = 'months'
WHERE name IN ('DHPP', 'DHP', 'FVRCP', 'FeLV', 'بوردتلا', 'لپتوسپیروز', 'کلامیدیا')
  AND is_periodic = false;

-- Set periodic config on existing deworming treatment types
UPDATE public.treatment_types
SET is_periodic = true,
    reminder_interval_value = 3,
    reminder_interval_unit = 'months'
WHERE category = 'deworming' AND is_periodic = false;

-- ============================================================
-- 7. RECORD_TREATMENT RPC FUNCTION
--    Atomically records a treatment/vaccination for an animal and
--    schedules the next reminder (cancelling any previous pending
--    reminder for the same definition).
--
--    SECURITY INVOKER: RLS runs as the calling user. An explicit
--    is_staff() guard keeps non-staff callers out.
-- ============================================================
CREATE OR REPLACE FUNCTION public.record_treatment(
    p_animal_id uuid,
    p_definition_type text,     -- 'vaccine' | 'treatment'
    p_definition_id uuid,
    p_performed_date date,
    p_doctor_id uuid DEFAULT NULL,
    p_notes text DEFAULT NULL,
    p_details jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_species_id uuid;
    v_def_name text;
    v_record_type text;
    v_reminder_type text;
    v_is_periodic boolean;
    v_interval_value int;
    v_interval_unit text;
    v_next_date date;
    v_record_id uuid;
    v_reminder_id uuid;
BEGIN
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'unauthorized';
    END IF;

    -- Resolve the animal's species (also validates the animal exists)
    SELECT species_id INTO v_species_id FROM public.animals WHERE id = p_animal_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'animal_not_found';
    END IF;

    IF p_definition_type = 'vaccine' THEN
        SELECT name, is_periodic, reminder_interval_value, reminder_interval_unit
          INTO v_def_name, v_is_periodic, v_interval_value, v_interval_unit
          FROM public.vaccines
         WHERE id = p_definition_id AND active = true AND species_id = v_species_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'vaccine_not_available_for_this_animal';
        END IF;
        v_record_type := 'vaccination';
        v_reminder_type := 'vaccination';
    ELSIF p_definition_type = 'treatment' THEN
        SELECT name, category, is_periodic, reminder_interval_value, reminder_interval_unit
          INTO v_def_name, v_record_type, v_is_periodic, v_interval_value, v_interval_unit
          FROM public.treatment_types
         WHERE id = p_definition_id AND active = true AND species_id = v_species_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'treatment_not_available_for_this_animal';
        END IF;

        -- map treatment category -> medical_records.type
        IF v_record_type = 'vaccination' THEN v_record_type := 'vaccination';
        ELSIF v_record_type = 'deworming'   THEN v_record_type := 'deworming';
        ELSIF v_record_type = 'dental'      THEN v_record_type := 'dental';
        ELSIF v_record_type = 'surgery'     THEN v_record_type := 'surgery';
        ELSIF v_record_type = 'diagnostic'  THEN v_record_type := 'diagnosis';
        ELSE                                    v_record_type := 'treatment';
        END IF;

        -- reminders.type is coarser than medical_records.type
        IF v_record_type = 'vaccination' THEN v_reminder_type := 'vaccination';
        ELSIF v_record_type = 'deworming' THEN v_reminder_type := 'deworming';
        ELSIF v_record_type = 'dental'    THEN v_reminder_type := 'treatment';
        ELSE                                  v_reminder_type := 'treatment';
        END IF;
    ELSE
        RAISE EXCEPTION 'invalid_definition_type';
    END IF;

    -- Calculate the next reminder date from the DEFINITION's configured interval.
    -- Postgres interval arithmetic clamps month-ends (Jan 31 + 1 month → Feb 28),
    -- handles leap years and year boundaries natively.
    IF v_is_periodic AND v_interval_value IS NOT NULL AND v_interval_value > 0 THEN
        v_next_date := p_performed_date + (
            v_interval_value || ' ' || COALESCE(v_interval_unit, 'months')
        )::interval;
    END IF;

    -- Cancel any previous pending/due reminder for the same definition so a
    -- re-vaccination/re-treatment does not fire duplicate reminders.
    IF p_definition_type = 'vaccine' THEN
        UPDATE public.reminders
           SET status = 'cancelled', updated_at = now()
         WHERE animal_id = p_animal_id
           AND status IN ('pending', 'due', 'overdue')
           AND vaccine_id = p_definition_id;
    ELSE
        UPDATE public.reminders
           SET status = 'cancelled', updated_at = now()
         WHERE animal_id = p_animal_id
           AND status IN ('pending', 'due', 'overdue')
           AND treatment_type_id = p_definition_id;
    END IF;

    -- Create the medical record
    INSERT INTO public.medical_records (
        animal_id, type, title, description, details,
        performed_at, created_by, vaccine_id, treatment_type_id, doctor_id,
        next_reminder_date
    ) VALUES (
        p_animal_id, v_record_type, v_def_name, p_notes, p_details,
        p_performed_date::timestamp, auth.uid(),
        CASE WHEN p_definition_type = 'vaccine' THEN p_definition_id ELSE NULL END,
        CASE WHEN p_definition_type = 'treatment' THEN p_definition_id ELSE NULL END,
        p_doctor_id,
        v_next_date
    )
    RETURNING id INTO v_record_id;

    -- Schedule the next reminder when the treatment is periodic
    IF v_next_date IS NOT NULL THEN
        INSERT INTO public.reminders (
            animal_id, medical_record_id, type, title, due_date, status,
            priority, created_by, vaccine_id, treatment_type_id
        ) VALUES (
            p_animal_id, v_record_id, v_reminder_type, v_def_name, v_next_date,
            'pending', 'normal', auth.uid(),
            CASE WHEN p_definition_type = 'vaccine' THEN p_definition_id ELSE NULL END,
            CASE WHEN p_definition_type = 'treatment' THEN p_definition_id ELSE NULL END
        )
        RETURNING id INTO v_reminder_id;
    END IF;

    RETURN jsonb_build_object(
        'record_id', v_record_id,
        'reminder_id', v_reminder_id,
        'next_reminder_date', v_next_date,
        'title', v_def_name,
        'record_type', v_record_type
    );
END;
$$;

REVOKE ALL ON FUNCTION public.record_treatment(uuid, text, uuid, date, uuid, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_treatment(uuid, text, uuid, date, uuid, text, jsonb) TO anon, authenticated;

-- ============================================================
-- 8. IDEMPOTENCY: prevent duplicate notifications per reminder+channel.
--    Even if the background job runs twice, a reminder can only be
--    delivered once per channel.
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_reminder_channel_unique
    ON public.notifications (reminder_id, channel)
    WHERE reminder_id IS NOT NULL;
