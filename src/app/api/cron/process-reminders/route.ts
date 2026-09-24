import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendReminderSMS } from '@/lib/sms';
import { formatJalaliDate, formatJalaliTime } from '@/lib/animals';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ReminderRow {
  id: string;
  animal_id: string;
  type: string;
  title: string;
  due_date: string;
  due_time: string | null;
  status: string;
  animals: {
    id: string;
    name: string;
    owner_id: string | null;
    owner_phone: string | null;
  } | null;
}

const DEFAULT_DUE_TIME = '09:00';

/** Fallback time-of-day when a row predates the due_time column. */
function dueTimeOf(reminder: ReminderRow): string {
  return reminder.due_time || DEFAULT_DUE_TIME;
}

/**
 * Current wall-clock in the clinic's timezone (Asia/Tehran).
 * Returns the date as YYYY-MM-DD and time as HH:MM:SS so they compare
 * lexicographically with the stored due_date / due_time values.
 */
function tehranClock(now: Date = new Date()): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}:${get('second')}`,
  };
}

/**
 * Time-based status transition for an active reminder:
 *   - past the due day  → overdue
 *   - due day, past due_time → due
 *   - otherwise         → pending (not actionable yet)
 */
function computeStatus(reminder: ReminderRow, tehranDate: string, tehranTime: string): ReminderRow['status'] {
  if (tehranDate > reminder.due_date) return 'overdue';
  if (tehranDate === reminder.due_date && tehranTime >= dueTimeOf(reminder)) return 'due';
  return 'pending';
}

/**
 * Background job (runs on a schedule, e.g. Vercel Cron):
 *   1. advances each active reminder's status by the clinic clock
 *      (pending → due at due_time, → overdue the day after),
 *   2. notifies the owner (SMS + in-app) and the clinic (in-app) only once the
 *      reminder's due time has passed.
 *
 * Idempotent: the unique index on notifications(reminder_id, channel)
 * prevents duplicate notifications even if this job runs twice.
 */
export async function GET(request: Request) {
  // If a cron secret is configured, require it (Vercel Cron pattern).
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const { date: today, time: now } = tehranClock();

  // Only scan reminders whose due DAY has arrived; earlier ones stay pending.
  const { data: reminders, error } = await supabaseAdmin
    .from('reminders')
    .select('id,animal_id,type,title,due_date,due_time,status,animals:animals(id,name,owner_id,owner_phone)')
    .in('status', ['pending', 'due', 'overdue'])
    .lte('due_date', today)
    .order('due_date', { ascending: true })
    .order('due_time', { ascending: true });

  if (error) {
    console.error('process-reminders: query failed', error);
    return NextResponse.json({ error: error.message, processed: 0 }, { status: 500 });
  }

  const rows = (reminders as unknown as ReminderRow[]) || [];
  const processed: Array<{ reminderId: string; status: string; ownerNotified: boolean; clinicNotified: boolean }> = [];

  for (const reminder of rows) {
    const next = computeStatus(reminder, today, now);

    // Persist the transition so the UI reflects the real due state.
    if (next !== reminder.status) {
      const { error: updateError } = await supabaseAdmin
        .from('reminders')
        .update({ status: next })
        .eq('id', reminder.id);
      if (updateError) console.error('process-reminders: status update failed', reminder.id, updateError);
    }

    // Notify only once the reminder is actually due/overdue (time reached).
    const actionable = next === 'due' || next === 'overdue';
    const ownerNotified = actionable ? await notifyOwner(reminder) : false;
    const clinicNotified = actionable ? await notifyClinic(reminder) : false;

    processed.push({ reminderId: reminder.id, status: next, ownerNotified, clinicNotified });
  }

  return NextResponse.json({ processed });
}

function buildMessage(reminder: ReminderRow): { subject: string; body: string } {
  const animalName = reminder.animals?.name || 'حیوان';
  const dueLabel = formatReminderDueLabel(reminder);
  const subject = `یادآوری: ${animalName} — ${reminder.title}`;
  const body = `${animalName} باید برای «${reminder.title}» به کلینیک مراجعه کند. موعد: ${dueLabel}`;
  return { subject, body };
}

function formatReminderDueLabel(reminder: ReminderRow): string {
  const date = formatJalaliDate(reminder.due_date);
  const time = formatJalaliTime(reminder.due_time);
  return time ? `${date}، ساعت ${time}` : date;
}

async function notifyOwner(reminder: ReminderRow): Promise<boolean> {
  const animal = reminder.animals;
  const dueLabel = formatReminderDueLabel(reminder);
  const { subject, body } = buildMessage(reminder);

  // 1. In-app notification for the authenticated owner
  if (animal?.owner_id) {
    const { error } = await supabaseAdmin.from('notifications').insert({
      user_id: animal.owner_id,
      reminder_id: reminder.id,
      channel: 'in_app',
      subject,
      body,
    });
    if (error) console.error('notifyOwner: in_app failed', reminder.id, error);
  }

  // 2. SMS to the owner's phone (works for walk-in owners too)
  const phone = animal?.owner_phone;
  if (phone) {
    await sendReminderSMS({
      phone,
      animalName: animal.name,
      treatmentName: reminder.title,
      dueDateLabel: dueLabel,
    });
    // Idempotency for the SMS channel via the unique index
    const { error } = await supabaseAdmin.from('notifications').insert({
      user_id: animal.owner_id || '00000000-0000-0000-0000-000000000000',
      reminder_id: reminder.id,
      channel: 'sms',
      subject,
      body,
    });
    if (error && !String(error.code).startsWith('23')) {
      console.error('notifyOwner: sms marker failed', reminder.id, error);
    }
  }

  return true;
}

async function notifyClinic(reminder: ReminderRow): Promise<boolean> {
  const { subject, body } = buildMessage(reminder);

  // Notify every staff member (owner + staff) via in-app notification.
  const { data: staff, error: staffError } = await supabaseAdmin
    .from('staff_users')
    .select('id');

  if (staffError || !staff?.length) {
    if (staffError) console.error('notifyClinic: staff query failed', staffError);
    return false;
  }

  const rows = staff.map((member) => ({
    user_id: member.id,
    reminder_id: reminder.id,
    channel: 'in_app' as const,
    subject,
    body,
  }));

  const { error } = await supabaseAdmin.from('notifications').insert(rows);
  if (error && !String(error.code).startsWith('23')) {
    console.error('notifyClinic: insert failed', reminder.id, error);
    return false;
  }
  return true;
}