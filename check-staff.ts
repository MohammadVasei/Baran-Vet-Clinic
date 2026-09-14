import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Check the original owner staff user
supabase
  .from('staff_users')
  .select('*')
  .eq('id', '9701234f-8dd8-433e-88cc-c56f65eb7b82')
  .single()
  .then((r: any) => {
    console.log('Original owner (owner@baran-clinic.ir):');
    console.log('  ID:', r.data?.id);
    console.log('  Role:', r.data?.role);
    console.log('  Full name:', r.data?.full_name);
  })
  .then(() => {
    // Check the new test owner
    return supabase
      .from('staff_users')
      .select('*')
      .eq('id', '9076a7e5-6ec1-4dc7-a08b-a998454ef4a4')
      .single();
  })
  .then((r: any) => {
    console.log('\\nNew test owner:');
    console.log('  ID:', r.data?.id);
    console.log('  Role:', r.data?.role);
    console.log('  Full name:', r.data?.full_name);
  });