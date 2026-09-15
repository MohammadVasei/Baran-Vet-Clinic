import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Usage: npx ts-node scripts/set-user-phone.ts <email> <phone>
// Example: npx ts-node scripts/set-user-phone.ts mohammad@baran.com 09151135878
async function setUserPhone() {
  const email = process.argv[2];
  const phone = process.argv[3];

  if (!email || !phone) {
    console.error('❌ Usage: npx ts-node scripts/set-user-phone.ts <email> <phone>');
    process.exit(1);
  }

  const normalized = phone.startsWith('+') ? phone : phone.replace(/^0?/, '+98');
  console.log(`📱 Setting phone ${normalized} for ${email}...`);

  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    process.exit(1);
  }

  const existing = users.users.find((u) => u.email === email);
  if (!existing) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
    phone: normalized
  });

  if (error) {
    console.error('❌ Failed to update phone:', error.message);
    process.exit(1);
  }

  console.log('✅ Phone updated successfully!');
  console.log(`   User ID: ${existing.id}`);
  console.log(`   Email: ${email}`);
  console.log(`   Phone: ${data.user.phone}`);
}

setUserPhone();