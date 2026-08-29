import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { CheckoutSuccessClient } from "./CheckoutSuccessClient";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ order_id?: string }>;
}

export async function generateMetadata({ searchParams }: CheckoutSuccessPageProps): Promise<Metadata> {
  const { order_id } = await searchParams;
  return {
    title: `سفارش موفق | پت‌شاپ کلینیک باران`,
    description: "سفارش شما با موفقیت پرداخت شد و در حال پردازش است.",
  };
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { order_id } = await searchParams;

  if (!order_id) {
    notFound();
  }

  const { data: order, error } = await supabaseServer
    .from("orders")
    .select("id, customer_name, customer_phone, total_rial, zarinpal_ref_id, status, created_at, order_items(quantity,unit_price_rial,product_id,products(name,images,category))")
    .eq("id", order_id)
    .single();

  if (error || !order) {
    notFound();
  }

  return <CheckoutSuccessClient order={order} />;
}