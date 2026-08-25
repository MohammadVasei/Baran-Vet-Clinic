#!/usr/bin/env node
// Seed script: create owner account in Supabase
// Usage: npx ts-node supabase/seed-owner.ts
// Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nPlease create .env.local with these values (see .env.example)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function createOwnerAccount() {
    const email = process.argv[2];
    const password = process.argv[3];
    const fullName = process.argv[4] || 'Clinic Owner';

    if (!email || !password) {
        console.error('❌ Usage: npx ts-node supabase/seed-owner.ts <email> <password> [fullName]');
        console.error('   Example: npx ts-node supabase/seed-owner.ts owner@baran-clinic.ir "securePassword123" "دکتر محمدی"');
        process.exit(1);
    }

    if (password.length < 8) {
        console.error('❌ Password must be at least 8 characters');
        process.exit(1);
    }

    console.log(`🔐 Creating owner account for: ${email}`);

    try {
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('⚠️  User already exists, checking staff_users table...');
                
                // Try to find existing user
                const { data: existingUsers } = await supabase.auth.admin.listUsers();
                const existingUser = existingUsers.users.find(u => u.email === email);
                
                if (existingUser) {
                    // Link to staff_users
                    const { error: staffError } = await supabase
                        .from('staff_users')
                        .upsert({
                            id: existingUser.id,
                            role: 'owner',
                            full_name: fullName
                        });
                    
                    if (staffError) {
                        console.error('❌ Failed to link to staff_users:', staffError.message);
                        process.exit(1);
                    }
                    
                    console.log('✅ Existing user linked as owner');
                    console.log(`   User ID: ${existingUser.id}`);
                    return;
                }
            }
            console.error('❌ Auth error:', authError.message);
            process.exit(1);
        }

        const userId = authData.user.id;
        console.log(`✅ Auth user created: ${userId}`);

        // 2. Insert into staff_users with owner role
        const { error: staffError } = await supabase
            .from('staff_users')
            .insert({
                id: userId,
                role: 'owner',
                full_name: fullName
            });

        if (staffError) {
            console.error('❌ Failed to create staff_users record:', staffError.message);
            // Cleanup: delete auth user
            await supabase.auth.admin.deleteUser(userId);
            process.exit(1);
        }

        console.log('✅ Owner account created successfully!');
        console.log(`   User ID: ${userId}`);
        console.log(`   Email: ${email}`);
        console.log(`   Role: owner`);
        console.log('\n📝 Next steps:');
        console.log('   1. Run migrations 001 and 002 in Supabase SQL Editor');
        console.log('   2. Test login at /admin (will be created in Phase 3)');

    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

createOwnerAccount();