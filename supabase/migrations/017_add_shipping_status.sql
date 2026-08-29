-- Migration: 017_add_shipping_status.sql
-- Extend order status lifecycle with shipping stages and allow staff to
-- progress pending → processing → shipped → delivered → fulfilled.

-- ============================================================
-- WIDEN STATUS CHECK CONSTRAINT
-- ============================================================
-- The inline CHECK created in 001 was auto-named `orders_status_check`.
-- Drop (if present) and recreate with the full lifecycle, so statuses like
-- "processing" / "shipped" / "delivered" (used by the admin order + courier
-- screens) are valid.

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending', 'paid', 'failed', 'processing', 'shipped', 'delivered', 'fulfilled', 'cancelled'));

-- ============================================================
-- RLS: STAFF ORDER FULFILLMENT PROGRESSION
-- ============================================================
-- Old policy (002) restricted staff to status IN ('paid','fulfilled'), which
-- blocked the shipping transitions. Replace it so staff can advance an order
-- through the fulfillment pipeline (owners keep full control via is_owner()).

DROP POLICY IF EXISTS "Staff can update orders for fulfillment" ON public.orders;

CREATE POLICY "Staff can update orders for fulfillment"
    ON public.orders
    FOR UPDATE
    USING (public.is_staff() AND status IN ('pending', 'processing', 'shipped'))
    WITH CHECK (public.is_staff() AND status IN ('processing', 'shipped', 'delivered', 'fulfilled'));