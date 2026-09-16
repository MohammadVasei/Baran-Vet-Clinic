-- Seed data for Baran Vet Clinic
-- Run this after migrations 001_initial_schema.sql and 002_rls_policies.sql

-- ============================================================
-- SITE CONTENT (JSONB data for CMS)
-- ============================================================

INSERT INTO public.site_content (key, data) VALUES
('clinic', jsonb_build_object(
    'name', 'کلینیک دام‌های کوچک باران',
    'brand', 'باران',
    'tagline', 'مراقبتی مهربان از حیوانات شما',
    'phone', '021-12345678',
    'phoneHref', 'tel:02112345678',
    'mobile1', '09121234567',
    'mobile1Href', 'tel:09121234567',
    'mobile1WhatsApp', 'true',
    'mobile2', '09129876543',
    'mobile2Href', 'tel:09129876543',
    'mobile2WhatsApp', 'true',
    'email', 'info@baran-vet.ir',
    'address', 'تهران، район Vanak، بلوار اصلی، پلاک 123',
    'addressShort', 'تهران، Vanak',
    'hours', jsonb_build_array(
        jsonb_build_object('days', 'شنبه تا چهارشنبه', 'time', '۹:۰۰ - ۱۹:۰۰'),
        jsonb_build_object('days', 'پنج‌شنبه و جمعه', 'time', '۹:۰۰ - ۱۴:۰۰')
    ),
    'hoursNote', 'در أيام تعطیلات رسمی بسته می‌شود',
    'instagram', '@baranvetclinic',
    'instagramUrl', 'https://instagram.com/baranvetclinic',
    'threads', '@baranvetclinic',
    'threadsUrl', 'https://threads.net/@baranvetclinic'
)),
('about', jsonb_build_object(
    'eyebrow', 'درباره ما',
    'statement', jsonb_build_array(
        'کلینیک dam‌های کوچک باران با ponad 10 سال تجربه در زمینه dampezeshki poulous hayvanlar',
        'تیم کارadémik ما از dampezeshkan mutakhassis va tajribe kar darand.',
        'ما credeim ke har dam hai droit les meilleurs soins possibles'
    ),
    'body', 'در کلینیک dam‌های کوچک باران، ما damhayе khaneghi ra ba ahyaye kardane tamamiyat daramon va dampezeshki karimi mowafagh mikonim. Ma ba estefadeh az ahyaye asaniye jadid va dampezeshkan mutahassis, sadaste bishtar az damhararat va bimaristan ra dampezeshki mikonim.',
    'signature', 'دکتر محمدی - دامpezeshkan arshad',
    'image', jsonb_build_object('src', '/about-clinic.jpg', 'alt', 'کلینیک dam‌های کوچک باران')
)),
('why', jsonb_build_object(
    'eyebrow', 'چرا ما؟',
    'headline', jsonb_build_array(
        'دامpezeshkan mutahassis',
        'Tajhizat sound',
        'Servis 24 saat'
    ),
    'intro', 'دلایلی که باران را dampezeshkhaneye mokhtasar tarif mikonad:',
    'steps', jsonb_build_array(
        jsonb_build_object('number', '1', 'title', 'تیم dampezeshkar motakhassis', 'text', 'تمام dampezeshkaran ma doktor-e dampezeshki va tajribe kari dar dameh haye kuchak darand.'),
        jsonb_build_object('number', '2', 'title', 'Tajhizat sound va kamel', 'text', 'Az taqirat sound ta laboratorikum, ma kolloh ehtiyat ra damygir mikonim.'),
        jsonb_build_object('number', '3', 'title', 'Servis 24 saat dar morat', 'text', 'Dar howayat dampezeshki, ma hamisheh hojat ra migirim.')
    ),
    'image', jsonb_build_object('src', '/why-choose-us.jpg', 'alt', 'چرا باران را انتخاب کنید؟')
)),
('animals', jsonb_build_object(
    'eyebrow', 'حیوانات پشتیبانی شده',
    'headline', jsonb_build_array(
        'سگ',
        'گربه',
        'پرنده',
        'خرگوش',
        'سایر'
    ),
    'intro', 'کلینیک باران خدمات dampezeshki ra baraye haye kuchak migirad:',
    'categories', jsonb_build_array(
        jsonb_build_object(
            'key', 'dog',
            'name', 'سگ',
            'image', '/animals/dog.jpg',
            'alt', 'سگ خانگی',
            'title', 'سگ‌ها: دوستان وفادار',
            'text', 'سگ‌ها أحد najat tarin hayvan-e khaneghi hastand ke be hamrah ma zendegi mikonand.'
        ),
        jsonb_build_object(
            'key', 'cat',
            'name', 'گربه',
            'image', '/animals/cat.jpg',
            'alt', 'گربه خانگی',
            'title', 'گربه‌ها: دوستان ملایم',
            'text', 'گربه‌ها hayvani latif va nazuk hastand ke mohtejat-e mahedani va dampezeshki tarkibи имеют.'
        ),
        jsonb_build_object(
            'key', 'bird',
            'name', 'پرنده',
            'image', '/animals/bird.jpg',
            'alt', 'پرنده خانگی',
            'title', 'پرندگان: نوازش precision',
            'text', 'Prandi-ha maharat-e moteghassi va dampezeshki moteghassi miro darad.'
        ),
        jsonb_build_object(
            'key', 'rabbit',
            'name', 'خرگوش',
            'image', '/animals/rabbit.jpg',
            'alt', 'خرگوش خانگی',
            'title', 'خرگوشان: لطف و עדינות',
            'text', 'Khargushan yek javanan-e ghair-e moteghalghal hastand ke bazgasht-e sari va dampezeshki lotfi miravand.'
        ),
        jsonb_build_object(
            'key', 'other',
            'name', 'سایر حیوانات',
            'image', '/animals/other.jpg',
            'alt', 'سایر حیوانات خانگی',
            'title', 'سایر حیوانات: مراقبت ویژه',
            'text', 'Baraye hayvani khas tukhmor va marmot, ma dampezeshkari moteghassi daram.'
        )
    )
)),
('marquee', jsonb_build_object(
    'label', 'اخبار و اعلانات',
    'items', jsonb_build_array(
        'تبریک عید فطر همگی عملای گرامی!',
        'تخفیف 20٪ روی تمام لوازم‌های جان و جاكت طojaee',
        'افتتاح سامانه جدید نوبت‌دهی آنلاین'
    )
)),
('facilities', jsonb_build_object(
    'eyebrow', 'امکانات',
    'headline', jsonb_build_array(
        'Vizitroom moajjad',
        'Labratorikum mutakhassis',
        'Otak operation'
    ),
    'intro', 'Clinique Baran mouldoud hamisheh tajhizat va mohit-e sari ra damygir mikonad:',
    'items', jsonb_build_array(
        jsonb_build_object(
            'key', 'vizitroom',
            'name', 'بین_travisgram متساز',
            'title', 'Bentrigram-e mutaadil',
            'text', 'Bentrigram-ha-ye kamil va mutaqavim baraye fahm-e khaasiyat-e damhay-e bimar.',
            'image', '/facilities/vizitroom.jpg',
            'alt', 'بین_travisgram متساز'
        ),
        jsonb_build_object(
            'key', 'laboratory',
            'name', 'Laboratorikum mutakhassis',
            'title', 'Labratorikum-e dampezeshi',
            'text', 'Damgyari haematologi, biukimiya va mikrobiya baraye tashkhis-e sari va sorat.',
            'image', '/facilities/laboratory.jpg',
            'alt', 'Laboratorikum mutakhassis'
        ),
        jsonb_build_object(
            'key', 'operation',
            'name', 'Otak operation',
            'title', 'Otak-e amaliyati motakhassis',
            'text', 'Amaliyat-ha-ye sorati va gheir-e sorati ba estehdaf-e alemmoghi va nivarman-e mahtub.',
            'image', '/facilities/operation.jpg',
            'alt', 'Otak operation'
        )
    )
)),
('emergency', jsonb_build_object(
    'eyebrow', 'مراقبتی اضطراری',
    'headline', jsonb_build_array(
        'Hamgeh 24 saat',
        'Dampezeshkar hamesh hadir',
        'Tajhizat kamel'
    ),
    'intro', 'Dar howayat-e dampezeshki, baray-e hame damhaye khaneghi ma hojat ra migirim.',
    'phone', '021-12345678',
    'mobile1', '09121234567',
    'mobile2', '09129876543',
    'hours', jsonb_build_array(
        jsonb_build_object('days', 'hamgeh hafteh', 'time', '24 saat')
    ),
    'hoursNote', 'Hamgeh howayat dampezeshki dar edema mojud ast.',
    'phoneHref', 'tel:02112345678',
    'mobile1Href', 'tel:09121234567',
    'mobile1WhatsApp', 'true',
    'mobile2Href', 'tel:09129876543',
    'mobile2WhatsApp', 'true'
)),
('appointment', jsonb_build_object(
    'eyebrow', 'رزرو نوبت',
    'headline', jsonb_build_array(
        'Sari va sorat',
        'Taeed SMS',
        'Taghir va kansel-asli'
    ),
    'intro', 'Ba enfaz-e sistem-e rezerv-e enlaein, shoma mitavanid nobeh ra dar dampezeshkhan-e Baran sari va sorat rezerv konid.',
    'note', 'Lutfan baraye taghir ya kansel-asli nobeh, ghabl az saaat 2 ghabl az nobeh ba ma tambit konid.',
    'steps', jsonb_build_array(
        jsonb_build_object('key', 'service', 'label', 'خدمت', 'title', 'کدام خدمت را نیاز دارید؟', 'hint', 'یکی از خدماتِ کلینیک را انتخاب کنید.'),
        jsonb_build_object('key', 'animal', 'label', 'حیوان', 'title', 'بیمارِ ما کیست؟', 'hint', 'نوعِ حیوانِ خانگی را انتخاب کنید.'),
        jsonb_build_object('key', 'date', 'label', 'تاریخ', 'title', 'چه روز و ساعتی مناسب شماست؟', 'hint', 'یک روز و یک بازهٔ زمانی را انتخاب کنید.'),
        jsonb_build_object('key', 'contact', 'label', 'تماس', 'title', 'راهِ ارتباطی را ثبت کنید', 'hint', 'برای هماهنگیِ نهایی با شما تماس می‌گیریم.')
    ),
    'timeSlots', jsonb_build_array(
        jsonb_build_object('key', 'morning', 'label', '۹:۰۰ صبح'),
        jsonb_build_object('key', 'midday', 'label', '۱۳:۰۰'),
        jsonb_build_object('key', 'evening', 'label', '۱۷:۰۰'),
        jsonb_build_object('key', 'night', 'label', '۲۰:۰۰')
    ),
    'services', jsonb_build_array()
)),
('contact', jsonb_build_object(
    'eyebrow', 'تماس با ما',
    'headline', jsonb_build_array(
        'Telefon',
        'WhatsApp',
        'Instagram'
    ),
    'intro', 'Baraye hamahangi va solsul-e masael, mitavanid ba ma tariqe-ha-ye zir rabete girid.',
    'phones', jsonb_build_array(
        jsonb_build_object('label', 'تلفن ثابت', 'number', '021-12345678', 'href', 'tel:02112345678', 'icon', 'phone', 'whatsapp', 'true'),
        jsonb_build_object('label', 'WhatsApp', 'number', '09121234567', 'href', 'https://wa.me/989121234567', 'icon', 'message-square', 'whatsapp', 'true'),
        jsonb_build_object('label', 'همراه اول', 'number', '09129876543', 'href', 'tel:09129876543', 'icon', 'smartphone', 'whatsapp', 'true')
    ),
    'socials', jsonb_build_array(
        jsonb_build_object('label', 'Instagram', 'handle', '@baranvetclinic', 'href', 'https://instagram.com/baranvetclinic'),
        jsonb_build_object('label', 'Threads', 'handle', '@baranvetclinic', 'href', 'https://threads.net/@baranvetclinic')
    ),
    'address', 'تهران، район Vanak، بلوار اصلی، پلاک 123',
    'hours', jsonb_build_array(
        jsonb_build_object('days', 'شنبه تا چهارشنبه', 'time', '۹:۰۰ - ۱۹:۰۰'),
        jsonb_build_object('days', 'پنج‌شنبه و جمعه', 'time', '۹:۰۰ - ۱۴:۰۰')
    ),
    'hoursNote', 'در أيام تعطیلات resmi بسته می‌شود',
    'finalMessage', 'Dampezeshkhan-e Baran hamesh hamrah-e shoma hastad.'
)),
('services_section', jsonb_build_object(
    'eyebrow', 'خدمات ما',
    'headline', jsonb_build_array(
        'Dampezeshki',
        'Ghazaei',
        'Abshtiari'
    ),
    'intro', 'Clinique Baran chand ghopeh-ye khidmati ra baraye damhay-e khaneghi taqdim mikonad:'
)),
('doctors_section', jsonb_build_object(
    'eyebrow', 'داکتران ما',
    'headline', jsonb_build_array(
        'Tajribe',
        'Mutakhassisiyyat',
        'Mehrabanni'
    ),
    'intro', 'Taym-e dampezeshkarane Baran az dampezeshkaran motakhassis va tajribe kar darand.'
)),
('testimonials_section', jsonb_build_object(
    'eyebrow', ' ביקורمي клієнтів',
    'headline', jsonb_build_array(
        'Tajribe kar haqiqiyi',
        'Mehrabanni moajjad',
        'Natijeh mokhtasar'
    ),
    'intro', 'In ghalamha az damdanan-e gherami-e Baran, ke damhay-e khaneghi-eshun ra be ma etela' dadeh-and, montakhabe shodeh-and.'
)),
('diseases_groups', jsonb_build_object(
    'eyebrow', 'بیماری‌های رایج',
    'headline', jsonb_build_array(
        'Sag-ha',
        'Garbe-ha',
        'Parande-ha'
    ),
    'intro', 'Dar zir, bihaye mukhtalif-e bimaraii-ye mohit az damhay-e khaneghi mojad shodeh-and.'
)),
('general_advice', jsonb_build_array(
    'Dampezeshk-e rolete baraye damhay-e khaneghi har mah yek bar ejra konid.',
    'Az ghiza-ha-ye mulayem va kafaye damygir estefadeh konid.',
    'Ab-e tazeh va saf ra hamesh dar dastur-e damhay-e khaneghi qarar dahid.',
    'Az taaghirat-e sokhan va ravayat-e damhay-e khaneghi habar darid.'
)),
('disclaimer', jsonb_build_object(
    'title', 'توضيحات مهم',
    'text', 'Maa'lumat moghadam dar in site faghat baraye ertesha-ye 'elmi va motale'e-ye 'ammiyeh mohaya and. Baraye dampezeshki va damnyari-ye sari, hamesh ba dampezeshkar motakhassis mosha'ereh konid.'
))
ON CONFLICT (key) DO UPDATE SET
    data = EXCLUDED.data,
    updated_at = now();

