require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const migrations = [
  // Migration 004: Add key columns
  `ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS key text UNIQUE;
   CREATE INDEX IF NOT EXISTS idx_doctors_key ON public.doctors (key);`,

  `ALTER TABLE public.services ADD COLUMN IF NOT EXISTS key text UNIQUE;
   CREATE INDEX IF NOT EXISTS idx_services_key ON public.services (key);`,

  // Populate doctor keys
  `UPDATE public.doctors SET key = 'dr-tazik' WHERE name ILIKE '%tazik%' OR name ILIKE '%محمد ابراهیم تازیک%';`,
  `UPDATE public.doctors SET key = 'dr-vasei' WHERE name ILIKE '%vasei%' OR name ILIKE '%رضا واسعی%';`,
  `UPDATE public.doctors SET key = 'moghan-jahani' WHERE name ILIKE '%moghan%' OR name ILIKE '%مژگان جهانی%';`,

  // Populate service keys
  `UPDATE public.services SET key = 'darman' WHERE category = 'darman' OR name ILIKE '%ویزیت%';`,
  `UPDATE public.services SET key = 'shenasname' WHERE category = 'shenasname' OR name ILIKE '%شناسنامه%';`,
  `UPDATE public.services SET key = 'grooming' WHERE category = 'grooming' OR name ILIKE '%شستشو%' OR name ILIKE '%گرومینگ%';`,
  `UPDATE public.services SET key = 'petshop' WHERE category = 'petshop' OR name ILIKE '%پت‌شاپ%' OR name ILIKE '%petshop%';`,

  // Seed sample data with keys (from 003_seed_owner.sql)
  `INSERT INTO public.doctors (name, bio, specialties, display_order, key) VALUES
   ('دکتر محمد تقی مقدم', 'متخصص جراحی و تشخیص تصویر، بیش از ۱۵ سال تجربه', ARRAY['جراحی', 'تشخیص تصویر', 'دارو درمانی'], 1, 'dr-tazik'),
   ('دکتر فاطمه واعظی', 'متخصص بیماری‌های داخلی و پیشگیری، titulaire دیپلم کالج اروپایی', ARRAY['بیماری‌های داخلی', 'واکسن‌سازی', 'پارازیتی‌ها'], 2, 'dr-vasei'),
   ('دکتر علی رضایی', 'متخصص پوست و حساسیت‌های حیوانات خانگی', ARRAY['پوست', 'حساسیت', 'عفونت‌های قارچی'], 3, 'moghan-jahani')
   ON CONFLICT (key) DO NOTHING;`,

  `INSERT INTO public.services (name, description, duration_minutes, price_rial, category, display_order, key) VALUES
   ('ویزیت عمومی', 'بررسی کامل سلامت و مشاوره', 30, 500000, 'darman', 1, 'darman'),
   ('واکسن‌سازی', 'واکسن‌های اساسی و اجباری', 20, 300000, 'darman', 2, 'darman-vaccination'),
   ('جراحی نرم', 'جراحی‌های بینی، گلو، و سینی', 60, 2000000, 'darman', 3, 'darman-surgery'),
   ('شناسنامه سلامت', 'صحت‌نامه کامل با تست‌های آزمایشگاهی', 45, 800000, 'shenasname', 1, 'shenasname'),
   ('شستشو و اصلاح کامل', 'حمام، برش ناخن، تمیز کردن گوش و چشم', 60, 600000, 'grooming', 1, 'grooming'),
   ('تریم ناخن و تمیز کردن گوش', 'مراقبت‌های سریع', 20, 150000, 'grooming', 2, 'grooming-quick')
   ON CONFLICT (key) DO NOTHING;`
];

async function runMigrations() {
  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i];
    console.log(`\nRunning migration ${i + 1}/${migrations.length}...`);
    
    try {
      // Use pg-meta API to execute SQL
      const response = await fetch(`${supabaseUrl}/pg-meta/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Error: ${response.status} - ${error}`);
      } else {
        const result = await response.json();
        console.log('Success!', result);
      }
    } catch (err) {
      console.error(`Exception: ${err.message}`);
    }
  }
  
  // Verify the data
  console.log('\n--- Verifying data ---');
  
  const { data: doctors, error: docErr } = await supabase
    .from('doctors')
    .select('id, name, key, is_active');
  
  if (docErr) {
    console.error('Doctors query error:', docErr);
  } else {
    console.log('Doctors:', doctors);
  }
  
  const { data: services, error: svcErr } = await supabase
    .from('services')
    .select('id, name, key, category, is_active');
  
  if (svcErr) {
    console.error('Services query error:', svcErr);
  } else {
    console.log('Services:', services);
  }
}

runMigrations();