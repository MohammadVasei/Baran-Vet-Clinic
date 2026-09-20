-- Migration: 032_enable_service_categories_rls_seed.sql
-- Enable RLS and add policies for service_categories (lookup table)
-- and ensure the default categories are present.

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Public can view active service categories (for services listing / booking)
CREATE POLICY "Public can view active service categories"
    ON public.service_categories
    FOR SELECT
    USING (is_active = true);

-- Staff can view all service categories (including inactive)
CREATE POLICY "Staff can view all service categories"
    ON public.service_categories
    FOR SELECT
    USING (public.is_staff());

-- Owners can manage service categories
CREATE POLICY "Owners can manage service categories"
    ON public.service_categories
    FOR ALL
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- Ensure the default categories exist (idempotent)
INSERT INTO public.service_categories (name, label, display_order, is_active) VALUES
    ('darman', 'درمان', 1, true),
    ('shenasname', 'شناسنامه', 2, true),
    ('grooming', 'شستشو و اصلاح', 3, true),
    ('petshop', 'پت‌شاپ', 4, true)
ON CONFLICT (name) DO NOTHING;