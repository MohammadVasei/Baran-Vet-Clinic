-- Migration: 004_add_keys_to_doctors_services.sql
-- Add 'key' column to doctors and services for frontend lookup
-- Run this AFTER 001_initial_schema.sql and 002_rls_policies.sql

-- ============================================================
-- DOCTORS: Add key column (unique slug for frontend lookup)
-- ============================================================
ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS key text UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_doctors_key ON public.doctors (key);

-- ============================================================
-- SERVICES: Add key column (unique slug for frontend lookup)
-- ============================================================
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS key text UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_services_key ON public.services (key);

-- ============================================================
-- Populate keys for existing data
-- ============================================================

-- Update doctors with known keys
UPDATE public.doctors SET key = 'dr-tazik' WHERE name ILIKE '%tazik%' OR name ILIKE '%محمد ابراهیم تازیک%';
UPDATE public.doctors SET key = 'dr-vasei' WHERE name ILIKE '%vasei%' OR name ILIKE '%رضا واسعی%';
UPDATE public.doctors SET key = 'moghan-jahani' WHERE name ILIKE '%moghan%' OR name ILIKE '%مژگان جهانی%';

-- Update services with known keys
UPDATE public.services SET key = 'darman' WHERE category = 'darman' OR name ILIKE '%ویزیت%';
UPDATE public.services SET key = 'shenasname' WHERE category = 'shenasname' OR name ILIKE '%شناسنامه%';
UPDATE public.services SET key = 'grooming' WHERE category = 'grooming' OR name ILIKE '%شستشو%' OR name ILIKE '%گرومینگ%';
UPDATE public.services SET key = 'petshop' WHERE category = 'petshop' OR name ILIKE '%پت‌شاپ%' OR name ILIKE '%petshop%';

-- ============================================================
-- Make key NOT NULL after populating (optional, do after verifying data)
-- ============================================================
-- ALTER TABLE public.doctors ALTER COLUMN key SET NOT NULL;
-- ALTER TABLE public.services ALTER COLUMN key SET NOT NULL;