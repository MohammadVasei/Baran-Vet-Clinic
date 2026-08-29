-- Migration: 015_add_is_featured_to_products.sql
-- Adds an `is_featured` boolean column to the products table so marketing
-- sections (e.g. the home page PetshopBanner) can flag products for display.

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Useful index if admins ever list/filter by featured status at scale.
CREATE INDEX IF NOT EXISTS idx_products_is_featured
    ON public.products (is_featured)
    WHERE is_featured = true;
