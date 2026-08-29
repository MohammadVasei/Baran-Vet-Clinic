import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
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
      return NextResponse.json(
        { error: "خطا در دریافت محصولات ویژه" },
        { status: 500 }
      );
    }

    const products = (data || []).map((product: any) => ({
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

    return NextResponse.json(products);
  } catch (error) {
    console.error("Featured products error:", error);
    return NextResponse.json(
      { error: "خطا در پردازش درخواست" },
      { status: 500 }
    );
  }
}
