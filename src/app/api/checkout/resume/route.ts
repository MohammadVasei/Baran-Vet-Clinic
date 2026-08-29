import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createPaymentRequest } from "@/lib/zarinpal";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, customer_name, total_rial, status, zarinpal_ref_id, zarinpal_authority, created_at")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    // Already paid — no need to re-request payment
    if (order.zarinpal_ref_id) {
      return NextResponse.json(
        { success: true, alreadyPaid: true, orderId: order.id },
        { status: 200 }
      );
    }

    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "این سفارش لغو شده است و امکان پرداخت ندارد." },
        { status: 400 }
      );
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/callback`;
    const paymentResult = await createPaymentRequest(
      order.total_rial,
      `سفارش پت‌شاپ باران - ${order.customer_name || order.id.slice(0, 8)}`,
      callbackUrl
    );

    // Reset status to pending and store the new authority
    await supabaseAdmin
      .from("orders")
      .update({ status: "pending", zarinpal_authority: paymentResult.authority })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      authority: paymentResult.authority,
      redirectUrl: paymentResult.redirectUrl,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Resume checkout error:", error);
    return NextResponse.json(
      { error: "خطا در اتصال به درگاه پرداخت. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}