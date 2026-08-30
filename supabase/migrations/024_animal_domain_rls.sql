-- Migration: 024_animal_domain_rls.sql
-- Animal medical log — Row Level Security + grants for the whole domain.
--
-- Permission model (matches the rest of Baran Clinic):
--   * reference catalogs (species, breeds, vaccines, treatment_types,
--     medical_protocols): public can read active, staff can manage.
--   * animals: staff can do everything; owners can view/insert/update their
--     own pets (by auth account OR digit-normalized phone) but cannot delete.
--   * visits / medical_records / reminders / medical_documents: staff manage,
--     owners can only read records belonging to their own animals.
--   * notifications: users read + mark-read their own; staff can view all.
--   * audit_logs: append-only. Reads are staff-only; writes happen only
--     through the SECURITY DEFINER helper `record_audit()`.
--
-- Helper functions is_owner()/is_staff() come from 002/005.
-- Idempotent: safe to re-run. Run AFTER migrations 019–023.

-- ============================================================
-- ENABLE RLS ON ALL NEW TABLES
-- ============================================================
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- OWNERSHIP HELPER
-- ============================================================

-- Normalized-phone ownership check: matches when the authenticated user owns
-- the animal by auth account or by phone (digit-only), mirroring 013.
CREATE OR REPLACE FUNCTION public.user_owns_animal(a public.animals)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT auth.uid() = a.owner_id
        OR regexp_replace(coalesce(a.owner_phone, ''), '\D', '', 'g')
           = regexp_replace(coalesce((SELECT phone FROM auth.users WHERE id = auth.uid()), ''), '\D', '', 'g');
$$;

-- ============================================================
-- CATALOGS: species / breeds / vaccines / treatment_types / protocols
-- ============================================================
DROP POLICY IF EXISTS "Public can view active species" ON public.species;
CREATE POLICY "Public can view active species"
    ON public.species FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Staff can view all species" ON public.species;
CREATE POLICY "Staff can view all species"
    ON public.species FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS "Staff can manage species" ON public.species;
CREATE POLICY "Staff can manage species"
    ON public.species FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public can view active breeds" ON public.breeds;
CREATE POLICY "Public can view active breeds"
    ON public.breeds FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Staff can view all breeds" ON public.breeds;
CREATE POLICY "Staff can view all breeds"
    ON public.breeds FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS "Staff can manage breeds" ON public.breeds;
CREATE POLICY "Staff can manage breeds"
    ON public.breeds FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public can view active vaccines" ON public.vaccines;
CREATE POLICY "Public can view active vaccines"
    ON public.vaccines FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Staff can view all vaccines" ON public.vaccines;
CREATE POLICY "Staff can view all vaccines"
    ON public.vaccines FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS "Staff can manage vaccines" ON public.vaccines;
CREATE POLICY "Staff can manage vaccines"
    ON public.vaccines FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public can view active treatment types" ON public.treatment_types;
CREATE POLICY "Public can view active treatment types"
    ON public.treatment_types FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Staff can view all treatment types" ON public.treatment_types;
CREATE POLICY "Staff can view all treatment types"
    ON public.treatment_types FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS "Staff can manage treatment types" ON public.treatment_types;
CREATE POLICY "Staff can manage treatment types"
    ON public.treatment_types FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public can view active protocols" ON public.medical_protocols;
CREATE POLICY "Public can view active protocols"
    ON public.medical_protocols FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Staff can view all protocols" ON public.medical_protocols;
CREATE POLICY "Staff can view all protocols"
    ON public.medical_protocols FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS "Staff can manage protocols" ON public.medical_protocols;
CREATE POLICY "Staff can manage protocols"
    ON public.medical_protocols FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ============================================================
-- ANIMALS
-- ============================================================
DROP POLICY IF EXISTS "Owners can view own animals" ON public.animals;
CREATE POLICY "Owners can view own animals"
    ON public.animals FOR SELECT
    USING (public.user_owns_animal(animals));

