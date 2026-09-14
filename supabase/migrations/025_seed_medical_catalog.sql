-- Migration: 025_seed_medical_catalog.sql
-- Animal medical log — initial clinic configuration.
--
-- These are the clinic's starting catalog (species, breeds, vaccines,
-- treatment types, and a few deworming/checkup protocols). They are
-- configurable: the clinic (admin) can extend or edit them later, exactly as
-- the doctors/services seeds work. Species use stable `code` keys so future
-- seeds can reference them idempotently.
--
-- Idempotent: safe to re-run. Run AFTER 019 + 020 + 024.

-- ============================================================
-- SPECIES
-- ============================================================
INSERT INTO public.species (name, code, description, active) VALUES
    ('سگ', 'dog', 'سگ‌ها و نژادهای مختلف', true),
    ('گربه', 'cat', 'گربه‌ها و نژادهای مختلف', true),
    ('خرگوش', 'rabbit', 'خرگوش‌ها', true),
    ('پرنده', 'bird', 'پرندگان خانگی', true),
    ('سایر', 'other', 'سایر حیوانات خانگی', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- BREEDS (per species; "مخلوط/نامشخص" is always available)
-- ============================================================
INSERT INTO public.breeds (species_id, name, active)
SELECT s.id, b.name, true
FROM public.species s
JOIN (VALUES
    -- dogs
    ('dog', 'مخلوط / نامشخص'), ('dog', 'گلدن رتریور'), ('dog', 'ژرمن شپرد'),
    ('dog', 'پودل'), ('dog', 'لابرادور'), ('dog', 'هاسکی'), ('dog', 'بولداگ'),
    -- cats
    ('cat', 'مخلوط / نامشخص'), ('cat', 'پرشین'), ('cat', 'بریتیش شورت‌هر'),
    ('cat', 'سیامی'), ('cat', 'ماین‌کون'), ('cat', 'اسکاتیش فولد'),
    -- rabbits / birds / other
    ('rabbit', 'مخلوط / نامشخص'), ('rabbit', 'هلندی'), ('rabbit', 'لپ'),
    ('bird', 'مخلوط / نامشخص'), ('bird', 'طوطی'), ('bird', 'عروس هلندی'),
    ('other', 'مخلوط / نامشخص')
) AS b(code, name) ON s.code = b.code
ON CONFLICT (species_id, name) DO NOTHING;

-- ============================================================
-- VACCINES (per species)
-- ============================================================
INSERT INTO public.vaccines (name, species_id, description, manufacturer, active)
SELECT v.name, s.id, v.description, NULL, true
FROM public.species s
JOIN (VALUES
    ('dog', 'هاری', 'واکسن هاری سگ — سالانه'),
    ('dog', 'DHP', 'دیستمپر، هپاتیت، پاروویروس'),
    ('dog', 'DHPP', 'DHP + پاراآنفلوانزا'),
    ('dog', 'بوردتلا', 'واکسن سرفه لانه'),
    ('dog', 'لپتوسپیروز', 'واکسن ضد لپتوسپیروز'),
    ('cat', 'هاری', 'واکسن هاری گربه — سالانه'),
    ('cat', 'FVRCP', 'ویروس هرپس، کلسی، پنلوکوپنی'),
    ('cat', 'FeLV', 'واکسن لوسمی گربه'),
    ('cat', 'کلامیدیا', 'واکسن کلامیدیا')
) AS v(code, name, description) ON s.code = v.code
WHERE NOT EXISTS (
    SELECT 1 FROM public.vaccines e WHERE e.name = v.name AND e.species_id = s.id
);

-- ============================================================
-- TREATMENT TYPES (per species + category)
-- ============================================================
INSERT INTO public.treatment_types (name, species_id, category, description, active)
SELECT t.name, s.id, t.category, t.description, true
FROM public.species s
JOIN (VALUES
    ('dog', 'معاینه عمومی', 'routine', 'بررسی کامل سلامت و مشاوره'),
    ('dog', 'ضد انگل خارجی', 'preventive', 'کنترل کک، کنه و ...'),
    ('dog', 'ضد انگل داخلی', 'deworming', 'قرص یا شربت ضد کرم'),
    ('dog', 'درمان پوست', 'dermatology', 'درمان عفونت‌ها و حساسیت‌های پوستی'),
    ('cat', 'معاینه عمومی', 'routine', 'بررسی کامل سلامت و مشاوره'),
    ('cat', 'ضد انگل خارجی', 'preventive', 'کنترل کک، کنه و ...'),
    ('cat', 'ضد انگل داخلی', 'deworming', 'قرص یا شربت ضد کرم'),
    ('cat', 'درمان پوست', 'dermatology', 'درمان عفونت‌ها و حساسیت‌های پوستی')
) AS t(code, name, category, description) ON s.code = t.code
WHERE NOT EXISTS (
    SELECT 1 FROM public.treatment_types e WHERE e.name = t.name AND e.species_id = s.id
);

-- ============================================================
-- MEDICAL PROTOCOLS (clinic-configured care rules)
-- ============================================================
INSERT INTO public.medical_protocols
    (name, species_id, category, description, age_min_months, age_max_months, recommended_interval_days, active)
SELECT p.name, s.id, p.category, p.description, p.age_min_months, p.age_max_months, p.recommended_interval_days, true
FROM public.species s
JOIN (VALUES
    ('dog', 'هاری — سالانه', 'vaccination', 'واکسن هاری از ۳ ماهگی، سالانه تکرار شود', 3, NULL::integer, 365),
    ('dog', 'DHP — سالانه', 'vaccination', 'واکسن ترکیبی به‌صورت سالانه', 2, NULL::integer, 365),
    ('dog', 'ضد انگل داخلی', 'deworming', 'ضد انگل هر ۳ ماه توصیه می‌شود', 1, NULL::integer, 90),
    ('cat', 'هاری — سالانه', 'vaccination', 'واکسن هاری از ۳ ماهگی، سالانه تکرار شود', 3, NULL::integer, 365),
    ('cat', 'FVRCP — سالانه', 'vaccination', 'واکسن ترکیبی به‌صورت سالانه', 2, NULL::integer, 365),
    ('cat', 'ضد انگل داخلی', 'deworming', 'ضد انگل هر ۳ ماه توصیه می‌شود', 1, NULL::integer, 90)
) AS p(code, name, category, description, age_min_months, age_max_months, recommended_interval_days)
ON s.code = p.code
WHERE NOT EXISTS (
    SELECT 1 FROM public.medical_protocols e WHERE e.name = p.name AND e.species_id = s.id AND e.category = p.category
);