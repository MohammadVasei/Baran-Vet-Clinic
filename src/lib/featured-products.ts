import { supabaseAdmin } from "@/lib/supabase-admin";

export interface FeaturedProduct {
  id: string;
  name: string;
  description: string;
  price_rial: number;
  category: string;
  images: string[];
  quantity_on_hand: number;
  low_stock_threshold: number;
  is_active: boolean;
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      name,
      description,
      price_rial,
      category,
      images,
      is_active,
      is_featured,
      stock_levels (
        quantity_on_hand,
        low_stock_threshold
      )
    `)
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Featured products error:", error);
    return [];
  }

  return (data || []).map((product: any) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price_rial: product.price_rial,
    category: product.category,
    images: product.images || [],
    quantity_on_hand: product.stock_levels?.quantity_on_hand ?? 0,
    low_stock_threshold: product.stock_levels?.low_stock_threshold ?? 5,
    is_active: product.is_active,
  }));
}