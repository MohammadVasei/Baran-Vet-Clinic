-- Migration: 003_seed_owner.sql
-- Seed script for initial owner account
-- Run this AFTER 001_initial_schema.sql and 002_rls_policies.sql
-- 
-- IMPORTANT: Replace the email and password below with actual values
-- The user must be created in Supabase Auth first (via dashboard or API)
-- Then this script links the auth user to staff_users with 'owner' role

-- ============================================================
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > Enter email + password > Confirm
-- 3. Copy the new user's UUID
-- 4. Replace OWNER_USER_ID below with that UUID
-- 5. Run this script in Supabase SQL Editor
-- ============================================================

-- Replace this UUID with the actual auth.users ID from step 3 above
-- DO NOT use a random UUID - it must match an existing auth.users record
DO $$
DECLARE
    owner_user_id uuid := 'REPLACE_WITH_ACTUAL_AUTH_USER_UUID'; -- <-- CHANGE THIS
BEGIN
    -- Insert into staff_users with owner role
    INSERT INTO public.staff_users (id, role, full_name)
    VALUES (owner_user_id, 'owner', 'Clinic Owner')
    ON CONFLICT (id) DO UPDATE SET
        role = 'owner',
        full_name = COALESCE(staff_users.full_name, 'Clinic Owner'),
        updated_at = now();
    
    RAISE NOTICE 'Owner account seeded for user: %', owner_user_id;
END $$;

-- ============================================================
-- OPTIONAL: Sample data for testing (uncomment if needed)
-- ============================================================

