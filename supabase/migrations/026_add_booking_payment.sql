-- Migration: 026_add_booking_payment.sql
-- Booking payments — mock phase.
--
-- One booking stores the price snapshot (amount_rial) plus a payment status
-- so the admin panel can review/track payment per booking. Real gateway
-- integration comes later; for now staff toggle the status manually (mock).
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid'
        CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
    ADD COLUMN IF NOT EXISTS amount_rial bigint;