-- ============================================================
-- SERVICES
-- ============================================================

INSERT INTO public.services (name, description, duration_minutes, price_rial, category, display_order, is_active) VALUES
('معاینة عمومی سگ و گربه', 'معاینة کامل و بررسی سلامت کلی حیوان، شامل وزن‌گیری، بررسی دندان‌ها و گوش-forming، و مشاوره تغذیه.', 30, 500000, 'darman', 1, true),
('واکسن hæري سگ (سالیانه)', 'واکسن ترکیبی hæri برای سگان شامل دیستمپر، hæpatit، پاروویروس و پاراإنزفلوانزا.', 15, 300000, 'darman', 2, true),
('واکسن hæri گربه (سالیانه)', 'واکسن ترکیبی hæri برای گربه‌ها شامل ویروس هيرپس، كلسي، پنلوکوپنی.', 15, 300000, 'darman', 3, true),
('ضد انگل خارجی', 'علاج و پیشگیری از کک، کنه و سایر parasites خارجی با استفاده از داروهای تخصصی.', 20, 250000, 'preventive', 4, true),
('ضد انگل داخلی', 'قرص یا شربت ضد کرم برای traite motores paraziti intestini.', 15, 200000, 'deworming', 5, true),
('پاکسازی دندانچی', 'بررسی و incompletțات دندان‌ها شامل: حذف piedras، درمان caries، استخراج دندان در صورت لزوم.', 45, 800000, 'dental', 6, true),
('عملية جراحيچيك', 'جراحی‌های ساده شامل sterileziére، castracją и opsimple chirurgicale.', 120, 2000000, 'surgery', 7, true),
('مراقبت بعد از عمل جراحي', 'مراقبت و نگهداری پس عمل جراحي شامل gesture、parque و veterinary postoperative care.', 60, 400000, 'post-op', 8, true),
('تاریخچه سلامت (شناسنامه)', 'ساخت و نگهداری chronique médical électronique شامل تاریخچهٔ واکسیناسیون، مراجعات و عملگرایی‌های انجام شده.', 20, 150000, 'record', 9, true),
('مراقبتی مرغوم&چاردار ї', 'Visite à domicile pour pâtes vieilles ou handicapées avec contrôle complet de l''état.', 60, 600000, 'home-care', 10, true),
('مراقبتی ویژه', 'Kombinacja usług dla любителей активного отдыха с животными: tréníровки, консультации по питанию и ветосмотр.', 90, 700000, 'special', 11, true),
('ارائه مشاوره تغذیهی', 'Консультация ветеринарного нутрициолога по выбору корма, режим кормления и добавки.', 30, 250000, 'nutrition', 12, true),
('سرویس aquaristik', ' Chamувание، расчесывание、стрижка когтей и гигиеническая стрижка шерсти.', 60, 350000, 'grooming', 13, true),
('مساج جسم کامل', 'Массаж всего тела, включая мышцы، суставы и связки.', 45, 400000, 'therapy', 14, true),
('مشاوره رفتارگرفته', 'Консультация по исправлению поведения: агрессия, страх, тревожность и другие проблемы.', 60, 500000, 'behavior', 15, true);