/*
-- Sample doctors
INSERT INTO public.doctors (name, bio, specialties, display_order) VALUES
('دکتر محمد تقی مقدم', 'متخصص جراحی و تشخیص تصویر، بیش از ۱۵ سال تجربه', ARRAY['جراحی', 'تشخیص تصویر', 'دارو درمانی'], 1),
('دکتر فاطمه واعظی', 'متخصص بیماری‌های داخلی و پیشگیری، titulaire دیپلم کالج اروپایی', ARRAY['بیماری‌های داخلی', 'واکسن‌سازی', 'پارازیتی‌ها'], 2),
('دکتر علی رضایی', 'متخصص پوست و حساسیت‌های حیوانات خانگی', ARRAY['پوست', 'حساسیت', 'عفونت‌های قارچی'], 3);

-- Sample services
INSERT INTO public.services (name, description, duration_minutes, price_rial, category, display_order) VALUES
('ویزیت عمومی', 'بررسی کامل سلامت و مشاوره', 30, 500000, 'darman', 1),
('واکسن‌سازی', 'واکسن‌های اساسی و обязаتی', 20, 300000, 'darman', 2),
('جراحی نرم', 'جراحی‌های بینی، گلو، و सदری', 60, 2000000, 'darman', 3),
('شناسنامه سلامت', 'صحت‌نامه کامل با تست‌های آزمایشگاهی', 45, 800000, 'shenasname', 1),
('شستشو و اصلاح کامل', 'حمام، برش ناخن، تمیز کردن گوش و چشم', 60, 600000, 'grooming', 1),
('تریم ناخن و تمیز کردن گوش', 'مراقبت‌های سریع', 20, 150000, 'grooming', 2);

-- Sample diseases (dog)
INSERT INTO public.diseases (animal_type, category, name, symptoms, care, display_order) VALUES
('dog', 'infectious', 'ویروس پارو', 'استفراغ اسهال‌خونی، بی‌حالی، تب، عدم اشتها', 'درمان حمایتی، سیarum و الکترونولیت، آنتی‌بیوتیک ثانویه، ایزولاسیون', 1),
('dog', 'infectious', 'سگ‌دی‌خط', 'تب، بی‌حالی، استفراغ، اسهال، علائم عصبی', 'درمان حمایتی، پیشگیری با واکسن، ایزولاسیون کامل', 2),
('dog', 'chronic', 'آرتروز', 'لنگدن، سختی صبحگاهی، کاهش فعالیت، درد عند مفصل', 'مدیریت وزن، مضادات التهابی، مکمل‌های مفصلی، فیزیوتراپی', 1),
('dog', 'chronic', 'دیابت', 'اشتهای زیاد، פול‌یوریا، پول‌سیپسیا، کاهش وزن', 'انسولین، رژیم غذایی، مانیتورینگ قند خون منظم', 2);

-- Sample diseases (cat)
INSERT INTO public.diseases (animal_type, category, name, symptoms, care, display_order) VALUES
('cat', 'infectious', 'فیت ویروس گربه (FIV)', 'تب، بی‌حالی، عفونت‌های تکراری، بیماری دهان', 'درمان حمایتی، مدیریت استرس، پیشگیری از عفونت‌های ثانویه', 1),
('cat', 'infectious', 'پانل کوکینگی (FPV)', 'تب بالا، استفراغ، اسهال، بی‌حالی شدید', 'درمان حمایتی شدید، سیarum، آنتی‌بیوتیک، ایزولاسیون', 2),
('cat', 'chronic', 'بیماری کلیوی مزمن', 'پول‌یوریا، پول‌سیپسیا، استفراغ، کاهش وزن، بی‌حالی', 'رژیم کلیوی، مایع درمانی، کنترل فشار خون، فوسفات‌بایندها', 1),
('cat', 'chronic', 'هایپرتیروئیدسم', 'کاهش وزن با اشتهای زیاد، هیпераکتیویته، تب', 'دارو (متیمازول)، ید رادیواکتیو، جراحی، رژیم ید کم', 2);

-- Sample diseases (bird)
INSERT INTO public.diseases (animal_type, category, name, symptoms, care, display_order) VALUES
('bird', 'infectious', 'پاکس (Psittacosis)', 'تنفسی، اسهال، بی‌حالی، تخم‌ریزی غیرطبیعی', 'دوکسی‌سایکلین ۴۵ روزه، ایزولاسیون، ضدعفونی کردن محیط', 1),
('bird', 'infectious', 'نیوکاسل', 'تنفسی شدید، علائم عصبی، اسهال، نفوق ناگهانی', 'پیشگیری با واکسن، درمان حمایتی، گزارش به Veterinary Organization', 2),
('bird', 'chronic', 'چاقی پرنده', 'چربیدهی کبد، تنگی نفس، کاهش تولید تخم', 'رژیم کم چربی، ورزش، مکمل‌های کبدی، کنترل وزن منظم', 1),
('bird', 'chronic', 'پوست‌چه‌کاری', 'پوست‌پوستی، کنده کردن، پرریزی، رفتار عصبی', 'تعیین عامل (قارچ/آلرژی/استرس)، درمان هدفمند، غنی‌سازی محیط', 2);

-- Sample testimonials
INSERT INTO public.testimonials (name, quote, rating, animal_type, service_type, display_order) VALUES
('مریم احمدی', 'تیم بسیار مهربان و حرفه‌ای. سگ من الجر کامل داشت و الان کاملاً خوبه.', 5, 'dog', 'darman', 1),
('رضا محمدی', 'شستشو و اصلاح گربه من عالی بود. استرس نکرد و بسیار تمیز شد.', 5, 'cat', 'grooming', 2),
('فاطمه رضایی', 'مشاوره تلفنی برای پرنده‌ام خیلی کمک کرد. ممنون از راهنمایی‌هاتون.', 5, 'bird', 'darman', 3);

-- Sample products
INSERT INTO public.products (name, description, price_rial, category, images, display_order) VALUES
('غذایRoyal Canin سگ بالغ', 'غذای کامل و متوازن برای سگ‌های بالغ', 1200000, 'food', ARRAY['/images/products/royal-canin-dog.jpg'], 1),
('غذایRoyal Canin گربه بالغ', 'غذای کامل برای گربه‌های بالغ', 1100000, 'food', ARRAY['/images/products/royal-canin-cat.jpg'], 2),
('شامپو ضد}Cleroderma', 'شامپو درمانی برای مشکلات پوستی', 450000, 'grooming', ARRAY['/images/products/shampoo-cleroderma.jpg'], 1),
('ویتامین مالتی‌ویت پرنده', 'مکمل ویتامین برای پرندگان زینتی', 280000, 'medicine', ARRAY['/images/products/multivit-bird.jpg'], 1);

-- Sample stock levels
INSERT INTO public.stock_levels (product_id, quantity_on_hand, low_stock_threshold)
SELECT id, 50, 10 FROM public.products WHERE name LIKE '%Royal Canin%';

INSERT INTO public.stock_levels (product_id, quantity_on_hand, low_stock_threshold)
SELECT id, 30, 5 FROM public.products WHERE name LIKE '%شامپو%';

INSERT INTO public.stock_levels (product_id, quantity_on_hand, low_stock_threshold)
SELECT id, 100, 20 FROM public.products WHERE name LIKE '%ویتامین%';
*/