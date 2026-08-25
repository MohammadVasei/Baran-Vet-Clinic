-- Migration: 002_rls_policies.sql
-- Row Level Security policies for Baran Vet Clinic
-- Run this AFTER 001_initial_schema.sql

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Check if current user is an owner
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.staff_users
        WHERE id = auth.uid()
        AND role = 'owner'
    );
$$;

-- Check if current user is staff (owner or staff)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.staff_users
        WHERE id = auth.uid()
        AND role IN ('owner', 'staff')
    );
$$;

-- ============================================================
-- STAFF_USERS POLICIES
-- ============================================================

-- Owners can view all staff users
CREATE POLICY "Owners can view all staff users"
    ON public.staff_users
    FOR SELECT
    USING (public.is_owner());

-- Owners can insert staff users (invite new staff)
CREATE POLICY "Owners can insert staff users"
    ON public.staff_users
    FOR INSERT
    WITH CHECK (public.is_owner());

-- Owners can update staff users (change roles, etc.)
CREATE POLICY "Owners can update staff users"
    ON public.staff_users
    FOR UPDATE
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.staff_users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (name only, not role)
CREATE POLICY "Users can update own profile"
    ON public.staff_users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.staff_users WHERE id = auth.uid()));

-- ============================================================
-- DOCTORS POLICIES
-- ============================================================

-- Public can view active doctors (for booking)
CREATE POLICY "Public can view active doctors"
    ON public.doctors
    FOR SELECT
    USING (is_active = true);

-- Staff can view all doctors (including inactive)
CREATE POLICY "Staff can view all doctors"
    ON public.doctors
    FOR SELECT
    USING (public.is_staff());

-- Owners can insert/update/delete doctors
CREATE POLICY "Owners can manage doctors"
    ON public.doctors
    FOR ALL
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- ============================================================
-- SERVICES POLICIES
-- ============================================================

-- Public can view active services (for booking)
CREATE POLICY "Public can view active services"
    ON public.services
    FOR SELECT
    USING (is_active = true);

-- Staff can view all services
CREATE POLICY "Staff can view all services"
    ON public.services
    FOR SELECT
    USING (public.is_staff());

-- Owners can manage services
CREATE POLICY "Owners can manage services"
    ON public.services
    FOR ALL
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- ============================================================
-- DISEASES POLICIES
-- ============================================================

-- Public can view published diseases
CREATE POLICY "Public can view published diseases"
    ON public.diseases
    FOR SELECT
    USING (is_published = true);

-- Staff can view all diseases
CREATE POLICY "Staff can view all diseases"
    ON public.diseases
    FOR SELECT
    USING (public.is_staff());

-- Owners can manage diseases
CREATE POLICY "Owners can manage diseases"
    ON public.diseases
    FOR ALL
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- ============================================================
-- TESTIMONIALS POLICIES
-- ============================================================

-- Public can view published testimonials
CREATE POLICY "Public can view published testimonials"
    ON public.testimonials
    FOR SELECT
    USING (is_published = true);

-- Staff can view all testimonials
CREATE POLICY "Staff can view all testimonials"
    ON public.testimonials
    FOR SELECT
    USING (public.is_staff());

-- Owners can manage testimonials
CREATE POLICY "Owners can manage testimonials"
    ON public.testimonials
    FOR ALL
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- ============================================================
-- AVAILABILITY_BLOCKS POLICIES
-- ============================================================

-- Public can view availability blocks (to show unavailable slots)
CREATE POLICY "Public can view availability blocks"
    ON public.availability_blocks
    FOR SELECT
    USING (true);

-- Staff can view all availability blocks
CREATE POLICY "Staff can view all availability blocks"
    ON public.availability_blocks
    FOR SELECT
    USING (public.is_staff());

-- Owners can manage availability blocks
CREATE POLICY "Owners can manage availability blocks"
    ON public.availability_blocks
    FOR ALL
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- ============================================================
-- BOOKINGS POLICIES
-- ============================================================

-- Public can INSERT bookings (create new bookings)
CREATE POLICY "Public can create bookings"
    ON public.bookings
    FOR INSERT
    WITH CHECK (true);

-- Public can view their own bookings by phone
CREATE POLICY "Public can view own bookings by phone"
    ON public.bookings
    FOR SELECT
    USING (customer_phone = (SELECT phone FROM auth.users WHERE id = auth.uid()));

-- Staff can view ALL bookings
CREATE POLICY "Staff can view all bookings"
    ON public.bookings
    FOR SELECT
    USING (public.is_staff());

-- Staff can UPDATE bookings (confirm, cancel, complete)
CREATE POLICY "Staff can update bookings"
    ON public.bookings
    FOR UPDATE
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- Owners can delete bookings (if needed)
CREATE POLICY "Owners can delete bookings"
    ON public.bookings
    FOR DELETE
    USING (public.is_owner());

-- ============================================================
-- PRODUCTS POLICIES
-- ============================================================

-- Public can view active products
CREATE POLICY "Public can view active products"
    ON public.products
    FOR SELECT
    USING (is_active = true);

-- Staff can view all products
CREATE POLICY "Staff can view all products"
    ON public.products
    FOR SELECT
    USING (public.is_staff());

-- Owners can manage products
CREATE POLICY "Owners can manage products"
    ON public.products
    FOR ALL
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- ============================================================
-- STOCK_LEVELS POLICIES
-- ============================================================

-- Public can view stock levels (for availability display)
CREATE POLICY "Public can view stock levels"
    ON public.stock_levels
    FOR SELECT
    USING (true);

-- Staff can view all stock levels
CREATE POLICY "Staff can view all stock levels"
    ON public.stock_levels
    FOR SELECT
    USING (public.is_staff());

-- Owners can manage stock levels
CREATE POLICY "Owners can manage stock levels"
    ON public.stock_levels
    FOR ALL
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- ============================================================
-- ORDERS POLICIES
-- ============================================================

-- Public can INSERT orders (create new orders)
CREATE POLICY "Public can create orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (true);

-- Public can view their own orders by phone
CREATE POLICY "Public can view own orders by phone"
    ON public.orders
    FOR SELECT
    USING (customer_phone = (SELECT phone FROM auth.users WHERE id = auth.uid()));

-- Staff can view all orders
CREATE POLICY "Staff can view all orders"
    ON public.orders
    FOR SELECT
    USING (public.is_staff());

-- Owners can UPDATE orders (mark fulfilled, etc.) - financial data
CREATE POLICY "Owners can update orders"
    ON public.orders
    FOR UPDATE
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- Staff can UPDATE orders for fulfillment (but not financial fields)
-- Note: This is a simplified policy. In practice, you may want more granular column-level control.
CREATE POLICY "Staff can update orders for fulfillment"
    ON public.orders
    FOR UPDATE
    USING (public.is_staff() AND status IN ('paid', 'fulfilled'))
    WITH CHECK (public.is_staff() AND status IN ('paid', 'fulfilled'));

-- ============================================================
-- ORDER_ITEMS POLICIES
-- ============================================================

-- Public can view their own order items
CREATE POLICY "Public can view own order items"
    ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND o.customer_phone = (SELECT phone FROM auth.users WHERE id = auth.uid())
        )
    );

-- Staff can view all order items
CREATE POLICY "Staff can view all order items"
    ON public.order_items
    FOR SELECT
    USING (public.is_staff());

-- Owners can manage order items
CREATE POLICY "Owners can manage order items"
    ON public.order_items
    FOR ALL
    USING (public.is_owner())
    WITH CHECK (public.is_owner());