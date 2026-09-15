import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { canonicalIranianPhone } from '@/lib/phone';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const NotesSchema = z.object({
  notes: z.string().max(1000).optional().nullable(),
});

async function getOwnedBooking(binding: { params: Promise<{ id: string }> }) {
  const serverClient = await createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return { user: null, booking: null };

  const { id } = await binding.params;

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select(
      'id,service_id,doctor_id,booking_date,booking_time,customer_name,customer_phone,pet_name,pet_type,status,payment_status,amount_rial,reference_code,notes,created_at,service:services(id,name),doctor:doctors(id,name)'
    )
    .eq('id', id)
    .single();

  if (error) return { user, booking: null };

  const userPhone = user.phone ?? (user.user_metadata?.phone as string | undefined) ?? null;
  const owned =
    userPhone &&
    canonicalIranianPhone(userPhone) === canonicalIranianPhone(booking.customer_phone);

  return { user, booking: owned ? booking : null };
}

export async function GET(_request: NextRequest, binding: { params: Promise<{ id: string }> }) {
  try {
    const { booking } = await getOwnedBooking(binding);
    if (!booking) {
      return NextResponse.json({ error: 'نوبت یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Account booking GET error:', error);
    return NextResponse.json({ error: 'خطای داخلی' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, binding: { params: Promise<{ id: string }> }) {
  try {
    const { user, booking } = await getOwnedBooking(binding);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!booking) return NextResponse.json({ error: 'نوبت یافت نشد' }, { status: 404 });

    const body = await request.json();
    const parsed = NotesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'داده نامعتبر' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ notes: parsed.data.notes ?? null, updated_at: new Date().toISOString() })
      .eq('id', booking.id);

    if (error) {
      console.error('Account booking notes error:', error);
      return NextResponse.json({ error: 'خطا در ذخیره یادداشت' }, { status: 500 });
    }

    // Append to history
    await supabaseAdmin
      .from('notes_history')
      .insert({
        entity_type: 'booking',
        entity_id: booking.id,
        author_id: user.id,
        content: parsed.data.notes ?? '',
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account booking PUT error:', error);
    return NextResponse.json({ error: 'خطای داخلی' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, binding: { params: Promise<{ id: string }> }) {
  try {
    const { user, booking } = await getOwnedBooking(binding);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!booking) return NextResponse.json({ error: 'نوبت یافت نشد' }, { status: 404 });

    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'این نوبت قابل لغو نیست' }, { status: 409 });
    }

    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', booking.id);

    if (error) {
      console.error('Account booking cancel error:', error);
      return NextResponse.json({ error: 'خطا در لغو نوبت' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account booking cancel API error:', error);
    return NextResponse.json({ error: 'خطای داخلی' }, { status: 500 });
  }
}