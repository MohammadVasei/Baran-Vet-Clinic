import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { canonicalIranianPhone } from '@/lib/phone';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userPhone = user.phone ?? (user.user_metadata?.phone as string | undefined) ?? null;
    if (!userPhone) {
      return NextResponse.json({ bookings: [] });
    }
    const phoneCanonical = canonicalIranianPhone(userPhone);

    // Fetch a window of recent bookings and filter by digit-normalized phone,
    // mirroring how orders are matched (any dialing style matches).
    const { data: allBookings, error } = await supabaseAdmin
      .from('bookings')
      .select(
        'id,service_id,doctor_id,booking_date,booking_time,customer_name,customer_phone,pet_name,pet_type,status,payment_status,amount_rial,reference_code,notes,created_at,service:services(id,name),doctor:doctors(id,name)'
      )
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false })
      .limit(300);

    if (error) {
      console.error('Account bookings error:', error);
      return NextResponse.json({ error: 'خطا در دریافت نوبت‌ها' }, { status: 500 });
    }

    const bookings = (allBookings || []).filter(
      (b) => canonicalIranianPhone(b.customer_phone) === phoneCanonical
    );

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Account bookings API error:', error);
    return NextResponse.json({ error: 'خطای داخلی' }, { status: 500 });
  }
}