import { unstable_cache } from "next/cache";
import type { SellingUnit } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PRODUCT_TAG } from "@/lib/cms";

interface RawFeaturedProduct {
  id: string;
  name: string;
  description: string;
  price_rial: number;
  category: string;
  images: string[] | null;
  is_active: boolean;
  selling_unit: SellingUnit | null;
  quantity_step: number | null;
  min_quantity: number | null;
  max_quantity: number | null;
  stock_levels: {
    quantity_on_hand: number;
    low_stock_threshold: number;
  } | null;
}

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
  selling_unit: SellingUnit;
  quantity_step: number;
  min_quantity: number;
  max_quantity: number | null;
}

async function fetchFeaturedProducts(): Promise<FeaturedProduct[]> {
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
      selling_unit,
      quantity_step,
      min_quantity,
      max_quantity,
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

  return ((data as unknown as RawFeaturedProduct[]) || []).map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price_rial: product.price_rial,
    category: product.category,
    images: product.images || [],
    quantity_on_hand: product.stock_levels?.quantity_on_hand ?? 0,
    low_stock_threshold: product.stock_levels?.low_stock_threshold ?? 5,
    is_active: product.is_active,
    selling_unit: product.selling_unit ?? "PIECE",
    quantity_step: product.quantity_step || 1,
    min_quantity: product.min_quantity || 1,
    max_quantity: product.max_quantity ?? null,
  }));
}

// Tagged cache: admin product/stock edits fire POST /api/revalidate with the
// 'products' tag (see refine data-provider), so featured rows + the ISR
// homepage pick up edits immediately instead of waiting out the 300s.
export const getFeaturedProducts = unstable_cache(fetchFeaturedProducts, ["featured-products"], {
  revalidate: 300,
  tags: [PRODUCT_TAG],
});