import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

supabase.auth.admin.listUsers().then((r) => {
  console.log('Total users:', r.data.users.length);
  r.data.users.forEach((u: any, i: number) => {
    console.log(`User ${i + 1}: ${u.email} (ID: ${u.id}) created at ${u.created_at}`);
  });
}).catch((e) => {
  console.error('Error:', e.message);
});