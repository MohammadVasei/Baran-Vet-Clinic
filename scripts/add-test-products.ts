import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addTestProducts() {
  console.log('Adding test products...');

  const products = [
    {
      name: 'غذایRoyal Canin گربه بزرگسال',
      description: 'غذای کامل و متعادل برای گربه‌های بزرگسال با طیبه چیکن. حاوی پروتئین‌های با کیفیت بالا برای حفظ عضلات لاغر و سیستم یکم قوی.',
      price_rial: 2500000,
      category: 'food',
      images: [],
      display_order: 1,
      is_active: true,
    },
    {
      name: 'شامپو ضد عفونت مدی‌داک',
      description: 'شامپو درمانی برای پوست حساس حیوانات. حاوی کتاکنازول و کلورهکسیدین برای درمان عفونت‌های قارچی و باکتریایی پوست.',
      price_rial: 450000,
      category: 'medicine',
      images: [],
      display_order: 2,
      is_active: true,
    },
    {
      name: 'قلاده ضد بله و کنه سولانو',
      description: 'قلاده طولانی اثر (۸ ماه) ضد بله و کنه برای سگ‌ها و گربه‌ها. مقاوم در برابر آب و بی‌ریزش.',
      price_rial: 850000,
      category: 'accessories',
      images: [],
      display_order: 3,
      is_active: true,
    },
    {
      name: 'اسپری شستشوی خشک پت‌سیف',
      description: 'شستشوی خشک برای حیوانات که نمی‌توان حمام گرفت. ضد باکتری، ضد بو و حاوی آلوئه‌ورا برای نرمی پوست و مو.',
      price_rial: 320000,
      category: 'grooming',
      images: [],
      display_order: 4,
      is_active: true,
    },
    {
      name: 'غذای مرطوب وینر کلاسیک سگ',
      description: 'غذای مرطوب با کیفیت بالا برای سگ‌های تمام نژادها. طیبه گوسبت و سبزیجات. بدون مواد حاشیه و مصنوعی.',
      price_rial: 180000,
      category: 'food',
      images: [],
      display_order: 5,
      is_active: true,
    },
    {
      name: 'واکسین مرכב نوبلوک (DHPPi+L)',
      description: 'واکسین ترکیبی پیشگیری از بیماری‌های ویروسی شایع سگ‌ها: هپاتیت، پاروویروس، دی스템پر، پاراینفلوئنزا و لپتوسپیر.',
      price_rial: 650000,
      category: 'medicine',
      images: [],
      display_order: 6,
      is_active: true,
    },
    {
      name: 'بستر ضد حساسیت یاغی',
      description: 'بستر آرामده و ضد حساسیت برای سگ‌ها و گربه‌ها. قابل شستشو در ماشین، против آب و ضد عفونت.',
      price_rial: 1200000,
      category: 'accessories',
      images: [],
      display_order: 7,
      is_active: true,
    },
    {
      name: 'شوینده گوش مدی‌کلین',
      description: 'شوینده تخصصی گوش برای سگ‌ها و گربه‌ها. حذف چربی، 셀ولز و حشرات گوش. پیشگیری از عفونت‌های گوشی.',
      price_rial: 280000,
      category: 'grooming',
      images: [],
      display_order: 8,
      is_active: true,
    },
  ];

  for (const product of products) {
    // Insert product
    const { data: insertedProduct, error: productError } = await supabase
      .from('products')
      .insert(product)
      .select('id')
      .single();

    if (productError) {
      console.error(`Error inserting product ${product.name}:`, productError.message);
      continue;
    }

    // Insert stock level
    const { error: stockError } = await supabase
      .from('stock_levels')
      .insert({
        product_id: insertedProduct.id,
        quantity_on_hand: Math.floor(Math.random() * 20) + 5, // 5-25 units
        low_stock_threshold: 5,
      });

    if (stockError) {
      console.error(`Error inserting stock for ${product.name}:`, stockError.message);
    } else {
      console.log(`✓ Added: ${product.name} (ID: ${insertedProduct.id})`);
    }
  }

  console.log('Done!');
}

addTestProducts().catch(console.error);