-- Migration: 021_medical_records.sql
-- Animal medical log — visits and the generic medical record.
--
-- A visit groups one or more medical events that happen in the clinic.
-- Medical records are deliberately generic: each record is ONE row in the
-- animal's chronological history with a `type`. Species/specialized detail
-- that varies per record type (vaccine, medication, surgery, ...) is stored
-- in a structured `details` jsonb column ONLY for genuinely variable fields;
-- the fields the clinic queries on (title, performed_at, type, created_by)
-- are real columns so queries stay reliable.
--
-- Medical history must not be accidentally destroyed: records carry a
-- deleted_at soft-delete flag instead of being removable.
--
-- Idempotent: safe to re-run. Apply alongside 019/020 + 022+.

-- ============================================================
-- VISITS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.visits (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
    owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- owner at time of visit
    veterinarian_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
    visit_date date NOT NULL DEFAULT CURRENT_DATE,
    reason text,
    status text NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes text,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visits_animal_id ON public.visits (animal_id);
CREATE INDEX IF NOT EXISTS idx_visits_owner_id ON public.visits (owner_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON public.visits (visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON public.visits (status);
CREATE INDEX IF NOT EXISTS idx_visits_veterinarian_id ON public.visits (veterinarian_id);

-- ============================================================
-- MEDICAL_RECORDS (generic chronological medical history)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.medical_records (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
    visit_id uuid REFERENCES public.visits(id) ON DELETE CASCADE,
    type text NOT NULL
        CHECK (type IN (
            'examination', 'vaccination', 'treatment', 'procedure',
            'surgery', 'medication', 'deworming', 'diagnosis',
            'laboratory', 'dental', 'other'
        )),
    title text NOT NULL,
    description text,
    details jsonb, -- variable per-type metadata (e.g. vaccine batch, dosage)
    performed_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    deleted_at timestamptz, -- soft delete: history is permanent
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_animal_id ON public.medical_records (animal_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_animal_performed
    ON public.medical_records (animal_id, performed_at);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON public.medical_records (type);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_id ON public.medical_records (visit_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();