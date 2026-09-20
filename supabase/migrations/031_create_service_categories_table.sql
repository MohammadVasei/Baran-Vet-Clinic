-- Migration: 031_create_service_categories_table.sql
-- Service categories lookup table for managing service types

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SERVICE CATEGORIES (lookup table for service types)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL UNIQUE, -- e.g., 'darman', 'shenasname', 'grooming', 'petshop'
    label text NOT NULL, -- Display name in Persian, e.g., 'درمان'
    display_order int NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add updated_at trigger
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON public.service_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for active categories lookup
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON public.service_categories(is_active) WHERE is_active = true;

-- Insert default categories
INSERT INTO public.service_categories (name, label, display_order, is_active) VALUES
    ('darman', 'درمان', 1, true),
    ('shenasname', 'شناسنامه', 2, true),
    ('grooming', 'شستشو و اصلاح', 3, true),
    ('petshop', 'پت‌شاپ', 4, true)
ON CONFLICT (name) DO NOTHING;
