-- Migration: 020_medical_catalog.sql
-- Animal medical log — configurable medical catalog.
--
-- Vaccines, treatment types and medical protocols are clinic-configured
-- catalogs, not hard-coded application data. Each is species-aware so the UI
-- can filter options to the animal's species. Protocols hold recommended
-- age windows + intervals so the clinic (not the code) decides medical rules.
--
-- Idempotent: safe to re-run. Apply alongside 019 + 021+.

-- ============================================================
-- VACCINES (vaccination catalog, per species)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vaccines (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    species_id uuid NOT NULL REFERENCES public.species(id) ON DELETE CASCADE,
    description text,
    manufacturer text,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vaccines_species_id ON public.vaccines (species_id);

-- ============================================================
-- TREATMENT_TYPES (treatment catalog, per species + category)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.treatment_types (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    species_id uuid NOT NULL REFERENCES public.species(id) ON DELETE CASCADE,
    category text NOT NULL DEFAULT 'other'
        CHECK (category IN (
            'preventive', 'vaccination', 'deworming', 'dental',
            'dermatology', 'surgery', 'diagnostic', 'routine', 'other'
        )),
    description text,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_treatment_types_species_id ON public.treatment_types (species_id);
CREATE INDEX IF NOT EXISTS idx_treatment_types_category ON public.treatment_types (category);

-- ============================================================
-- MEDICAL_PROTOCOLS (clinic-configured care recommendations)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.medical_protocols (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    species_id uuid NOT NULL REFERENCES public.species(id) ON DELETE CASCADE,
    category text NOT NULL DEFAULT 'other'
        CHECK (category IN (
            'preventive', 'vaccination', 'deworming', 'dental',
            'dermatology', 'surgery', 'diagnostic', 'routine', 'other'
        )),
    description text,
    age_min_months int, -- NULL = no lower age bound
    age_max_months int, -- NULL = no upper age bound
    recommended_interval_days int, -- NULL = irregular / clinic decides
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_protocols_species_id ON public.medical_protocols (species_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE TRIGGER update_vaccines_updated_at BEFORE UPDATE ON public.vaccines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatment_types_updated_at BEFORE UPDATE ON public.treatment_types
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_protocols_updated_at BEFORE UPDATE ON public.medical_protocols
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();