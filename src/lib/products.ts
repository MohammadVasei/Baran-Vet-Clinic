import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase public environment variables are missing.');
}

// Shared by server fetchers AND client helpers (formatPrice, getStockStatus…).
// Distinct storageKey so this anon client never collides with the AuthContext
// browser client, avoiding GoTrueClient "multiple instances / same storage key"
// warnings in the browser.
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    storageKey: "sb-anon-public-reader",
    detectSessionInUrl: false,
  },
});

export type SellingUnit = 'GRAM' | 'KILOGRAM' | 'PIECE' | 'BRANCH' | 'BAG' | 'PACKAGE';

export const UNIT_LABELS: Record<SellingUnit, string> = {
  GRAM: 'گرم',
  KILOGRAM: 'کیلوگرم',
  PIECE: 'عدد',
  BRANCH: 'شاخه',
  BAG: 'کیسه',
  PACKAGE: 'بسته',
};

export const UNIT_CODES = Object.keys(UNIT_LABELS) as SellingUnit[];

export const WEIGHT_UNITS: SellingUnit[] = ['GRAM', 'KILOGRAM'];

// Business cap for count-based units (replaces the old flat MAX_QTY).
export const COUNT_UNIT_MAX_QUANTITY = 99;

// High technical safety ceiling for weight units (abuse protection). These are
// intentionally generous and separate from the business max_quantity.
export const WEIGHT_UNIT_MAX_QUANTITY: Partial<Record<SellingUnit, number>> = {
  GRAM: 100_000,
  KILOGRAM: 200,
};

export function isWeightUnit(unit?: SellingUnit | null): boolean {
  return !!unit && WEIGHT_UNITS.includes(unit);
}

export function formatQuantity(quantity: number, unit?: SellingUnit | null): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(quantity);
  if (unit && UNIT_LABELS[unit]) return `${formatted} ${UNIT_LABELS[unit]}`;
  return formatted;
}

export function getUnitDenominator(unit?: SellingUnit | null): string {
  if (!unit || !UNIT_LABELS[unit]) return '';
  return `/ ${UNIT_LABELS[unit]}`;
}

// Highest quantity allowed for a single line, given business + technical caps.
// Weight products ignore the count-unit cap and use their own technical ceiling.
export function getQuantityCeiling(options: {
  stock: number;
  selling_unit?: SellingUnit | null;
  max_quantity?: number | null;
}): number {
  const { stock, selling_unit, max_quantity } = options;
  let ceiling = max_quantity ?? Infinity;
  ceiling = Math.min(ceiling, stock >= 0 ? stock : Infinity);
  if (isWeightUnit(selling_unit)) {
    const tech = WEIGHT_UNIT_MAX_QUANTITY[selling_unit as SellingUnit];
    if (tech) ceiling = Math.min(ceiling, tech);
  } else {
    ceiling = Math.min(ceiling, COUNT_UNIT_MAX_QUANTITY);
  }
  return Math.max(1, Math.floor(ceiling));
}

// Snap an arbitrary quantity onto the enforced grid: min + k * step.
export function snapToStep(quantity: number, step = 1, minQuantity = 1): number {
  const min = Math.max(1, Math.floor(minQuantity));
  const s = Math.max(1, Math.floor(step));
  if (quantity <= min) return min;
  return min + Math.round((Math.floor(quantity) - min) / s) * s;
}

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
  selling_unit: SellingUnit | null;
  quantity_step: number;
  min_quantity: number;
  max_quantity: number | null;
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
  selling_unit: SellingUnit | null;
  quantity_step: number;
  min_quantity: number;
  max_quantity: number | null;
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
      selling_unit,
      quantity_step,
      min_quantity,
      max_quantity,
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
    selling_unit: SellingUnit | null;
    quantity_step: number;
    min_quantity: number;
    max_quantity: number | null;
    stock_levels: { quantity_on_hand: number; low_stock_threshold: number } | null;
  };

  return ((data as unknown as RawProduct[]) || []).map((product) => ({
    ...product,
    quantity_on_hand: product.stock_levels?.quantity_on_hand || 0,
    low_stock_threshold: product.stock_levels?.low_stock_threshold || 5,
    selling_unit: product.selling_unit ?? 'PIECE',
    quantity_step: product.quantity_step || 1,
    min_quantity: product.min_quantity || 1,
    max_quantity: product.max_quantity ?? null,
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
      selling_unit,
      quantity_step,
      min_quantity,
      max_quantity,
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
    selling_unit: SellingUnit | null;
    quantity_step: number;
    min_quantity: number;
    max_quantity: number | null;
    stock_levels: { quantity_on_hand: number; low_stock_threshold: number } | null;
  };

  const raw = data as unknown as RawProduct;
  const stock = raw.stock_levels;
  return {
    ...raw,
    stock_levels: stock || null,
    quantity_on_hand: stock?.quantity_on_hand || 0,
    low_stock_threshold: stock?.low_stock_threshold || 5,
    selling_unit: raw.selling_unit ?? 'PIECE',
    quantity_step: raw.quantity_step || 1,
    min_quantity: raw.min_quantity || 1,
    max_quantity: raw.max_quantity ?? null,
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
      return 'bg-accent-green-soft text-accent-green-fg';
    case 'low_stock':
      return 'bg-accent-yellow-soft text-accent-yellow-fg';
    case 'out_of_stock':
      return 'bg-destructive-soft text-destructive-soft-fg';
    default:
      return 'bg-muted text-muted-foreground';
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