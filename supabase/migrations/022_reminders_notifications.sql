-- Migration: 022_reminders_notifications.sql
-- Animal medical log — reminder engine data + notifications.
--
-- Reminders track per-animal care that is due (vaccinations, deworming,
-- checkups, ...). They can be created manually or automatically from a
-- medical record / protocol. Statuses reflect the real life-cycle:
--   pending → due → overdue → completed (or cancelled).
--
-- ReminderRules configure *when* to warn (days before the due date), so the
-- clinic decides the schedule instead of the application. Notifications hold
-- the delivered messages (in-app / sms / email) linked to a reminder.
--
-- Idempotent: safe to re-run. Apply alongside 019–021 + 023+.

-- ============================================================
-- REMINDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reminders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
    medical_record_id uuid REFERENCES public.medical_records(id) ON DELETE SET NULL,
    type text NOT NULL DEFAULT 'other'
        CHECK (type IN (
            'vaccination', 'deworming', 'checkup', 'medication', 'treatment', 'other'
        )),
    title text NOT NULL,
    description text,
    due_date date NOT NULL,
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'due', 'overdue', 'completed', 'cancelled')),
    priority text NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('normal', 'important', 'urgent')),
    repeat_interval_days int, -- NULL = one-off reminder
    notification_date date, -- computed: due_date - nearest reminder rule
    completed_at timestamptz,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_animal_id ON public.reminders (animal_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON public.reminders (due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders (status);
CREATE INDEX IF NOT EXISTS idx_reminders_animal_status ON public.reminders (animal_id, status);
CREATE INDEX IF NOT EXISTS idx_reminders_medical_record_id ON public.reminders (medical_record_id);

-- ============================================================
-- REMINDER_RULES (clinic-configured notification schedule)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reminder_rules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id uuid REFERENCES public.medical_protocols(id) ON DELETE CASCADE,
    days_before int NOT NULL DEFAULT 30,
    notification_type text NOT NULL DEFAULT 'in_app'
        CHECK (notification_type IN ('in_app', 'sms', 'email')),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT reminder_rules_days_before_positive CHECK (days_before >= 0)
);

CREATE INDEX IF NOT EXISTS idx_reminder_rules_protocol_id ON public.reminder_rules (protocol_id);

-- ============================================================
-- NOTIFICATIONS (delivered messages, per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_id uuid REFERENCES public.reminders(id) ON DELETE SET NULL,
    channel text NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'sms', 'email')),
    subject text NOT NULL,
    body text,
    sent_at timestamptz NOT NULL DEFAULT now(),
    read_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
    ON public.notifications (user_id, read_at);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON public.reminders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminder_rules_updated_at BEFORE UPDATE ON public.reminder_rules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();