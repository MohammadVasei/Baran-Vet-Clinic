import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';
import { sendBookingSMS } from '@/lib/sms';

const BookingSchema = z.object({
  service_id: z.string('شناسه hizmet نامعتبر'),
  doctor_id: z.string('شناسه physician نامعتبر'),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'فرمت تاریخ نامعتبر (YYYY-MM-DD)'),
  booking_time: z.string().regex(/^\d{2}:\d{2}$/, 'فرمت ساعت نامعتبر (HH:MM)'),
  customer_name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد').max(100),
  customer_phone: z.string().regex(/^0?\d{10,11}$/, 'شماره تلفن معتبر نیست'),
  pet_name: z.string().max(100).optional(),
  pet_type: z.enum(['dog', 'cat', 'bird', 'exotic', 'other']).optional(),
});

function generateReferenceCode(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BARAN-${dateStr}-${random}`;
}

function normalizePhone(phone: string): string {
  const faToEn = phone.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
  return faToEn.replace(/[^\d]/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = BookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'داده‌های نامعتبر', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const phone = normalizePhone(data.customer_phone);

    // Verify doctor exists and is active (lookup by key slug first, then by UUID)
    const { data: doctorByKey } = await supabaseAdmin
      .from('doctors')
      .select('id, name')
      .eq('key', data.doctor_id)
      .eq('is_active', true)
      .maybeSingle();

    const doctor = doctorByKey
      ? doctorByKey
      : (await supabaseAdmin
          .from('doctors')
          .select('id, name')
          .eq('id', data.doctor_id)
          .eq('is_active', true)
          .maybeSingle()).data;

    if (!doctor) {
      return NextResponse.json(
        { error: 'پزشک یافت نشد یا غیرفعال است' },
        { status: 404 }
      );
    }

    // Verify service exists (lookup by key)
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('id, name, duration_minutes, doctor_id')
      .eq('key', data.service_id)
      .eq('is_active', true)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'خدمت یافت نشد یا غیرفعال است' },
        { status: 404 }
      );
    }

    const bookingDoctorId = service.doctor_id || doctor.id;
    const bookingDoctor = service.doctor_id && service.doctor_id !== doctor.id
      ? await supabaseAdmin.from('doctors').select('id, name').eq('id', service.doctor_id).single()
      : { data: doctor, error: null };
    if (bookingDoctor.error || !bookingDoctor.data) {
      return NextResponse.json({ error: 'پزشک مسئول خدمت یافت نشد' }, { status: 404 });
    }

    // Check if slot is still available (race condition protection) - use doctor UUID
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('doctor_id', bookingDoctorId)
      .eq('booking_date', data.booking_date)
      .eq('booking_time', data.booking_time)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing) {
      return NextResponse.json(
        { error: 'این بازه زمانی رزرو شده است. لطفاً زمان دیگری انتخاب کنید.' },
        { status: 409 }
      );
    }

    // Check availability blocks (use doctor UUID)
    const startAt = new Date(`${data.booking_date}T${data.booking_time}:00.000Z`);
    const endAt = new Date(startAt.getTime() + (service.duration_minutes || 30) * 60 * 1000);

    const { data: blocks, error: blocksError } = await supabaseAdmin
      .from('availability_blocks')
      .select('id')
      .eq('doctor_id', bookingDoctorId)
      .lte('start_at', endAt.toISOString())
      .gte('end_at', startAt.toISOString())
      .maybeSingle();

    if (blocksError) throw blocksError;
    if (blocks) {
      return NextResponse.json(
        { error: 'پزشک در این بازه زمانی در دسترس نیست' },
        { status: 409 }
      );
    }

    // Create booking
    const referenceCode = generateReferenceCode();
    const { data: booking, error: insertError } = await supabaseAdmin
      .from('bookings')
      .insert({
        service_id: service.id,
        doctor_id: bookingDoctorId,
        booking_date: data.booking_date,
        booking_time: data.booking_time,
        customer_name: data.customer_name.trim(),
        customer_phone: phone,
        pet_name: data.pet_name?.trim() || null,
        pet_type: data.pet_type || null,
        status: 'pending',
        reference_code: referenceCode,
      })
      .select()
      .single();

    if (insertError) {
      // Check for unique constraint violation (race condition)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'این بازه زمانی تازه رزرو شده است. لطفاً زمان دیگری انتخاب کنید.' },
          { status: 409 }
        );
      }
      throw insertError;
    }

    // Send SMS (non-blocking)
    sendBookingSMS({
      phone,
      referenceCode,
      serviceName: service.name,
      doctorName: bookingDoctor.data.name,
      date: data.booking_date,
      time: data.booking_time,
      customerName: data.customer_name,
    }).catch(err => console.error('SMS send failed:', err));

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        reference_code: booking.reference_code,
        service_name: service.name,
        doctor_name: bookingDoctor.data.name,
        date: booking.booking_date,
        time: booking.booking_time,
      },
    });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت نوبت. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}