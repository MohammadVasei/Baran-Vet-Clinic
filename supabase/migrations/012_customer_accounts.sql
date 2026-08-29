-- Migration: 012_customer_accounts.sql
-- Customer accounts, addresses, and order linking
-- Run this AFTER all previous migrations

-- ============================================================
-- CUSTOMER ADDRESSES
-- ============================================================
CREATE TABLE public.customer_addresses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label text, -- 'خانه', 'محل کار', etc.
    recipient_name text NOT NULL,
    recipient_phone text NOT NULL,
    province text NOT NULL,
    city text NOT NULL,
    address_line text NOT NULL,
    postal_code text,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure only one default address per user
CREATE UNIQUE INDEX idx_customer_addresses_one_default 
    ON public.customer_addresses (user_id) 
    WHERE is_default = true;

-- Index for faster lookups
CREATE INDEX idx_customer_addresses_user_id ON public.customer_addresses (user_id);

-- ============================================================
-- RLS POLICIES FOR CUSTOMER ADDRESSES
-- ============================================================
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Users can manage their own addresses
CREATE POLICY "Users can manage own addresses"
    ON public.customer_addresses
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- UPDATE ORDERS TABLE: Add user_id FK (nullable, for linked accounts)
-- NOTE: orders.user_id was required by pre-existing Phase 6 code but was never
-- added in migration 001. Create it here so everything is self-contained.
-- ============================================================
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);

-- ============================================================
-- UPDATE ORDERS RLS: Users can view their orders via user_id OR phone
-- ============================================================
DROP POLICY IF EXISTS "Public can view own orders by phone" ON public.orders;

CREATE POLICY "Users view own orders"
    ON public.orders
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        customer_phone = (SELECT phone FROM auth.users WHERE id = auth.uid())
    );

-- Users can insert orders (guest or authenticated)
-- This already exists: "Public can create orders"

-- ============================================================
-- ORDER ITEMS RLS: Users can view their own order items
-- ============================================================
DROP POLICY IF EXISTS "Public can view own order items" ON public.order_items;

CREATE POLICY "Users view own order items"
    ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (o.user_id = auth.uid() OR o.customer_phone = (SELECT phone FROM auth.users WHERE id = auth.uid()))
        )
    );

-- ============================================================
-- UPDATED_AT TRIGGER FOR CUSTOMER_ADDRESSES
-- ============================================================
CREATE TRIGGER update_customer_addresses_updated_at
    BEFORE UPDATE ON public.customer_addresses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_addresses TO service_role;

COMMENT ON TABLE public.customer_addresses IS 'Customer shipping addresses with Persian address fields';