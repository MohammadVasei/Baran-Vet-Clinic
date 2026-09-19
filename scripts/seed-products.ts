import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

const PHOTOS_DIR = resolve(__dirname, '../assets/product-photos');
const BUCKET = 'product-images';

const STOCK_DEFAULTS: Record<string, { qty: number; threshold: number }> = {
  food: { qty: 50, threshold: 10 },
  medicine: { qty: 30, threshold: 5 },
  accessories: { qty: 20, threshold: 3 },
  grooming: { qty: 15, threshold: 5 },
};

interface ProductSpec {
  name: string;
  description: string;
  price_rial: number;
  category: 'food' | 'medicine' | 'accessories' | 'grooming';
  slug: string;
  display_order: number;
  is_featured: boolean;
}

const products: ProductSpec[] = [
  {
    name: 'غذای خشک رویال کنین برای سگ بالغ',
    description:
      'غذای کامل و متعادل برای سگ‌های بالغ با پروتئین باکیفیت، حفظ عضلات و تقویت سیستم ایمنی.',
    price_rial: 3250000,
    category: 'food',
    slug: 'dog-food-royal-canin',
    display_order: 11,
    is_featured: true,
  },
  {
    name: 'غذای مرطوب هیلز برای گربه بالغ',
    description:
      'غذای مرطوب با طعم مرغ برای گربه‌های بالغ؛ سرشار از آب و مواد مغذی برای هیدراتاسیون و سلامت کلیوی.',
    price_rial: 1850000,
    category: 'food',
    slug: 'cat-food-hills',
    display_order: 12,
    is_featured: true,
  },
  {
    name: 'غذای جوسرا برای توله‌سگ',
    description:
      'غذای مخصوص رشد توله‌سگ‌ها با کلسیم و پروتئین بالا برای رشد استخوان‌ها و تقویت سیستم گوارش.',
    price_rial: 2400000,
    category: 'food',
    slug: 'puppy-food-josera',
    display_order: 13,
    is_featured: false,
  },
  {
    name: 'قلاده ضد کنه و کک ۸ ماهه',
    description:
      'قلاده طولانی‌اثر (تا ۸ ماه) ضد کک و کنه برای سگ‌ها و گربه‌ها؛ مقاوم در برابر آب و بی‌ریزش.',
    price_rial: 950000,
    category: 'medicine',
    slug: 'flea-tick-collar',
    display_order: 14,
    is_featured: true,
  },
  {
    name: 'مکمل امگا ۳ برای پوست و مو',
    description:
      'کپسول روغن ماهی غنی از اسیدهای چرب امگا ۳ برای درخشش مو، سلامت پوست و مفاصل حیوانات.',
    price_rial: 720000,
    category: 'medicine',
    slug: 'omega3-supplement',
    display_order: 15,
    is_featured: false,
  },
  {
    name: 'قطره پاک‌کننده گوش سگ و گربه',
    description:
      'محلول ملایم پاک‌کننده گوش برای حذف جرم و پیشگیری از عفونت‌های گوشی در سگ‌ها و گربه‌ها.',
    price_rial: 340000,
    category: 'medicine',
    slug: 'ear-drops',
    display_order: 16,
    is_featured: false,
  },
  {
    name: 'ظرف غذای سرامیکی دوبل',
    description:
      'ظرف غذا و آب سرامیکی دوبل با پایه ضد لغزش؛ ایمن برای ظرف‌شویی و مناسب همه نژادها.',
    price_rial: 890000,
    category: 'accessories',
    slug: 'ceramic-double-bowl',
    display_order: 17,
    is_featured: false,
  },
  {
    name: 'قلاده و بند نایلونی مقاوم',
    description:
      'بند و قلاده نایلونی مستحکم با قفل فشاری و حلقه فلزی؛ قابل تنظیم دور گردن برای پیاده‌روی ایمن.',
    price_rial: 480000,
    category: 'accessories',
    slug: 'nylon-leash',
    display_order: 18,
    is_featured: false,
  },
  {
    name: 'شامپو ضد حساسیت پوست حیوانات',
    description:
      'شامپوی ملایم با pH متعادل و عصاره آلوئه‌ورا برای پوست حساس، ضد خارش و مرطوب‌کننده.',
    price_rial: 520000,
    category: 'grooming',
    slug: 'hypoallergenic-shampoo',
    display_order: 19,
    is_featured: false,
  },
  {
    name: 'برس ضد ریزش موی حیوانات',
    description:
      'شانه و برس دندانه‌دار برای از بین بردن موهای مرده و کاهش ریزش مو؛ مناسب سگ‌ها و گربه‌ها.',
    price_rial: 260000,
    category: 'grooming',
    slug: 'grooming-brush',
    display_order: 20,
    is_featured: false,
  },
];

function publicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadImage(spec: ProductSpec): Promise<string[]> {
  const ext = extname(`${spec.slug}.jpg`); // consistent naming
  const storagePath = `products/${spec.slug}${ext}`;
  const file = readFileSync(resolve(PHOTOS_DIR, `${spec.slug}.jpg`));

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'image/jpeg',
    });

  if (error) {
    console.error(`Upload failed for ${spec.slug}:`, error.message);
    return [];
  }

  return [publicUrl(storagePath)];
}

async function seed() {
  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const spec of products) {
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('name', spec.name)
      .maybeSingle();

    if (existing) {
      console.log(`- Skip (already exists): ${spec.name}`);
      skipped += 1;
      continue;
    }

    const images = await uploadImage(spec);
    if (images.length === 0) {
      failed += 1;
      continue;
    }

    const { data: created, error: productError } = await supabase
      .from('products')
      .insert({
        name: spec.name,
        description: spec.description,
        price_rial: spec.price_rial,
        category: spec.category,
        images,
        is_active: true,
        is_featured: spec.is_featured,
        display_order: spec.display_order,
      })
      .select('id')
      .single();

    if (productError || !created) {
      console.error(`Insert failed for ${spec.name}:`, productError?.message);
      failed += 1;
      continue;
    }

    const stock = STOCK_DEFAULTS[spec.category];
    const { error: stockError } = await supabase.from('stock_levels').insert({
      product_id: created.id,
      quantity_on_hand: stock.qty,
      low_stock_threshold: stock.threshold,
    });

    if (stockError) {
      console.error(`Stock insert failed for ${spec.name}:`, stockError.message);
    }

    added += 1;
    console.log(
      `${spec.is_featured ? '★ FEATURED' : '         '} ${spec.name} (${created.id})`
    );
  }

  console.log(`\nDone. added=${added} skipped=${skipped} failed=${failed}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});