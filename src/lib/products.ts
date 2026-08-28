import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase public environment variables are missing.');
}

export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_rial: number;
  category: string | null;
  images: string[] | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  stock_levels: {
    quantity_on_hand: number;
    low_stock_threshold: number;
  } | null;
  quantity_on_hand: number;
  low_stock_threshold: number;
}

export interface ProductCard {
  id: string;
  name: string;
  description: string | null;
  price_rial: number;
  category: string | null;
  images: string[] | null;
  quantity_on_hand: number;
  low_stock_threshold: number;
  is_active: boolean;
}

export async function getProducts(): Promise<ProductCard[]> {
  const { data, error } = await supabaseServer
    .from('products')
    .select(`
      id,
      name,
      description,
      price_rial,
      category,
      images,
      display_order,
      is_active,
      stock_levels (
        quantity_on_hand,
        low_stock_threshold
      )
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  type RawProduct = {
    id: string;
    name: string;
    description: string | null;
    price_rial: number;
    category: string | null;
    images: string[] | null;
    display_order: number;
    is_active: boolean;
    stock_levels: { quantity_on_hand: number; low_stock_threshold: number } | null;
  };

  return ((data as unknown as RawProduct[]) || []).map((product) => ({
    ...product,
    quantity_on_hand: product.stock_levels?.quantity_on_hand || 0,
    low_stock_threshold: product.stock_levels?.low_stock_threshold || 5,
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabaseServer
    .from('products')
    .select(`
      id,
      name,
      description,
      price_rial,
      category,
      images,
      display_order,
      is_active,
      created_at,
      stock_levels (
        quantity_on_hand,
        low_stock_threshold
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  type RawProduct = {
    id: string;
    name: string;
    description: string | null;
    price_rial: number;
    category: string | null;
    images: string[] | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    stock_levels: { quantity_on_hand: number; low_stock_threshold: number } | null;
  };

  const raw = data as unknown as RawProduct;
  const stock = raw.stock_levels;
  return {
    ...raw,
    stock_levels: stock || null,
    quantity_on_hand: stock?.quantity_on_hand || 0,
    low_stock_threshold: stock?.low_stock_threshold || 5,
  } as Product;
}

export function getStockStatus(product: ProductCard | Product): 'in_stock' | 'low_stock' | 'out_of_stock' {
  const qty = product.quantity_on_hand;
  const threshold = product.low_stock_threshold;

  if (qty === 0) return 'out_of_stock';
  if (qty <= threshold) return 'low_stock';
  return 'in_stock';
}

export function getStockLabel(status: 'in_stock' | 'low_stock' | 'out_of_stock'): string {
  switch (status) {
    case 'in_stock':
      return 'موجود';
    case 'low_stock':
      return 'موجودی کم';
    case 'out_of_stock':
      return 'ناموجود';
  }
}

export function getStockColor(status: 'in_stock' | 'low_stock' | 'out_of_stock'): string {
  switch (status) {
    case 'in_stock':
      return 'bg-green-100 text-green-700';
    case 'low_stock':
      return 'bg-yellow-100 text-yellow-700';
    case 'out_of_stock':
      return 'bg-red-100 text-red-700';
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price);
}

const LEGACY_PLACEHOLDER = '/placeholder-product.jpg';

export function getProductImages(product: { images?: string[] | null }): string[] {
  if (!product.images || product.images.length === 0) return [];
  return product.images.filter((url) => url && url !== LEGACY_PLACEHOLDER);
}

export const CATEGORY_LABELS: Record<string, string> = {
  food: 'غذا',
  medicine: 'دارو',
  accessories: 'لوازم جانبی',
  grooming: 'شستشو و اصلاح',
};