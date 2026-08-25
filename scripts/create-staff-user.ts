import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createStaffUser() {
  const email = 'staff@baran-clinic.ir';
  const password = 'staff123456';
  const fullName = 'کارمند کلینیک';

  console.log('🔐 Creating staff user...');

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('⚠️  User already exists, finding existing user...');
      
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === email);
      
      if (existingUser) {
        console.log(`Found existing user: ${existingUser.id}`);
        
        // Update staff_users table
        const { error: staffError } = await supabase
          .from('staff_users')
          .upsert({
            id: existingUser.id,
            role: 'staff',
            full_name: fullName
          });
        
        if (staffError) {
          console.error('❌ Failed to update staff_users:', staffError.message);
          process.exit(1);
        }
        
        console.log('✅ Existing user updated as staff');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   User ID: ${existingUser.id}`);
        return;
      }
    }
    console.error('❌ Auth error:', authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`✅ Auth user created: ${userId}`);

  // 2. Insert into staff_users with staff role
  const { error: staffError } = await supabase
    .from('staff_users')
    .insert({
      id: userId,
      role: 'staff',
      full_name: fullName
    });

  if (staffError) {
    console.error('❌ Failed to create staff_users record:', staffError.message);
    // Cleanup: delete auth user
    await supabase.auth.admin.deleteUser(userId);
    process.exit(1);
  }

  console.log('✅ Staff user created successfully!');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Role: staff`);
  console.log('\n📝 You can now log in at /admin/login with these credentials');
}

createStaffUser();