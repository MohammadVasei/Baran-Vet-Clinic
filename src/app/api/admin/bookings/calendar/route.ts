import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date_gte = searchParams.get('date_gte');
    const date_lte = searchParams.get('date_lte');

    if (!date_gte || !date_lte) {
      return NextResponse.json(
        { error: 'date_gte and date_lte are required' },
        { status: 400 }
      );
    }

    // Get booked dates from bookings
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('booking_date')
      .gte('booking_date', date_gte)
      .lte('booking_date', date_lte)
      .in('status', ['pending', 'confirmed']);

    if (bookingsError) throw bookingsError;

    // Get blocked dates from availability_blocks
    const { data: blocks, error: blocksError } = await supabaseAdmin
      .from('availability_blocks')
      .select('start_at, end_at')
      .lte('start_at', new Date(date_lte).toISOString())
      .gte('end_at', new Date(date_gte).toISOString());

    if (blocksError) throw blocksError;

    // Extract unique booked dates
    const bookedDates = [...new Set(bookings?.map(b => b.booking_date) || [])];

    // Extract blocked dates (expand ranges)
    const blockedDatesSet = new Set<string>();
    blocks?.forEach(block => {
      const start = new Date(block.start_at);
      const end = new Date(block.end_at);
      const current = new Date(start);
      
      while (current <= end) {
        const dateStr = current.toISOString().slice(0, 10);
        if (dateStr >= date_gte && dateStr <= date_lte) {
          blockedDatesSet.add(dateStr);
        }
        current.setDate(current.getDate() + 1);
      }
    });

    return NextResponse.json({
      booked: bookedDates,
      blocked: [...blockedDatesSet],
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت داده‌های تقویم' },
      { status: 500 }
    );
  }
}