-- Migration: 016_add_shipping_to_orders.sql
-- Add shipping and tracking fields to orders table
-- Idempotent: safe to re-run (this was already applied to the live DB once).

-- ============================================================
-- ADD NEW COLUMNS TO public.orders
-- ============================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_method text NOT NULL DEFAULT 'flat_rate';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- ============================================================
-- CHECK CONSTRAINT (guarded so re-runs are a no-op)
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'orders_shipping_method_check'
          AND conrelid = 'public.orders'::regclass
    ) THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_shipping_method_check
            CHECK (shipping_method IN ('flat_rate', 'free_over_threshold', 'pickup_at_clinic'));
    END IF;
END $$;

-- ============================================================
-- ADD INDEXES FOR NEW COLUMNS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_orders_shipping_method ON public.orders (shipping_method);
CREATE INDEX IF NOT EXISTS idx_orders_courier ON public.orders (courier);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders (tracking_number);

-- ============================================================
-- UPDATE update_updated_at_column trigger already handles
-- updated_at automatically — no additional trigger needed
-- ============================================================