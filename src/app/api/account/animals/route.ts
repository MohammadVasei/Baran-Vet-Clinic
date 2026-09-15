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
    const phoneCanonical = canonicalIranianPhone(userPhone);

    // Owners can be matched by auth account OR digit-normalized phone (see user_owns_animal).
    let query = supabaseAdmin
      .from('animals')
      .select(
        'id,owner_id,owner_phone,name,species_id,breed_id,sex,date_of_birth,weight,color,microchip_number,neutered,allergies,medical_notes,profile_image,status,created_at,species:species(id,name),breed:breeds(id,name)'
      )
      .order('created_at', { ascending: false });

    if (phoneCanonical !== "0000000000") {
      query = query.or(`owner_id.eq.${user.id},owner_phone.ilike.%${phoneCanonical.slice(1)}%`);
    } else {
      query = query.eq('owner_id', user.id);
    }

    const { data: animals, error } = await query.limit(300);

    if (error) {
      console.error('Account animals error:', error);
      return NextResponse.json({ error: 'خطا در دریافت حیوانات' }, { status: 500 });
    }

    const owned = (animals || []).filter(
      (a) =>
        a.owner_id === user.id ||
        (phoneCanonical !== "0000000000" && canonicalIranianPhone(a.owner_phone) === phoneCanonical)
    );

    return NextResponse.json({ animals: owned });
  } catch (error) {
    console.error('Account animals API error:', error);
    return NextResponse.json({ error: 'خطای داخلی' }, { status: 500 });
  }
}