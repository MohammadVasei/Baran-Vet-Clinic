import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CheckoutPageClient } from "./CheckoutPageClient";

interface CheckoutPageProps {
  searchParams: Promise<{ order_id?: string }>;
}

export const metadata: Metadata = {
  title: "تسویه‌حساب | پت‌شاپ کلینیک باران",
  description: "مرحله نهایی خرید — بررسی سفارش و پرداخت",
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { order_id } = await searchParams;

  let resumeOrder = null;
  if (order_id) {
    const { data } = await supabaseAdmin
      .from("orders")
      .select(
        "id, customer_name, total_rial, status, zarinpal_ref_id, created_at, order_items(quantity,unit_price_rial,product_id,products(name,images,category))"
      )
      .eq("id", order_id)
      .single();
    resumeOrder = data ?? null;
  }

  return <CheckoutPageClient resumeOrder={resumeOrder} />;
}
