-- Migration: 019_animal_domain.sql
-- Animal medical log — core pet domain tables.
-- The animal is the central medical entity of Baran Clinic: every pet has a
-- permanent medical history that connects owner, visits, medical records,
-- reminders, documents and audit history around it.
--
-- Design decisions (aligned with the animal-log plan):
--  * owners may be authenticated auth.users OR walk-in customers that only
--    have a phone number (owner_phone), mirroring how bookings/orders work.
--  * microchip numbers are unique when present (partial unique index).
--  * an animal is never hard-deleted by a customer; status tracks life-cycle
--    (active / deceased / transferred / archived).
--  * date_of_birth may be NULL (unknown) instead of inventing a date.
--
-- Idempotent: safe to re-run. Apply in the Supabase SQL Editor alongside
-- the 020+ animal-log migrations.

-- ============================================================
-- SPECIES (configurable catalog — not limited to dog/cat)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.species (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    code text NOT NULL UNIQUE,
    description text,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- BREEDS (separate from species; admin can add more later)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.breeds (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    species_id uuid NOT NULL REFERENCES public.species(id) ON DELETE CASCADE,
    name text NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT breeds_species_name_unique UNIQUE (species_id, name)
);

CREATE INDEX IF NOT EXISTS idx_breeds_species_id ON public.breeds (species_id);

-- ============================================================
-- ANIMALS (the central medical entity)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.animals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    owner_phone text, -- walk-in customers without an account
    name text NOT NULL,
    species_id uuid NOT NULL REFERENCES public.species(id) ON DELETE RESTRICT,
    breed_id uuid REFERENCES public.breeds(id) ON DELETE SET NULL,
    sex text NOT NULL DEFAULT 'unknown' CHECK (sex IN ('male', 'female', 'unknown')),
    date_of_birth date, -- NULL = unknown birth date
    weight numeric(6,2), -- kg
    color text,
    microchip_number text,
    neutered boolean NOT NULL DEFAULT false,
    allergies text,
    medical_notes text,
    profile_image text,
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'deceased', 'transferred', 'archived')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    -- every animal needs an identifiable owner (account or phone)
    CONSTRAINT animals_owner_required CHECK (owner_id IS NOT NULL OR owner_phone IS NOT NULL)
);

-- Unique microchip when present (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_microchip_unique
    ON public.animals (microchip_number)
    WHERE microchip_number IS NOT NULL;

-- Indexes for the common lookups the clinic performs
CREATE INDEX IF NOT EXISTS idx_animals_owner_id ON public.animals (owner_id);
CREATE INDEX IF NOT EXISTS idx_animals_owner_phone ON public.animals (owner_phone);
CREATE INDEX IF NOT EXISTS idx_animals_species_id ON public.animals (species_id);
CREATE INDEX IF NOT EXISTS idx_animals_breed_id ON public.animals (breed_id);
CREATE INDEX IF NOT EXISTS idx_animals_name ON public.animals (name);
CREATE INDEX IF NOT EXISTS idx_animals_status ON public.animals (status);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE TRIGGER update_species_updated_at BEFORE UPDATE ON public.species
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_breeds_updated_at BEFORE UPDATE ON public.breeds
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON public.animals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();