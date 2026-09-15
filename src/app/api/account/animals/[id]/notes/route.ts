import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { canonicalIranianPhone } from '@/lib/phone';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const NotesSchema = z.object({
  notes: z.string().max(2000).optional().nullable(),
});

async function getOwnedAnimal(binding: { params: Promise<{ id: string }> }) {
  const serverClient = await createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return { user: null, animal: null };

  const { id } = await binding.params;

  const { data: animal, error } = await supabaseAdmin
    .from('animals')
    .select('id,owner_id,owner_phone')
    .eq('id', id)
    .single();

  if (error) return { user, animal: null };

  // Check if user is clinic owner or staff
  const { data: staff } = await supabaseAdmin
    .from('staff_users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isStaff = staff && ["owner", "staff"].includes(staff.role);

  // If staff, bypass ownership check; otherwise check normally
  if (isStaff) {
    return { user, animal };
  }

  const userPhone = user.phone ?? (user.user_metadata?.phone as string | undefined) ?? null;
  const owned =
    animal.owner_id === user.id ||
    (!!userPhone && canonicalIranianPhone(userPhone) === canonicalIranianPhone(animal.owner_phone));

  return { user, animal: owned ? animal : null };
}

export async function PUT(request: NextRequest, binding: { params: Promise<{ id: string }> }) {
  try {
    const { user, animal } = await getOwnedAnimal(binding);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!animal) return NextResponse.json({ error: 'حیوان یافت نشد' }, { status: 404 });

    const body = await request.json();
    const parsed = NotesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'داده نامعتبر' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('animals')
      .update({
        medical_notes: parsed.data.notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', animal.id);

    if (error) {
      console.error('Account animal notes error:', error);
      return NextResponse.json({ error: 'خطا در ذخیره یادداشت' }, { status: 500 });
    }

    // Append to history
    await supabaseAdmin
      .from('notes_history')
      .insert({
        entity_type: 'animal',
        entity_id: animal.id,
        author_id: user.id,
        content: parsed.data.notes ?? '',
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account animal notes API error:', error);
    return NextResponse.json({ error: 'خطای داخلی' }, { status: 500 });
  }
}