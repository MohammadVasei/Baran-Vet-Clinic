-- Migration: 034_reminder_due_time_and_details.sql
-- Time-based reminders + owner details for the clinic reminders list.
--
-- 1) reminders.due_time: time-of-day (Asia/Tehran) when a reminder becomes
--    actionable, defaulting to 09:00 clinic opening. The background job now
--    compares the Tehran wall-clock against due_date + due_time instead of a
--    whole day, so reminders "fire at the time" rather than anywhere on the
--    date. Existing rows are backfilled to 09:00.
--
-- 2) public.reminders_with_details: read-model view that joins the owner
--    (auth.users full_name, with a bookings/orders fallback for walk-in phone
--    owners), the animal, species/breed, and the vaccine/treatment definition,
--    so the reminders table can render customer name, phone, animal and due
--    info in one query. Views run with the owner's privileges, so it gates
--    every row on public.is_staff() — is_staff() resolves the live JWT, so
--    non-staff callers receive zero rows and nothing leaks.
--
-- 3) record_treatment() gains an optional p_due_time so staff can pick the
--    reminder time when recording a periodic treatment.
--
-- Idempotent: safe to re-run. Run in the Supabase SQL editor after 033.

-- ============================================================
-- 1. REMINDERS: DUE_TIME
-- ============================================================
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS due_time time;

UPDATE public.reminders SET due_time = '09:00' WHERE due_time IS NULL;

ALTER TABLE public.reminders ALTER COLUMN due_time SET DEFAULT '09:00';
ALTER TABLE public.reminders ALTER COLUMN due_time SET NOT NULL;

COMMENT ON COLUMN public.reminders.due_time IS
    'Clinic wall-clock time (Asia/Tehran) when the reminder becomes actionable. Defaults to 09:00 opening time.';

-- Index for the common "due soon" listing and the cron scan.
CREATE INDEX IF NOT EXISTS idx_reminders_due_datetime
    ON public.reminders (due_date, due_time, status);

-- ============================================================
-- 2. REMINDERS_WITH_DETAILS (staff-only read-model view)
-- ============================================================
DROP VIEW IF EXISTS public.reminders_with_details CASCADE;

CREATE VIEW public.reminders_with_details AS
SELECT
    r.id,
    r.animal_id,
    r.medical_record_id,
    r.type,
    r.title,
    r.description,
    r.due_date,
    r.due_time,
    r.status,
    r.priority,
    r.notification_date,
    r.completed_at,
    r.created_by,
    r.created_at,
    r.updated_at,
    r.vaccine_id,
    r.treatment_type_id,
    -- animal
    a.name          AS animal_name,
    sp.name         AS species_name,
    br.name         AS breed_name,
    a.sex           AS animal_sex,
    a.date_of_birth AS animal_birth_date,
    a.status        AS animal_status,
    -- owner
    a.owner_id,
    a.owner_phone,
    COALESCE(
        NULLIF(u.raw_user_meta_data->>'full_name', ''),
        NULLIF(u.raw_user_meta_data->>'name', ''),
        NULLIF(u.email, ''),
        fb.customer_name,
        fo.customer_name
    ) AS owner_name,
    -- definition
    v.name  AS vaccine_name,
    tt.name AS treatment_name
FROM public.reminders r
JOIN public.animals a ON a.id = r.animal_id
LEFT JOIN public.species sp ON sp.id = a.species_id
LEFT JOIN public.breeds br ON br.id = a.breed_id
LEFT JOIN public.vaccines v ON v.id = r.vaccine_id
LEFT JOIN public.treatment_types tt ON tt.id = r.treatment_type_id
LEFT JOIN auth.users u ON u.id = a.owner_id
LEFT JOIN LATERAL (
    SELECT b.customer_name
    FROM public.bookings b
    WHERE regexp_replace(coalesce(b.customer_phone, ''), '\D', '', 'g')
          = regexp_replace(coalesce(a.owner_phone, ''), '\D', '', 'g')
      AND a.owner_id IS NULL
      AND b.customer_name IS NOT NULL AND btrim(b.customer_name) <> ''
    ORDER BY b.created_at DESC, b.id DESC
    LIMIT 1
) fb ON true
LEFT JOIN LATERAL (
    SELECT o.customer_name
    FROM public.orders o
    WHERE regexp_replace(coalesce(o.customer_phone, ''), '\D', '', 'g')
          = regexp_replace(coalesce(a.owner_phone, ''), '\D', '', 'g')
      AND a.owner_id IS NULL
      AND o.customer_name IS NOT NULL AND btrim(o.customer_name) <> ''
    ORDER BY o.created_at DESC, o.id DESC
    LIMIT 1
) fo ON true
WHERE public.is_staff();

GRANT SELECT ON public.reminders_with_details TO anon, authenticated;

COMMENT ON VIEW public.reminders_with_details IS
    'Staff-only reminder listing with owner/animal/definition details. Rows are gated on public.is_staff().';

-- ============================================================
-- 3. RECORD_TREATMENT: OPTIONAL REMINDER TIME
--    (replaces the 027 signature; add p_due_time)
-- ============================================================
DROP FUNCTION IF EXISTS public.record_treatment(uuid, text, uuid, date, uuid, text, jsonb);

CREATE OR REPLACE FUNCTION public.record_treatment(
    p_animal_id uuid,
    p_definition_type text,     -- 'vaccine' | 'treatment'
    p_definition_id uuid,
    p_performed_date date,
    p_doctor_id uuid DEFAULT NULL,
    p_notes text DEFAULT NULL,
    p_details jsonb DEFAULT NULL,
    p_due_time time DEFAULT '09:00'  -- when the scheduled reminder becomes actionable
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
            animal_id, medical_record_id, type, title, due_date, due_time,
            status, priority, created_by, vaccine_id, treatment_type_id
        ) VALUES (
            p_animal_id, v_record_id, v_reminder_type, v_def_name, v_next_date,
            p_due_time, 'pending', 'normal', auth.uid(),
            CASE WHEN p_definition_type = 'vaccine' THEN p_definition_id ELSE NULL END,
            CASE WHEN p_definition_type = 'treatment' THEN p_definition_id ELSE NULL END
        )
        RETURNING id INTO v_reminder_id;
    END IF;

    RETURN jsonb_build_object(
        'record_id', v_record_id,
        'reminder_id', v_reminder_id,
        'next_reminder_date', v_next_date,
        'next_reminder_time', CASE WHEN v_next_date IS NOT NULL THEN p_due_time::text ELSE NULL END,
        'title', v_def_name,
        'record_type', v_record_type
    );
END;
$$;

REVOKE ALL ON FUNCTION public.record_treatment(uuid, text, uuid, date, uuid, text, jsonb, time) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_treatment(uuid, text, uuid, date, uuid, text, jsonb, time) TO anon, authenticated;