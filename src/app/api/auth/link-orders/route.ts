import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const { userId, phone } = await request.json();

    if (!userId || !phone) {
      return NextResponse.json(
        { error: "userId and phone are required" },
        { status: 400 }
      );
    }

    // Normalize phone
    const normalizedPhone = phone.replace(/[^\d]/g, "");
    const formattedPhone = normalizedPhone.startsWith("98")
      ? normalizedPhone
      : "98" + normalizedPhone.replace(/^0/, "");

    // Link orders where user_id is null and phone matches
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ user_id: userId })
      .eq("customer_phone", formattedPhone)
      .is("user_id", null)
      .select("id");

    if (error) {
      console.error("Link orders error:", error);
      return NextResponse.json({ error: "Failed to link orders" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      linkedCount: data?.length || 0,
      linkedOrders: data?.map((o) => o.id) || [],
    });
  } catch (error) {
    console.error("Link orders API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}