-- ============================================================
-- DOCTORS
-- ============================================================

INSERT INTO public.doctors (name, bio, photo_url, specialties, display_order, is_active) VALUES
('دکتر محمدی', 'دکتر محمدی با oltre 15 سال esperienza در dampezeshke kuchak و mutakhassisiyyat dar dampezeshke esrari va dampezeshke jaanvari, rahbari-ye tim-e dampezeshkane Baran ast.', '/doctors/dr-mohammadi.jpg', jsonb_build_array('عماومی', 'جراحی', 'داخلی'), 1, true),
('دکتر احمدی', 'دکتر أحمدی تخصصش در dampezeshke garbe-ha va bimaraii-ye mutakhassis ast. او dampezeshkar-e mutakhassis-e garb-ha dar Baran ast.', '/doctors/dr-ahmadi.jpg', jsonb_build_array('غذایی', 'دیabetی', 'گیاهی'), 2, true),
('دکتر سادات', 'دکتر سادات ba dampezeshke kuchi و murakkab maharat dare va mutakhassisiyat dar dampezeshke parande-ha va nahang ast.', '/doctors/dr-sadat.jpg', jsonb_build_array('птицеводство', 'экзотические', 'орнитология'), 3, true),
('نurse زهرا', 'نurse زهرا با oltre 10 سال esperienza درمراقبت و مراقبتی، masul-ye edarat-e maraghebi va dampezeshke-ye morat-e khaneghi ast.', '/doctors/nurse-zahra.jpg', jsonb_build_array('مراقبتی', 'مراقبتی', 'تمریشی'), 4, true),
('دکتر علی', 'دکتر علی mutakhassis dar dampezeshke varzeshi va tahiyyat-e badan damhay-e varzeshi ast.', '/doctors/dr-ali.jpg', jsonb_build_array('ورزشy', 'فرآیندي', 'فافضافة'), 5, true);

