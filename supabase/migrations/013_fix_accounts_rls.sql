-- Migration: 013_fix_accounts_rls.sql
-- Fixes surfaced by the Phase 7 end-to-end test:
--
-- 1) orders / order_items were NEVER GRANTed SELECT to anon + authenticated.
--    Policies existed, but without table privileges every authenticated user
--    hit error 42501 / HTTP 403 when loading their orders — so /account/orders
--    could never render data.
--
-- 2) Phone normalization mismatch: checkout stored "0912..." while
--    `link-orders` and the RLS phone fallback compared against
--    auth.users.phone ("+98912..."), so orders were never linkable and the
--    "view own orders by phone" fallback never matched. Policies now compare
--    digit-only forms so any dialing style matches.
--
-- Run AFTER migration 012. Safe to re-run.

-- ============================================================
-- GRANTS
-- ============================================================
GRANT SELECT ON public.orders TO anon;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO anon;
GRANT SELECT ON public.order_items TO authenticated;

-- ============================================================
-- ORDERS: view own orders via user_id OR normalized phone
-- ============================================================
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;

CREATE POLICY "Users view own orders"
    ON public.orders
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR regexp_replace(customer_phone, '\D', '', 'g')
           = regexp_replace(coalesce((SELECT phone FROM auth.users WHERE id = auth.uid()), ''), '\D', '', 'g')
    );

-- ============================================================
-- ORDER ITEMS: view items of own orders (mirrors orders policy)
-- ============================================================
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;

CREATE POLICY "Users view own order items"
    ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (
                o.user_id = auth.uid()
                OR regexp_replace(o.customer_phone, '\D', '', 'g')
                   = regexp_replace(coalesce((SELECT phone FROM auth.users WHERE id = auth.uid()), ''), '\D', '', 'g')
            )
        )
    );