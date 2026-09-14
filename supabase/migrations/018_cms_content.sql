-- Migration: 018_cms_content.sql
-- Phase 7 — Content Migration (Static → CMS)
-- 1. New site_content table (JSONB) for clinic info + section copy.
-- 2. Extend services/doctors/testimonials with the public-presentation fields
--    that previously lived only in src/lib/content.ts.
-- 3. Unique (animal_type, name) index on diseases for idempotent migration.
-- 4. Align RLS so staff can manage content tables (matches the Refine
--    access-control provider + the Phase 7 user story); orders/order_items
--    remain owner-only.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

-- ============================================================
-- 1. SITE_CONTENT (JSONB)
--    Holds clinic info (key 'clinic') and section copy keys:
--    about, why, animals, marquee, emergency, appointment, contact,
--    facilities, services_section, doctors_section, testimonials_section,
--    diseases_groups, general_advice, disclaimer
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_content (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    key text NOT NULL UNIQUE,
    data jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
CREATE POLICY "Public can view site content"
    ON public.site_content
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Staff can view all site content" ON public.site_content;
CREATE POLICY "Staff can view all site content"
    ON public.site_content
    FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can manage site content" ON public.site_content;
CREATE POLICY "Staff can manage site content"
    ON public.site_content
    FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;

-- ============================================================
-- 2. SERVICES: public-presentation columns (Service.text -> description)
-- ============================================================
ALTER TABLE public.services
    ADD COLUMN IF NOT EXISTS tagline text,
    ADD COLUMN IF NOT EXISTS title text,
    ADD COLUMN IF NOT EXISTS image text,
    ADD COLUMN IF NOT EXISTS alt text,
    ADD COLUMN IF NOT EXISTS accent text,
    ADD COLUMN IF NOT EXISTS numeral text,
    ADD COLUMN IF NOT EXISTS href text;

-- ============================================================
-- 3. DOCTORS: public-presentation columns (image -> photo_url)
-- ============================================================
ALTER TABLE public.doctors
    ADD COLUMN IF NOT EXISTS role text,
    ADD COLUMN IF NOT EXISTS image text,
    ADD COLUMN IF NOT EXISTS alt text,
    ADD COLUMN IF NOT EXISTS slug text UNIQUE,
    ADD COLUMN IF NOT EXISTS education text[],
    ADD COLUMN IF NOT EXISTS experience text,
    ADD COLUMN IF NOT EXISTS focus_areas text[],
    ADD COLUMN IF NOT EXISTS clinic_role text;

-- ============================================================
-- 4. TESTIMONIALS: pet narrative string (e.g. "صاحب «لئو»")
-- ============================================================
ALTER TABLE public.testimonials
    ADD COLUMN IF NOT EXISTS pet_note text;

-- ============================================================
-- 5. DISEASES: unique (animal_type, name) for idempotent upsert
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_diseases_animal_type_name
    ON public.diseases (animal_type, name);

-- ============================================================
-- 5b. UNIQUE keys on services/doctors so the content migration can
--     upsert by `key` (004 only created non-unique lookup indexes).
--     De-duplicate first (keep the earliest-created row per key).
-- ============================================================
DELETE FROM public.services a
USING public.services b
WHERE a.key IS NOT NULL
  AND a.key = b.key
  AND (a.created_at > b.created_at
       OR (a.created_at = b.created_at AND a.id > b.id));

DELETE FROM public.doctors a
USING public.doctors b
WHERE a.key IS NOT NULL
  AND a.key = b.key
  AND (a.created_at > b.created_at
       OR (a.created_at = b.created_at AND a.id > b.id));

CREATE UNIQUE INDEX IF NOT EXISTS idx_services_key_unique ON public.services (key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_key_unique ON public.doctors (key);

-- ============================================================
-- 6. RLS: staff can manage content tables (was owner-only in 002).
--    Matches the Phase 3 access-control provider which already grants
--    staff create/edit on these resources. Owner included via is_staff().
-- ============================================================
DROP POLICY IF EXISTS "Owners can manage services" ON public.services;
CREATE POLICY "Staff can manage services"
    ON public.services
    FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Owners can manage doctors" ON public.doctors;
CREATE POLICY "Staff can manage doctors"
    ON public.doctors
    FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Owners can manage diseases" ON public.diseases;
CREATE POLICY "Staff can manage diseases"
    ON public.diseases
    FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Owners can manage testimonials" ON public.testimonials;
CREATE POLICY "Staff can manage testimonials"
    ON public.testimonials
    FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ============================================================
-- Sanity check (policy inventory for the content tables)
-- ============================================================
SELECT tablename, policyname, cmd FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('site_content', 'services', 'doctors', 'diseases', 'testimonials')
ORDER BY tablename, policyname; 