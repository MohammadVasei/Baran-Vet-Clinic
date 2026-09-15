import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { canonicalIranianPhone } from '@/lib/phone';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, binding: { params: Promise<{ id: string }> }) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await binding.params;

    const { data: animal, error } = await supabaseAdmin
      .from('animals')
      .select(
        'id,owner_id,owner_phone,name,species_id,breed_id,species:species(id,name),breed:breeds(id,name),sex,date_of_birth,weight,color,microchip_number,neutered,allergies,medical_notes,status,profile_image,created_at'
      )
      .eq('id', id)
      .single();

if (error || !animal) {
      return NextResponse.json({ error: 'حیوان یافت نشد' }, { status: 404 });
    }

    // Check if user is clinic owner or staff
    const { data: staff } = await supabaseAdmin
      .from('staff_users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isStaff = staff && ["owner", "staff"].includes(staff.role);

    // If not staff, check ownership
    if (!isStaff) {
      const userPhone = user.phone ?? (user.user_metadata?.phone as string | undefined) ?? null;
      const owned =
        animal.owner_id === user.id ||
        (!!userPhone && canonicalIranianPhone(userPhone) === canonicalIranianPhone(animal.owner_phone));

      if (!owned) {
        return NextResponse.json({ error: 'حیوان یافت نشد یا به-account شما تعلق ندارد' }, { status: 404 });
      }
    }

    const [recordsRes, remindersRes, historyRes] = await Promise.all([
      supabaseAdmin
        .from('medical_records')
        .select(
          'id,type,title,description,performed_at,next_reminder_date,vaccine:vaccines(id,name),treatment_type:treatment_types(id,name),doctor:doctors(id,name)'
        )
        .eq('animal_id', id)
        .order('performed_at', { ascending: false }),
      supabaseAdmin
        .from('reminders')
        .select('id,type,title,due_date,status,priority')
        .eq('animal_id', id)
        .in('status', ['pending', 'due', 'overdue'])
        .order('due_date', { ascending: true }),
      supabaseAdmin
        .from('notes_history')
        .select('id,entity_type,author_id,content,created_at')
        .eq('entity_type', 'animal')
        .eq('entity_id', id)
        .order('created_at', { ascending: false }),
    ]);

    if (recordsRes.error || remindersRes.error || historyRes.error) {
      console.error('Account animal detail subqueries error:', recordsRes.error, remindersRes.error, historyRes.error);
      return NextResponse.json({ error: 'خطا در دریافت سوابق حیوان' }, { status: 500 });
    }

    return NextResponse.json({
      animal,
      records: recordsRes.data || [],
      reminders: remindersRes.data || [],
      history: historyRes.data || [],
    });
  } catch (error) {
    console.error('Account animal detail API error:', error);
    return NextResponse.json({ error: 'خطای داخلی' }, { status: 500 });
  }
}