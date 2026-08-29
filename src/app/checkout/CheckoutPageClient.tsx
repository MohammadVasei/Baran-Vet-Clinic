"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, getProductImages } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { XIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingCartIcon, CreditCardIcon, ArrowIcon, ShieldIcon, TruckIcon, RotateCcwIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CLINIC } from "@/lib/content";
import { Button } from "@/components/ui/button";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(100),
  customerPhone: z.string().regex(/^0?\d{10,11}$/, "شماره تلفن معتبر نیست"),
  customerAddress: z.string().min(10, "آدرس باید حداقل ۱۰ کاراکتر باشد").max(500),
});

export function CheckoutPageClient() {
  const router = useRouter();
  const {
    state,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getItemCount,
  } = useCart();
  const { items } = state;
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".checkout-items", { once: true, y: 24, delay: 0.1 }),
        revealUp(".checkout-summary", { once: true, y: 24, delay: 0.2 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced] }
  );

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const shipping = 0;
  const total = subtotal + shipping;

  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
    },
  });

  const handleFormSubmit = async (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
  }) => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerName: data.customerName.trim(),
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress.trim(),
        }),
      });

      const result = await response.json();

      if (result.redirectUrl) {
        router.push(result.redirectUrl);
      } else {
        alert(result.error || "خطا در ایجاد سفارش");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("خطا در اتصال به درگاه پرداخت");
    }
  };

  if (items.length === 0) {
    return (
      <section ref={root} id="checkout" className="relative overflow-hidden bg-background py-16 lg:py-24">
        <div className="container-site relative">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mx-auto mb-6">
              <ShoppingCartIcon className="size-10 text-muted-foreground" />
            </div>
            <h1 ref={headline} className="font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl">
              سبد خرید شما خالی است
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              محصولاتی را به سبد اضافه کنید تا بتوانید تسویه‌حساب کنید.
            </p>
            <div className="mt-8">
              <Link
                href="/services/petshop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-app bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity"
              >
                <ArrowIcon direction="back" className="size-4" />
                خرید از پت‌شاپ
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={root} id="checkout" className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="container-site relative">
        <h1 ref={headline} className="font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl mb-10">
          تسویه‌حساب
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Items */}
          <div className="checkout-items lg:col-span-2 space-y-6">
            <ul className="space-y-4" role="list" aria-label="آیتم‌های سفارش">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-4 p-4 rounded-app border border-border bg-surface"
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-app overflow-hidden bg-muted">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCartIcon className="size-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                    <p className="text-sm text-primary-text font-display">
                      {formatPrice(item.price_rial)} <span className="font-body text-xs">ریال</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="کاهش تعداد"
                      >
                        <MinusIcon className="size-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 rounded border border-border hover:bg-muted"
                        aria-label="افزایش تعداد"
                      >
                        <PlusIcon className="size-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                        aria-label={`حذف ${item.name}`}
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">مجموع: {formatPrice(item.price_rial * item.quantity)} ریال</p>
                  </div>
                </li>
              ))}
            </ul>

            {items.length > 0 && (
              <div className="rounded-app border border-border bg-surface p-4">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={clearCart}
                >
                  <TrashIcon className="size-4 mr-1" />
                  خالی کردن سبد
                </Button>
              </div>
            )}
          </div>

          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="customer-name">نام و نام خانوادگی <span className="text-destructive">*</span></Label>
                <Input
                  id="customer-name"
                  {...form.register("customerName")}
                  required
                  className="mt-2"
                />
                {form.formState.errors.customerName && (
                  <p className="text-sm text-red-600">{form.formState.errors.customerName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customer-phone">شماره تماس <span className="text-destructive">*</span></Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  {...form.register("customerPhone")}
                  required
                  className="mt-2"
                />
                {form.formState.errors.customerPhone && (
                  <p className="text-sm text-red-600">{form.formState.errors.customerPhone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customer-address">آدرس دفتر받ی <span className="text-destructive">*</span></Label>
                <Textarea
                  id="customer-address"
                  {...form.register("customerAddress")}
                  required
                  rows={3}
                  className="mt-2"
                />
                {form.formState.errors.customerAddress && (
                  <p className="text-sm text-red-600">{form.formState.errors.customerAddress.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full py-3">
                "ادامه به پرداخت"
                <CreditCardIcon className="size-5 mr-2" />
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary order-2 lg:order-1">
            <div className="rounded-app-lg border border-border bg-surface p-6 sticky top-24">
              <h2 className="font-display text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <ShoppingCartIcon className="size-5 text-primary-text" />
                خلاصه سفارش
              </h2>
              <dl className="space-y-4">
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">مجموع اقلام ({itemCount} مورد)</dt>
                  <dd className="font-display font-bold text-foreground">{formatPrice(subtotal)} <span className="font-body text-xs">ریال</span></dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">هزینه ارسال</dt>
                  <dd className="font-display font-bold text-foreground">
                    {shipping === 0 ? (
                      <span className="text-green-600">رایگان</span>
                    ) : (
                      <>{formatPrice(shipping)} <span className="font-body text-xs">ریال</span></>
                    )}
                  </dd>
                </div>
                <div className="pt-4 border-t border-border flex justify-between">
                  <dt className="font-medium text-foreground">مبلغ قابل پرداخت</dt>
                  <dd className="font-display text-xl font-bold text-primary-text">{formatPrice(total)} <span className="font-body text-sm">ریال</span></dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground text-center">
                با ادامه، شما با <a href="#" className="underline hover:text-primary-text">قوانین و مقررات</a> موافقت می‌کنید.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-6 order-3 lg:order-1 rounded-app-lg border border-border bg-surface p-6 space-y-3">
            <h3 className="font-label text-sm text-primary-text">ضمانت‌های باران</h3>
            <div className="flex items-center gap-3 p-3 rounded-app bg-background">
              <div className="p-2 rounded-lg bg-green-100 text-green-700"><ShieldIcon className="size-5" /></div>
              <div>
                <p className="font-medium text-foreground">اصل و با گارانتی</p>
                <p className="text-sm text-muted-foreground">تمام محصولات از توزیع‌کنندگان رسمی تأمین می‌شوند</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-app bg-background">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><TruckIcon className="size-5" /></div>
              <div>
                <p className="font-medium text-foreground">تحویل سریع در مشهد</p>
                <p className="text-sm text-muted-foreground">امکان تحویل در کلینیک یا ارسال پستی</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-app bg-background">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><RotateCcwIcon className="size-5" /></div>
              <div>
                <p className="font-medium text-foreground">استرجاع آسان</p>
                <p className="text-sm text-muted-foreground">۷ روز ضمانت بازگشت کالا (شرایط اعمال می‌شود)</p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-6 pt-6 border-t border-border space-y-4 order-4 lg:order-1">
            <p className="font-label text-sm text-primary-text">نیاز به کمک دارید؟</p>
            <div className="flex flex-col gap-3">
              <a
                href={CLINIC.phoneHref}
                className="flex items-center justify-center gap-2 rounded-app bg-primary px-4 py-3 font-bold text-on-primary transition-opacity hover:opacity-90"
                dir="ltr"
              >
                <CreditCardIcon className="size-5" />
                تماس: {CLINIC.phone}
              </a>
              <a
                href={CLINIC.mobile1WhatsApp}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-center gap-2 rounded-app bg-accent-lime px-4 py-3 font-bold text-white transition-opacity hover:opacity-90"
              >
                <CreditCardIcon className="size-5" />
                واتساپ: {CLINIC.mobile1}
              </a>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12">
          <Link
            href="/services/petshop"
            className="link-reveal inline-flex items-center gap-1.5 font-label text-sm font-medium text-muted-foreground hover:text-primary-text"
          >
            <ArrowIcon direction="back" className="size-4" />
            ادامه خرید
          </Link>
        </div>
      </div>
    </section>
  );
}