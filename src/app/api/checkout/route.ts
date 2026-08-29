import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";
import { createPaymentRequest } from "@/lib/zarinpal";

const CheckoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid("شناسه محصول نامعتبر"),
      quantity: z.number().int().min(1, "تعداد باید حداقل ۱ باشد"),
    })
  ).min(1, "سبد خرید خالی است"),
  customerName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(100),
  customerPhone: z.string().regex(/^0?\d{10,11}$/, "شماره تلفن معتبر نیست"),
  customerAddress: z.string().min(10, "آدرس باید حداقل ۱۰ کاراکتر باشد").max(500),
});

function normalizePhone(phone: string): string {
  const faToEn = phone.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
  return faToEn.replace(/[^\d]/g, "");
}

function generateReferenceCode(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BARAN-${dateStr}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const digits = normalizePhone(data.customerPhone);
    // Canonical international-digits form: 98912xxxxxxx (matches link-orders API and auth.users.phone)
    const phone = digits.startsWith("98") ? digits : "98" + digits.replace(/^0/, "");
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/callback`;

    // Fetch products and validate stock
    const productIds = data.items.map((i) => i.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price_rial, is_active, stock_levels(quantity_on_hand)")
      .in("id", productIds);

    if (productsError) {
      console.error("Products fetch error:", productsError);
      return NextResponse.json({ error: "خطا در دریافت اطلاعات محصولات" }, { status: 500 });
    }

    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: "یک یا چند محصول یافت نشد" }, { status: 404 });
    }

    // Validate each item
    const orderItems: { product_id: string; quantity: number; unit_price_rial: number }[] = [];
    let total = 0;

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `محصول ${item.productId} یافت نشد` }, { status: 404 });
      }
      if (!product.is_active) {
        return NextResponse.json({ error: `محصول ${product.name} فعال نیست` }, { status: 400 });
      }

      const stockLevels = product.stock_levels as
        | { quantity_on_hand?: number }
        | { quantity_on_hand?: number }[]
        | null
        | undefined;
      const stock = stockLevels
        ? Array.isArray(stockLevels)
          ? stockLevels[0]?.quantity_on_hand || 0
          : stockLevels.quantity_on_hand || 0
        : 0;
      if (stock < item.quantity) {
        return NextResponse.json(
          { error: `موجودی محصول ${product.name} کافی نیست (موجود: ${stock})` },
          { status: 409 }
        );
      }

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price_rial: product.price_rial,
      });
      total += product.price_rial * item.quantity;
    }

    // Create order
    const referenceCode = generateReferenceCode();
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customerName.trim(),
        customer_phone: phone,
        customer_address: data.customerAddress.trim(),
        status: "pending",
        zarinpal_authority: "", // will be filled after payment request
        total_rial: total,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: "خطا در ایجاد سفارش" }, { status: 500 });
    }

    // Create order items
    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      // Clean up order
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "خطا در ثبت اقلام سفارش" }, { status: 500 });
    }

    // Request payment from ZarinPal
    const paymentResult = await createPaymentRequest(
      total,
      `سفارش پت‌شاپ باران - ${referenceCode}`,
      callbackUrl,
      { order_id: order.id, reference_code: referenceCode }
    );

    // Update order with authority
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ zarinpal_authority: paymentResult.authority })
      .eq("id", order.id);

    if (updateError) {
      console.error("Order authority update error:", updateError);
    }

    return NextResponse.json({
      success: true,
      authority: paymentResult.authority,
      redirectUrl: paymentResult.redirectUrl,
      orderId: order.id,
      referenceCode,
    });
  } catch (error) {
    console.error("Checkout API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "داده‌های نامعتبر", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "خطا در پردازش سفارش. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}