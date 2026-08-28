-- Migration: 009_create_products_storage.sql
-- Create Supabase Storage bucket for product images
-- Run this AFTER all table migrations

-- Create the storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES FOR product-images BUCKET
-- ============================================================

-- Allow public read access to product images
CREATE POLICY "Public can view product images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'product-images');

-- Allow staff (and owners) to upload product images
CREATE POLICY "Staff can upload product images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'product-images'
        AND public.is_staff()
    );

-- Allow staff (and owners) to update product images
CREATE POLICY "Staff can update product images"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'product-images'
        AND public.is_staff()
    )
    WITH CHECK (
        bucket_id = 'product-images'
        AND public.is_staff()
    );

-- Allow staff (and owners) to delete product images
CREATE POLICY "Staff can delete product images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'product-images'
        AND public.is_staff()
    );