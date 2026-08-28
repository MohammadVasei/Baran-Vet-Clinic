-- Migration: 010_allow_staff_manage_products_stock_images.sql
-- Widen products, stock_levels, and product-image storage management from
-- owner-only to staff (owner is included via is_staff()).
-- Applies the March 2026 RLS boundary decision: staff manage the product
-- catalog and inventory; orders/order_items remain owner-only.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

-- ============================================================
-- 1. public.products — staff can manage (was owner-only)
-- ============================================================
DROP POLICY IF EXISTS "Owners can manage products" ON public.products;

CREATE POLICY "Staff can manage products"
    ON public.products
    FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ============================================================
-- 2. public.stock_levels — staff can manage (was owner-only)
-- ============================================================
DROP POLICY IF EXISTS "Owners can manage stock levels" ON public.stock_levels;

CREATE POLICY "Staff can manage stock levels"
    ON public.stock_levels
    FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ============================================================
-- 3. storage.objects (bucket 'product-images') — staff can upload/update/delete
-- ============================================================
DROP POLICY IF EXISTS "Owners can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete product images" ON storage.objects;

CREATE POLICY "Staff can upload product images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'product-images'
        AND public.is_staff()
    );

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

CREATE POLICY "Staff can delete product images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'product-images'
        AND public.is_staff()
    );

-- ============================================================
-- Sanity check (should return 3 public-product policies:
-- public view, staff view, staff manage)
-- ============================================================
SELECT tablename, policyname, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('products', 'stock_levels')
ORDER BY tablename, policyname;

SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'storage'
  AND policyname LIKE 'Staff can product image%';