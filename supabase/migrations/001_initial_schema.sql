-- Migration: 001_initial_schema.sql
-- Core tables for Baran Vet Clinic
-- Run this first in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- STAFF USERS (extends auth.users via trigger)
-- ============================================================
CREATE TABLE public.staff_users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('owner', 'staff')),
    full_name text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- DOCTORS
-- ============================================================
CREATE TABLE public.doctors (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    bio text,
    photo_url text,
    specialties text[],
    display_order int NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE public.services (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    duration_minutes int NOT NULL DEFAULT 30,
    price_rial bigint, -- nullable if not sold online
    category text, -- e.g., 'darman', 'shenasname', 'grooming', 'petshop'
    display_order int NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- DISEASES (educational content articles)
-- ============================================================
CREATE TABLE public.diseases (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_type text NOT NULL CHECK (animal_type IN ('dog', 'cat', 'bird', 'exotic', 'other')),
    category text NOT NULL CHECK (category IN ('infectious', 'chronic')),
    name text NOT NULL,
    symptoms text NOT NULL,
    care text NOT NULL,
    display_order int NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE public.testimonials (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    quote text NOT NULL,
    rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
    animal_type text, -- optional: 'dog', 'cat', 'bird', etc.
    service_type text, -- optional: 'darman', 'grooming', etc.
    is_published boolean NOT NULL DEFAULT true,
    display_order int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- AVAILABILITY BLOCKS (doctor unavailable time ranges)
-- ============================================================
CREATE TABLE public.availability_blocks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    start_at timestamptz NOT NULL,
    end_at timestamptz NOT NULL,
    reason text, -- e.g., 'holiday', 'absence', 'maintenance'
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT availability_blocks_time_order CHECK (end_at > start_at)
);

CREATE INDEX idx_availability_blocks_doctor_time ON public.availability_blocks (doctor_id, start_at, end_at);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE public.bookings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    booking_date date NOT NULL, -- stored as UTC date
    booking_time time NOT NULL, -- stored as UTC time
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    pet_name text,
    pet_type text CHECK (pet_type IN ('dog', 'cat', 'bird', 'exotic', 'other')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    reference_code text NOT NULL UNIQUE,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint to prevent double-booking at DB level
CREATE UNIQUE INDEX idx_bookings_doctor_datetime_unique
    ON public.bookings (doctor_id, booking_date, booking_time)
    WHERE status IN ('pending', 'confirmed');

-- Additional indexes for common queries
CREATE INDEX idx_bookings_date_doctor ON public.bookings (booking_date, doctor_id);
CREATE INDEX idx_bookings_status ON public.bookings (status);
CREATE INDEX idx_bookings_reference ON public.bookings (reference_code);
CREATE INDEX idx_bookings_customer_phone ON public.bookings (customer_phone);

-- ============================================================
-- PRODUCTS (pet-shop catalog)
-- ============================================================
CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    price_rial bigint NOT NULL,
    category text, -- e.g., 'food', 'medicine', 'accessories', 'grooming'
    images text[], -- array of image URLs (Supabase Storage paths)
    is_active boolean NOT NULL DEFAULT true,
    display_order int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- STOCK LEVELS
-- ============================================================
CREATE TABLE public.stock_levels (
    product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
    quantity_on_hand int NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    low_stock_threshold int NOT NULL DEFAULT 5,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_address text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'fulfilled', 'cancelled')),
    zarinpal_authority text, -- ZarinPal payment authority
    zarinpal_ref_id text, -- ZarinPal reference ID after verification
    total_rial bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_zarinpal_authority ON public.orders (zarinpal_authority);
CREATE INDEX idx_orders_customer_phone ON public.orders (customer_phone);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity int NOT NULL CHECK (quantity > 0),
    unit_price_rial bigint NOT NULL, -- price at time of purchase
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON public.order_items (order_id);
CREATE INDEX idx_order_items_product ON public.order_items (product_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_staff_users_updated_at BEFORE UPDATE ON public.staff_users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diseases_updated_at BEFORE UPDATE ON public.diseases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_blocks_updated_at BEFORE UPDATE ON public.availability_blocks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_levels_updated_at BEFORE UPDATE ON public.stock_levels
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();