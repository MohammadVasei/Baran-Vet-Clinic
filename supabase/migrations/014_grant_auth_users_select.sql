-- Migration: 014_grant_auth_users_select.sql
-- The RLS phone-fallback policies created in 013 compare customer_phone against
-- (SELECT phone FROM auth.users WHERE id = auth.uid()). Both anon and
-- authenticated need SELECT on auth.users for those policies to execute;
-- without it, every order SELECT errored with 42501 permission denied.
--
-- The auth schema is internal (not exposed via PostgREST), so this only
-- enables the policy lookup — it does not open a new public endpoint.

GRANT SELECT ON auth.users TO anon;
GRANT SELECT ON auth.users TO authenticated;

-- Sanity: drop + recreate not needed; policies from 013 remain in place.