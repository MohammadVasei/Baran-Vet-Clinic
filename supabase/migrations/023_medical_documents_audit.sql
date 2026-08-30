-- Migration: 023_medical_documents_audit.sql
-- Animal medical log — attachments + audit trail + storage buckets.
--
-- Medical documents (lab results, X-rays, prescriptions, certificates, ...)
-- hang off an animal and optionally a medical record. They are
-- permission-protected: anonymous users never see them.
--
-- Audit log is INSERT-only by design so medical changes leave a permanent,
-- append-only trail. Combined with the medical_records soft-delete flag this
-- keeps the animal's history immutable in practice.
--
-- Storage buckets:
--   * animal-images      — PUBLIC profile photos (mirrors product-images)
--   * medical-documents  — PRIVATE clinic documents (RLS in 024)
--
-- Idempotent: safe to re-run. Apply alongside 019–022 + 024.

-- ============================================================
-- MEDICAL_DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.medical_documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
    medical_record_id uuid REFERENCES public.medical_records(id) ON DELETE SET NULL,
    file_url text NOT NULL,
    file_name text NOT NULL,
    file_type text,
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_documents_animal_id ON public.medical_documents (animal_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_record_id ON public.medical_documents (medical_record_id);

-- ============================================================
-- AUDIT_LOG (append-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL CHECK (action IN (
        'create', 'update', 'delete', 'restore', 'complete', 'cancel'
    )),
    entity_type text NOT NULL,
    entity_id text,
    old_value jsonb,
    new_value jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Public animal profile photos (same shape as product-images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'animal-images',
    'animal-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Private clinic documents (records, X-rays, certificates, ...)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'medical-documents',
    'medical-documents',
    false,
    15728640, -- 15MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;