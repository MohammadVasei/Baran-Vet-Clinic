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

    const { data: animal, error: animalError } = await supabaseAdmin
      .from('animals')
      .select('id,owner_id,owner_phone')
      .eq('id', id)
      .single();

if (animalError || !animal) {
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

    const { data: history, error } = await supabaseAdmin
      .from('notes_history')
      .select('id,entity_type,author_id,content,created_at')
      .eq('entity_type', 'animal')
      .eq('entity_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Notes history fetch error:', error);
      return NextResponse.json({ error: 'خطا در دریافت تاریخچه' }, { status: 500 });
    }

    return NextResponse.json({ history: history || [] });
  } catch (error) {
    console.error('Notes history API error:', error);
    return NextResponse.json({ error: 'خطای داخلی' }, { status: 500 });
  }
}