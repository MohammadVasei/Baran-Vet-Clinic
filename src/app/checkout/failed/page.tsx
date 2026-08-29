import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { CheckoutFailedClient } from "./CheckoutFailedClient";

interface CheckoutFailedPageProps {
  searchParams: Promise<{ order_id?: string; cancelled?: string; error?: string }>;
}

export async function generateMetadata({ searchParams }: CheckoutFailedPageProps): Promise<Metadata> {
  return {
    title: `پرداخت ناموفق | پت‌شاپ کلینیک باران`,
    description: "پرداخت سفارش شما ناموفق بود. لطفاً مجدداً تلاش کنید.",
  };
}

export default async function CheckoutFailedPage({ searchParams }: CheckoutFailedPageProps) {
  const { order_id, cancelled, error } = await searchParams;

  let order = null;
  if (order_id) {
    const { data } = await supabaseServer
      .from("orders")
      .select("id, customer_name, customer_phone, total_rial, status, created_at, order_items(quantity,unit_price_rial,product_id,products(name,images,category))")
      .eq("id", order_id)
      .single();
    order = data;
  }

  return <CheckoutFailedClient order={order} cancelled={cancelled === "true"} error={error} />;
}