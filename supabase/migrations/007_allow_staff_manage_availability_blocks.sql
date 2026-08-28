-- Staff members can create, edit, and remove doctor availability blocks.
CREATE POLICY "Staff can manage availability blocks"
    ON public.availability_blocks
    FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());