DROP POLICY IF EXISTS "Owners can insert own animals" ON public.animals;
CREATE POLICY "Owners can insert own animals"
    ON public.animals FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own animals" ON public.animals;
CREATE POLICY "Owners can update own animals"
    ON public.animals FOR UPDATE
    USING (public.user_owns_animal(animals))
    WITH CHECK (public.user_owns_animal(animals));

DROP POLICY IF EXISTS "Staff can view all animals" ON public.animals;
CREATE POLICY "Staff can view all animals"
    ON public.animals FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can manage animals" ON public.animals;
CREATE POLICY "Staff can manage animals"
    ON public.animals FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ============================================================
-- VISITS
-- ============================================================
DROP POLICY IF EXISTS "Owners can view own animal visits" ON public.visits;
CREATE POLICY "Owners can view own animal visits"
    ON public.visits FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.animals a WHERE a.id = visits.animal_id
        AND public.user_owns_animal(a)
    ));

DROP POLICY IF EXISTS "Staff can view all visits" ON public.visits;
CREATE POLICY "Staff can view all visits"
    ON public.visits FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can manage visits" ON public.visits;
CREATE POLICY "Staff can manage visits"
    ON public.visits FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ============================================================
-- MEDICAL_RECORDS
-- ============================================================
DROP POLICY IF EXISTS "Owners can view own animal medical records" ON public.medical_records;
CREATE POLICY "Owners can view own animal medical records"
    ON public.medical_records FOR SELECT
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM public.animals a WHERE a.id = medical_records.animal_id
            AND public.user_owns_animal(a)
        )
    );

DROP POLICY IF EXISTS "Staff can view all medical records" ON public.medical_records;
CREATE POLICY "Staff can view all medical records"
    ON public.medical_records FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can manage medical records" ON public.medical_records;
CREATE POLICY "Staff can manage medical records"
    ON public.medical_records FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ============================================================
-- REMINDERS
-- ============================================================
DROP POLICY IF EXISTS "Owners can view own animal reminders" ON public.reminders;
CREATE POLICY "Owners can view own animal reminders"
    ON public.reminders FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.animals a WHERE a.id = reminders.animal_id
        AND public.user_owns_animal(a)
    ));

DROP POLICY IF EXISTS "Staff can view all reminders" ON public.reminders;
CREATE POLICY "Staff can view all reminders"
    ON public.reminders FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can manage reminders" ON public.reminders;
CREATE POLICY "Staff can manage reminders"
    ON public.reminders FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ============================================================
-- REMINDER_RULES (staff configuration only)
-- ============================================================
DROP POLICY IF EXISTS "Staff can view reminder rules" ON public.reminder_rules;
CREATE POLICY "Staff can view reminder rules"
    ON public.reminder_rules FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can manage reminder rules" ON public.reminder_rules;
CREATE POLICY "Staff can manage reminder rules"
    ON public.reminder_rules FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view all notifications" ON public.notifications;
CREATE POLICY "Staff can view all notifications"
    ON public.notifications FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can manage notifications" ON public.notifications;
CREATE POLICY "Staff can manage notifications"
    ON public.notifications FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ============================================================
-- MEDICAL_DOCUMENTS
-- ============================================================
DROP POLICY IF EXISTS "Owners can view own animal documents" ON public.medical_documents;
CREATE POLICY "Owners can view own animal documents"
    ON public.medical_documents FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.animals a WHERE a.id = medical_documents.animal_id
        AND public.user_owns_animal(a)
    ));

DROP POLICY IF EXISTS "Staff can view all medical documents" ON public.medical_documents;
CREATE POLICY "Staff can view all medical documents"
    ON public.medical_documents FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can manage medical documents" ON public.medical_documents;
CREATE POLICY "Staff can manage medical documents"
    ON public.medical_documents FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ============================================================