-- ============================================================
-- DISEASES (محتواهای آموزشی)
-- ============================================================

INSERT INTO public.diseases (animal_type, category, name, symptoms, care, display_order, is_published) VALUES
('dog', 'infectious', 'دیسمپر', 'تب، سرماگی، wycofanie sił wymiotowe،特别是在幼犬中尤为明显', 'عزل حیوان مریض، تزریق Serum przeciwwirusowy و unterstützt antibiotische Zweitbehandlung zur Vorbeugung von Komplikationen', 1, true),
('dog', 'infectious', 'پارvosuviрус', 'إسهال دموي شدید، westlichen νόσως와 동시에 나타나는 증상، besonders bei jungen Hunden zu beobachten', 'تزریق سيتיקсол (antisrum) protiwirusowe, controlar nivel de hidratación y soporte nutricional intensivo', 2, true),
('cat', 'infectious', 'فيروس كاتشر,_leukopenia', 'حمى، إسهال، انخفاض كريات الدم البيضاء، wobei junge Katzen besonders häufig betroffen sind', 'العلاج تحت إشراف الطبيب البيطري: محفزات المناعة، الرعاية الداعمة والتغذية التكميلية', 3, true),
('cat', 'infectious', 'فيروس التاسمك_البرיטונيتيس', 'تراكم سائل في البطن، فقدان الوزن، حمى مستمرة،ً Erkrankung trifft vor allem ältere Katzen', 'العلاج للحفاظ على جودة الحياة: علاج الأعراض، غذاء عالي السعرات الحرارية وتوفير الراحة', 4, true),
('dog', 'chronic', 'التهاب المفاصل', 'صعوبة في المشي، خاصة بعد الراحة أو أثناء البرد،ущемление нервных окончаний и воспалительные изменения', 'مكملات الجلوكوزامين، العلاج الطبيعي والتمارين المناسبة، kontrollerad vikt och ledvänlig träning', 5, true),
('cat', 'chronic', 'أمراض الكلى المزمنة', 'زيادة العطش، زيادة التبول، perda de аппетит и склонность к рвоте, häufig bei älteren Katzen zu beobachten', 'غذاء خاص بالكلى،مثبطات الفوسفور الطبيعية وتناول كميات كافية من المياه, réductions de phosphore dans l''alimentation et restriction de protéines', 6, true),
('bird', 'infectious', 'إنفلونZA الطيور', 'صعوبة في التنفس، إفراز من الأنف والعينين، и возникает особенно резко в начале болезни', 'عزل الطائر المريض،دواء مضاد للفيروسات (إذا disponible)، و soin de поддержки', 7, true),
('rabbit', 'chronic', 'أسنان过长', 'انخفاض الشهية، فرط اللعاب،特に咬み合わせが悪い場合に顕著であり、dit wordt vaak gezien bij konijnen met een verkeerde beet', 'تقليم الأسنان بانتظام بواسطة طبيب بيطري،العلف الليفي العالي והענף המריע, hoge vezelvoeding en takvoer', 8, true);

