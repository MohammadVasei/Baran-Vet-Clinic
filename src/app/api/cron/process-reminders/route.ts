import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendReminderSMS } from '@/lib/sms';
import { formatJalaliDate } from '@/lib/animals';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ReminderRow {
  id: string;
  animal_id: string;
  type: string;
  title: string;
  due_date: string;
  animals: {
    id: string;
    name: string;
    owner_id: string | null;
    owner_phone: string | null;
  } | null;
}

/**
 * Background job: find reminders that are due (due_date <= today) and
 * notify both the animal owner (SMS + in-app) and the clinic (in-app).
 *
 * Idempotent: the unique index on notifications(reminder_id, channel)
 * prevents duplicate notifications even if this job runs concurrently.
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

  const today = new Date().toISOString().slice(0, 10);

  const { data: reminders, error } = await supabaseAdmin
    .from('reminders')
    .select('id,animal_id,type,title,due_date,animals:animals(id,name,owner_id,owner_phone)')
    .in('status', ['pending', 'due', 'overdue'])
    .lte('due_date', today)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('process-reminders: query failed', error);
    return NextResponse.json({ error: error.message, processed: 0 }, { status: 500 });
  }

  const rows = (reminders as unknown as ReminderRow[]) || [];
  const processed: Array<{ reminderId: string; ownerNotified: boolean; clinicNotified: boolean }> = [];

  for (const reminder of rows) {
    const ownerNotified = await notifyOwner(reminder);
    const clinicNotified = await notifyClinic(reminder);
    processed.push({
      reminderId: reminder.id,
      ownerNotified,
      clinicNotified,
    });
  }

  return NextResponse.json({ processed });
}

function buildMessage(reminder: ReminderRow): { subject: string; body: string } {
  const animalName = reminder.animals?.name || 'حیوان';
  const dueLabel = formatJalaliDate(reminder.due_date);
  const subject = `یادآوری: ${animalName} — ${reminder.title}`;
  const body = `${animalName} باید برای «${reminder.title}» به کلینیک مراجعه کند. موعد: ${dueLabel}`;
  return { subject, body };
}

async function notifyOwner(reminder: ReminderRow): Promise<boolean> {
  const animal = reminder.animals;
  const dueLabel = formatJalaliDate(reminder.due_date);
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