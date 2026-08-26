-- Read the authenticated user's phone without exposing auth.users to RLS queries.
CREATE OR REPLACE FUNCTION public.current_user_phone()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = auth, public
AS $$
    SELECT phone FROM auth.users WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "Public can view own bookings by phone" ON public.bookings;

CREATE POLICY "Public can view own bookings by phone"
    ON public.bookings
    FOR SELECT
    USING (customer_phone = public.current_user_phone());