-- AUDIT_LOG (append-only via SECURITY DEFINER helper)
-- ============================================================
DROP POLICY IF EXISTS "Staff can view audit logs" ON public.audit_logs;
CREATE POLICY "Staff can view audit logs"
    ON public.audit_logs FOR SELECT USING (public.is_staff());

CREATE OR REPLACE FUNCTION public.record_audit(
    p_action text,
    p_entity_type text,
    p_entity_id text,
    p_old_value jsonb DEFAULT NULL,
    p_new_value jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, new_value)
    VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_old_value, p_new_value);
END;
$$;

REVOKE ALL ON FUNCTION public.record_audit(text, text, text, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_audit(text, text, text, jsonb, jsonb) TO authenticated;

-- ============================================================
-- GRANTS
-- ============================================================
-- Reference catalogs: readable by anonymous + authenticated
GRANT SELECT ON public.species TO anon, authenticated;
GRANT SELECT ON public.breeds TO anon, authenticated;
GRANT SELECT ON public.vaccines TO anon, authenticated;
GRANT SELECT ON public.treatment_types TO anon, authenticated;
GRANT SELECT ON public.medical_protocols TO anon, authenticated;

-- Animal domain: staff manage, owners read their own (RLS enforces scope)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.animals TO authenticated;
GRANT SELECT ON public.visits TO authenticated;
GRANT SELECT ON public.medical_records TO authenticated;
GRANT SELECT ON public.reminders TO authenticated;
GRANT SELECT ON public.medical_documents TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

-- Staff need full DML on the tables they manage (RLS restricts to is_staff)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.species TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.breeds TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaccines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.treatment_types TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_protocols TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

-- service_role bypasses RLS; give it direct access to everything
GRANT ALL ON public.species, public.breeds, public.animals, public.vaccines,
    public.treatment_types, public.medical_protocols, public.visits,
    public.medical_records, public.reminders, public.reminder_rules,
    public.notifications, public.medical_documents, public.audit_logs
    TO service_role;

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- animal-images (public bucket): anyone can view; staff + owners can manage.
-- Uploads are namespaced under animals/<animalId>/...
DROP POLICY IF EXISTS "Public can view animal images" ON storage.objects;
CREATE POLICY "Public can view animal images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'animal-images');

DROP POLICY IF EXISTS "Staff can upload animal images" ON storage.objects;
CREATE POLICY "Staff can upload animal images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'animal-images' AND public.is_staff());

DROP POLICY IF EXISTS "Staff can update animal images" ON storage.objects;
CREATE POLICY "Staff can update animal images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'animal-images' AND public.is_staff())
    WITH CHECK (bucket_id = 'animal-images' AND public.is_staff());

DROP POLICY IF EXISTS "Staff can delete animal images" ON storage.objects;
CREATE POLICY "Staff can delete animal images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'animal-images' AND public.is_staff());

-- medical-documents (private bucket): staff have full access; the animal's
-- owner can read only documents under their own animal folder.
DROP POLICY IF EXISTS "Staff can read medical documents" ON storage.objects;
CREATE POLICY "Staff can read medical documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'medical-documents' AND public.is_staff());

DROP POLICY IF EXISTS "Owners can read own medical documents" ON storage.objects;
CREATE POLICY "Owners can read own medical documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'medical-documents'
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.animals a
            WHERE a.id::text = (storage.foldername(name))[2]
            AND public.user_owns_animal(a)
        )
    );

DROP POLICY IF EXISTS "Staff can upload medical documents" ON storage.objects;
CREATE POLICY "Staff can upload medical documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'medical-documents' AND public.is_staff());

DROP POLICY IF EXISTS "Staff can update medical documents" ON storage.objects;
CREATE POLICY "Staff can update medical documents"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'medical-documents' AND public.is_staff())
    WITH CHECK (bucket_id = 'medical-documents' AND public.is_staff());

DROP POLICY IF EXISTS "Staff can delete medical documents" ON storage.objects;
CREATE POLICY "Staff can delete medical documents"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'medical-documents' AND public.is_staff());