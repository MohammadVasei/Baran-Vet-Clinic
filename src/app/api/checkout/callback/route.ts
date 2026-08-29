import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyPayment } from "@/lib/zarinpal";
import { sendOrderSMS } from "@/lib/sms";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!authority) {
    return NextResponse.redirect(`${baseUrl}/checkout/failed?error=missing_authority`);
  }

  if (status !== "OK") {
    // Payment cancelled or failed by user
    await supabaseAdmin
      .from("orders")
      .update({ status: "failed" })
      .eq("zarinpal_authority", authority);

    return NextResponse.redirect(`${baseUrl}/checkout/failed?cancelled=true`);
  }

  try {
    // Get order to find amount
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, total_rial, customer_name, customer_phone, status")
      .eq("zarinpal_authority", authority)
      .single();

    if (orderError || !order) {
      console.error("Order not found for authority:", authority);
      return NextResponse.redirect(`${baseUrl}/checkout/failed?error=order_not_found`);
    }

    if (order.status === "paid") {
      // Already processed
      return NextResponse.redirect(`${baseUrl}/checkout/success?order_id=${order.id}`);
    }

    // Verify payment with ZarinPal
    const verification = await verifyPayment(authority, order.total_rial);

    if (verification.status === 100 || verification.status === 101) {
      // Payment successful (100 = success, 101 = already verified)
      // Decrement stock via RPC function
      const { error: rpcError } = await supabaseAdmin.rpc("decrement_stock_on_payment", {
        p_order_id: order.id,
      });

      if (rpcError) {
        console.error("Stock decrement failed:", rpcError);
        // Don't fail the payment - stock can be manually adjusted
        // But log for investigation
      }

      // Update order as paid
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          zarinpal_ref_id: verification.refId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Order paid update error:", updateError);
      }

      // Send SMS confirmation
      sendOrderSMS({
        phone: order.customer_phone,
        orderId: order.id,
        total: order.total_rial,
        status: "paid",
      }).catch((err) => console.error("Order SMS failed:", err));

      return NextResponse.redirect(`${baseUrl}/checkout/success?order_id=${order.id}`);
    } else {
      // Payment failed
      await supabaseAdmin
        .from("orders")
        .update({ status: "failed" })
        .eq("id", order.id);

      sendOrderSMS({
        phone: order.customer_phone,
        orderId: order.id,
        total: order.total_rial,
        status: "failed",
      }).catch((err) => console.error("Order SMS failed:", err));

      return NextResponse.redirect(`${baseUrl}/checkout/failed?order_id=${order.id}`);
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.redirect(`${baseUrl}/checkout/failed?error=verification_failed`);
  }
}