-- ============================================================
-- TESTIMONIALS
-- ============================================================

INSERT INTO public.testimonials (name, quote, rating, animal_type, service_type, is_published, display_order) VALUES
('سارا محمدی', 'دکتر محمدی oltre 10 سال esperienza در治疗我的拉布拉多. wirklich velmi مهذب وپेशهوار.', 5, 'dog', 'معاینة عمومی', true, 1),
('علی احمدی', 'پس از عمل جراحی на моем сиамском кот, skutečně velmi مهذبانه وپیروسی.', 5, 'cat', 'عملية جراحيچيك', true, 2),
('فاطمه سادات', 'خدمات宠物美容真的很 profissional und wirklich gut. हर방울마다 piacere.', 5, 'bird', 'سرویس aquaristik', true, 3),
('محمد nurse زهرا', 'مراقبتی господин после операций真的很 ben gemacht und zuverlässig.', 4, 'rabbit', 'مراقبت بعد از عمل جراحي', true, 4),
('حسين علی', 'ویزیت خانگی بعد از працює davvero molto comodo e professionale.', 5, 'dog', 'مراقبتی مرغوم&چاردار ї', true, 5);

-- ============================================================
-- PRODUCTS (for pet-shop)
-- ============================================================

INSERT INTO public.products (name, description, price_rial, category, images, is_active, display_order) VALUES
('غذای کPremium برای سگ adultos', 'غذای کامل و equilibrato با پروتئین بالا و مواد مغذی essenziale برای سگ‌های بالغ.', 450000, 'food', jsonb_build_array('/products/dog-food-premium.jpg'), true, 1),
('غذایspecial برای گربه seniore', 'غذای مخصوص گربه‌های großes với موارد підтриمهٔ کلیه و مفاصل.', 380000, 'food', jsonb_build_array('/products/cat-food-senior.jpg'), true, 2),
('عrod формака ضد pulgi и kлещей', 'формака эффективна против блох и клещей خلال 4 недели применения.', 120000, 'medicine', jsonb_build_array('/products/flea-tick-collar.jpg'), true, 3),
('럭셔리 나무 이런 집 для 고양이', 'Деревянный домик с несколькими уровнями и местом для точиления коготков.', 650000, 'accessories', jsonb_build_array('/products/cat-tree-luxury.jpg'), true, 4),
('Pетлятучка с регулировкой размера', 'Комфортная и segura петля для прогулок с контролем размера.', 280000, 'accessories', jsonb_build_array('/products/adjustable-pet-leash.jpg'), true, 5),
('Игрушка-грызунок из натурального каучука', 'Безопасная игрушка для собак, которая помогает удовлетворить жевательную потребность.', 95000, 'accessories', jsonb_build_array('/products/natural-rubber-chew-toy.jpg'), true, 6),
('Аквариумбюро с подсветкой и фильтром', 'Аквариум полный комплект с подсветкой LED и системой фильтрации воды.', 1200000, 'accessories', jsonb_build_array('/products/fish-tank-setup.jpg'), true, 7),
('Витаминnyй комплекс для reinforcing иммунитета', 'Вилмины группы B, C, E и微量элементы для поддерживаения иммунитета.', 180000, 'medicine', jsonb_build_array('/products/immune-vitamins.jpg'), true, 8),
('Шампунь антиаллергический для чувствительной кожи', 'Мягкий шампунь с рН балансом для животных с чувствительной кожей.', 75000, 'grooming', jsonb_build_array('/products/hypoallergenic-shampoo.jpg'), true, 9),
('Переноска rígida для маленьких собак и кошек', 'Переноска из ударопрочного пластика с вентиляцией и фиксатором двери.', 320000, 'accessories', jsonb_build_array('/products/pet-carrier-rigid.jpg'), true, 10);

-- ============================================================
-- STOCK LEVELS
-- ============================================================

-- Stock levels will be automatically created via trigger when products are inserted
-- But we can set initial values here for demonstration

DO $$
DECLARE
    product_record RECORD;
BEGIN
    FOR product_record IN
        SELECT id FROM public.products WHERE is_active = true
    LOOP
        -- Insert or update stock level for each product
        INSERT INTO public.stock_levels (product_id, quantity_on_hand, low_stock_threshold)
        VALUES (
            product_record.id,
            CASE 
                WHEN product_record.category = 'food' THEN 50
                WHEN product_record.category = 'medicine' THEN 30
                WHEN product_record.category = 'accessories' THEN 20
                ELSE 15
            END,
            CASE 
                WHEN product_record.category = 'food' THEN 10
                WHEN product_record.category = 'medicine' THEN 5
                WHEN product_record.category = 'accessories' THEN 3
                ELSE 5
            END
        )
        ON CONFLICT (product_id) DO UPDATE SET
            quantity_on_hand = EXCLUDED.quantity_on_hand,
            low_stock_threshold = EXCLUDED.low_stock_threshold,
            updated_at = now();
    END LOOP;
END $$;