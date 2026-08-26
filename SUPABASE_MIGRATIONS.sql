-- Run these SQL commands in Supabase SQL Editor (https://supabase.com/dashboard/project/hxcjlpzfoadnjmsjjexx/sql/new)

-- ============================================================
-- 1. Add 'key' column to doctors table
-- ============================================================
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS key text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_doctors_key ON public.doctors (key);

-- ============================================================
-- 2. Add 'key' column to services table
-- ============================================================
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS key text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_services_key ON public.services (key);

-- ============================================================
-- 3. Populate keys for existing doctors
-- ============================================================
UPDATE public.doctors SET key = 'dr-tazik' WHERE name ILIKE '%tazik%' OR name ILIKE '%محمد ابراهیم تازیک%';
UPDATE public.doctors SET key = 'dr-vasei' WHERE name ILIKE '%vasei%' OR name ILIKE '%رضا واسعی%';
UPDATE public.doctors SET key = 'moghan-jahani' WHERE name ILIKE '%moghan%' OR name ILIKE '%مژگان جهانی%';

-- ============================================================
-- 4. Populate keys for existing services
-- ============================================================
UPDATE public.services SET key = 'darman' WHERE category = 'darman' OR name ILIKE '%ویزیت%';
UPDATE public.services SET key = 'shenasname' WHERE category = 'shenasname' OR name ILIKE '%شناسنامه%';
UPDATE public.services SET key = 'grooming' WHERE category = 'grooming' OR name ILIKE '%شستشو%' OR name ILIKE '%گرومینگ%';
UPDATE public.services SET key = 'petshop' WHERE category = 'petshop' OR name ILIKE '%پت‌شاپ%' OR name ILIKE '%petshop%';

-- ============================================================
-- 5. Seed sample doctors with keys (if not exist)
-- ============================================================
INSERT INTO public.doctors (name, bio, specialties, display_order, key) VALUES
('دکتر محمد تقی مقدم', 'متخصص جراحی و تشخیص تصویر، بیش از ۱۵ سال تجربه', ARRAY['جراحی', 'تشخیص تصویر', 'دارو درمانی'], 1, 'dr-tazik'),
('دکتر فاطمه واعظی', 'متخصص بیماری‌های داخلی و پیشگیری، titulaire دیپلم کالج اروپایی', ARRAY['بیماری‌های داخلی', 'واکسن‌سازی', 'پارازیتی‌ها'], 2, 'dr-vasei'),
('دکتر علی رضایی', 'متخصص پوست و حساسیت‌های حیوانات خانگی', ARRAY['پوست', 'حساسیت', 'عفونت‌های قارچی'], 3, 'moghan-jahani')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 6. Seed sample services with keys (if not exist)
-- ============================================================
INSERT INTO public.services (name, description, duration_minutes, price_rial, category, display_order, key) VALUES
('ویزیت عمومی', 'بررسی کامل سلامت و مشاوره', 30, 500000, 'darman', 1, 'darman'),
('واکسن‌سازی', 'واکسن‌های اساسی و اجباری', 20, 300000, 'darman', 2, 'darman-vaccination'),
('جراحی نرم', 'جراحی‌های بینی، گلو، و سینی', 60, 2000000, 'darman', 3, 'darman-surgery'),
('شناسنامه سلامت', 'صحت‌نامه کامل با تست‌های آزمایشگاهی', 45, 800000, 'shenasname', 1, 'shenasname'),
('شستشو و اصلاح کامل', 'حمام، برش ناخن، تمیز کردن گوش و چشم', 60, 600000, 'grooming', 1, 'grooming'),
('تریم ناخن و تمیز کردن گوش', 'مراقبت‌های سریع', 20, 150000, 'grooming', 2, 'grooming-quick')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 7. Verify the data
-- ============================================================
SELECT 'doctors' as table_name, id, name, key, is_active FROM public.doctors ORDER BY display_order;
SELECT 'services' as table_name, id, name, key, category, is_active FROM public.services ORDER BY display_order;

-- ============================================================
-- 8. Fix recursive staff RLS helper functions
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
	SELECT EXISTS (
		SELECT 1 FROM public.staff_users
		WHERE id = auth.uid()
		AND role = 'owner'
	);
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
	SELECT EXISTS (
		SELECT 1 FROM public.staff_users
		WHERE id = auth.uid()
		AND role IN ('owner', 'staff')
	);
$$;

-- ============================================================
-- 9. Fix bookings policy access to auth.users
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_user_phone()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = auth, public
AS $$
	SELECT phone FROM auth.users WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "Public can view own bookings by phone" ON public.bookings;

CREATE POLICY "Public can view own bookings by phone"
	ON public.bookings
	FOR SELECT
	USING (customer_phone = public.current_user_phone());