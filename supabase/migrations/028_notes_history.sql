-- Migration: 028_notes_history.sql
-- Animal/Booking notes history trail — appends every note save so users
-- and doctors can see the full chronological record.
--
-- Idempotent: safe to re-run.
--
-- entity_type: 'animal' | 'booking'
-- author_id: the authenticated user who saved the note
-- content: the full note text (trimmed)
-- created_at: auto timestamp

-- ============================================================
-- NOTES_HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type text NOT NULL CHECK (entity_type IN ('animal', 'booking')),
    entity_id uuid NOT NULL,
    author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_history_entity ON public.notes_history (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_history_author ON public.notes_history (author_id);

-- Grant authenticated users SELECT (doctors/admins can view history)
GRANT SELECT ON public.notes_history TO authenticated;

-- service_role bypasses RLS
GRANT ALL ON public.notes_history TO service_role;