import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const QuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  doctor_id: z.string(),
  service_id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parsed = QuerySchema.safeParse({
      date: searchParams.get('date'),
      doctor_id: searchParams.get('doctor_id'),
      service_id: searchParams.get('service_id'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'پارامترهای نامعتبر', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { date, doctor_id, service_id } = parsed.data;

    // Look up doctor by key
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .select('id')
      .eq('key', doctor_id)
      .eq('is_active', true)
      .single();

    if (doctorError || !doctor) {
      return NextResponse.json(
        { error: 'پزشک یافت نشد یا غیرفعال است' },
        { status: 404 }
      );
    }

    const doctorId = doctor.id;

    // Get service duration (default 30 min) - lookup by key (for future variable slot intervals)
    if (service_id) {
      const { error: serviceError } = await supabaseAdmin
        .from('services')
        .select('duration_minutes')
        .eq('key', service_id)
        .single();
      if (serviceError) console.error('Service query error:', serviceError);
    }

    // Get doctor's availability blocks for the date (use doctor UUID)
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const { data: blocks, error: blocksError } = await supabaseAdmin
      .from('availability_blocks')
      .select('start_at, end_at')
      .eq('doctor_id', doctorId)
      .lte('start_at', endOfDay.toISOString())
      .gte('end_at', startOfDay.toISOString());

    if (blocksError) console.error('Blocks query error:', blocksError);

    // Get existing bookings for the date (use doctor UUID)
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('booking_time, booking_date')
      .eq('doctor_id', doctorId)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed']);

    if (bookingsError) console.error('Bookings query error:', bookingsError);

    // Generate time slots (9:00 to 20:00, every 30 min)
    const slots: Array<{ time: string; available: boolean }> = [];
    const bookedTimes = new Set(bookings?.map(b => b.booking_time.slice(0, 5)) || []);

    // Parse blocked time ranges
    const blockedRanges: Array<{ start: string; end: string }> = [];
    blocks?.forEach(block => {
      const start = new Date(block.start_at).toISOString().slice(11, 16);
      const end = new Date(block.end_at).toISOString().slice(11, 16);
      blockedRanges.push({ start, end });
    });

    // Generate slots from 09:00 to 20:30
    for (let hour = 9; hour <= 20; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 20 && minute === 30) continue;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Check if slot is blocked
        const isBlocked = blockedRanges.some(range => 
          timeStr >= range.start && timeStr < range.end
        );

        // Check if slot is booked
        const isBooked = bookedTimes.has(timeStr);

        slots.push({
          time: timeStr,
          available: !isBlocked && !isBooked,
        });
      }
    }

    return NextResponse.json({ slots, date, doctor_id });
  } catch (error) {
    console.error('Availability API critical error:', error);
    // Return empty slots instead of 500 error
    return NextResponse.json({ slots: [] });
  }
}