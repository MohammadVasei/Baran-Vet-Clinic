import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { userId, phone } = await request.json();

    if (!userId || !phone) {
      return NextResponse.json(
        { error: "userId and phone are required" },
        { status: 400 }
      );
    }

    // Only allow linking for the authenticated user's own orders
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Normalize phones and ensure the claimed phone belongs to the user
    const userPhoneDigits = (user.phone || "").replace(/[^\d]/g, "");
    const providedDigits = phone.replace(/[^\d]/g, "");
    if (!userPhoneDigits || userPhoneDigits !== providedDigits) {
      return NextResponse.json({ success: true, linkedCount: 0, linkedOrders: [] });
    }

    const formattedPhone = providedDigits.startsWith("98")
      ? providedDigits
      : "98" + providedDigits.replace(/^0/, "");

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