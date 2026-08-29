"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import Link from "next/link";
import { CheckCircleIcon, PackageIcon, MapPinIcon, PhoneIcon, CreditCardIcon, ArrowIcon, ClockIcon, RotateCcwIcon, ShieldIcon, TruckIcon, UserIcon } from "@/components/icons";
import { formatPrice, CATEGORY_LABELS } from "@/lib/products";
import { CLINIC } from "@/lib/content";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_rial: number;
  zarinpal_ref_id: string | null;
  status: string;
  created_at: string;
  order_items: Array<{
    quantity: number;
    unit_price_rial: number;
    product_id: string;
    products: Array<{
      name: string;
      images: string[] | null;
      category: string | null;
    }> | null;
  }>;
}

interface CheckoutSuccessClientProps {
  order: Order;
}

export function CheckoutSuccessClient({ order }: CheckoutSuccessClientProps) {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".success-icon", { once: true, y: 24, delay: 0.1 }),
        revealUp(".order-summary", { once: true, y: 24, delay: 0.2 }),
        revealUp(".order-details", { once: true, y: 24, delay: 0.3 }),
        revealUp(".next-steps", { once: true, y: 24, delay: 0.4 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced] }
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section ref={root} id="checkout-success" className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="container-site relative">
        {/* Success Icon */}
        <div className="text-center mb-12">
          <div className="success-icon inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mx-auto mb-6">
            <CheckCircleIcon className="size-12 text-green-600" />
          </div>
          <h1 ref={headline} className="font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl">
            سفارش شما با موفقیت ثبت شد
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            تشکر از اعتماد شما. سفارش شما پرداخت شده و در حال پردازش برای ارسال است.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Summary */}
          <div className="order-summary lg:col-span-2 space-y-6">
            {/* Order Info Card */}
            <div className="rounded-app-lg border border-border bg-surface p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <PackageIcon className="size-5 text-primary-text" />
                خلاصه سفارش
              </h2>
              <dl className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-app bg-background">
                  <dt className="text-muted-foreground">کد سفارش</dt>
                  <dd className="font-mono font-bold text-primary-text">{order.id.slice(0, 8).toUpperCase()}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-app bg-background">
                  <dt className="text-muted-foreground">تاریخ سفارش</dt>
                  <dd className="font-medium">{formatDate(order.created_at)}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-app bg-background">
                  <dt className="text-muted-foreground">مرجع پرداخت</dt>
                  <dd className="font-mono text-sm text-green-600">{order.zarinpal_ref_id || "—"}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-app bg-background">
                  <dt className="text-muted-foreground">وضعیت</dt>
                  <dd className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    <CheckCircleIcon className="size-4" /> پرداخت شده
                  </dd>
                </div>
              </dl>
            </div>

            {/* Items */}
            <div className="order-details rounded-app-lg border border-border bg-surface p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <PackageIcon className="size-5 text-primary-text" />
                اقلام سفارش
              </h2>
              <div className="space-y-3">
                {order.order_items.map((item, idx) => {
                  const product = item.products?.[0];
                  const lineTotal = item.unit_price_rial * item.quantity;
                  return (
                    <div key={idx} className="flex gap-4 p-4 rounded-app border border-border bg-background">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-app overflow-hidden bg-muted">
                        {product?.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PackageIcon className="size-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-medium text-foreground truncate">{product?.name || "محصول نامشخص"}</h4>
                        <p className="text-sm text-muted-foreground">
                          {product?.category ? CATEGORY_LABELS[product.category] || product.category : "—"}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">تعداد: {item.quantity}</span>
                          <span className="font-display font-bold text-primary-text">
                            {formatPrice(lineTotal)} <span className="font-body text-xs">ریال</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <span className="font-display text-xl font-bold text-foreground">مبلغ قابل پرداخت</span>
                  <span className="font-display text-2xl font-bold text-primary-text">
                    {formatPrice(order.total_rial)} <span className="font-body text-sm">ریال</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info + Next Steps */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="rounded-app-lg border border-border bg-surface p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPinIcon className="size-5 text-primary-text" />
                آدرس تحویل
              </h2>
              <address className="space-y-3 not-italic">
                <div className="flex items-start gap-3">
                  <UserIcon className="size-5 text-muted-foreground mt-0.5" />
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="size-5 text-muted-foreground" />
                  <a href={`tel:${order.customer_phone}`} className="text-foreground hover:text-primary-text transition-colors">{order.customer_phone}</a>
                </div>
                <div className="flex items-start gap-3 pt-3 border-t border-border">
                  <MapPinIcon className="size-5 text-muted-foreground mt-0.5" />
                  <span className="whitespace-pre-wrap text-muted-foreground">{order.customer_phone}</span>
                </div>
              </address>
            </div>

            {/* Next Steps */}
            <div className="next-steps rounded-app-lg border border-border bg-surface p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <ClockIcon className="size-5 text-primary-text" />
                مراحل بعدی
              </h2>
              <ol className="space-y-4">
                <li className="flex gap-3 p-3 rounded-app bg-green-50 border border-green-100">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircleIcon className="size-4 text-green-600" />
                  </span>
                  <div>
                    <p className="font-medium text-green-800">پرداخت تایید شد</p>
                    <p className="text-sm text-green-700">مبلغ از کارت شما کسر گردید</p>
                  </div>
                </li>
                <li className="flex gap-3 p-3 rounded-app bg-blue-50 border border-blue-100">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <PackageIcon className="size-4 text-blue-600" />
                  </span>
                  <div>
                    <p className="font-medium text-blue-800">سفارش در حال پردازش</p>
                    <p className="text-sm text-blue-700">تیم باران سفارش شما را بسته‌بندی می‌کند</p>
                  </div>
                </li>
                <li className="flex gap-3 p-3 rounded-app bg-purple-50 border border-purple-100">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <TruckIcon className="size-4 text-purple-600" />
                  </span>
                  <div>
                    <p className="font-medium text-purple-800">ارسال کالا</p>
                    <p className="text-sm text-purple-700">پیامک کد رهگیری برای شما ارسال می‌شود</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Benefits */}
            <div className="rounded-app-lg border border-border bg-surface p-6 space-y-3">
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
            <div className="pt-4 border-t border-border space-y-4">
              <p className="font-label text-sm text-primary-text">نیاز به کمک دارید؟</p>
              <div className="flex flex-col gap-3">
                <a
                  href={CLINIC.phoneHref}
                  className="flex items-center justify-center gap-2 rounded-app bg-primary px-4 py-3 font-bold text-on-primary transition-opacity hover:opacity-90"
                  dir="ltr"
                >
                  <PhoneIcon className="size-5" />
                  تماس: {CLINIC.phone}
                </a>
                <a
                  href={CLINIC.mobile1WhatsApp}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-center gap-2 rounded-app bg-accent-lime px-4 py-3 font-bold text-white transition-opacity hover:opacity-90"
                >
                  <PhoneIcon className="size-5" />
                  واتساپ: {CLINIC.mobile1}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <Link
          href="/services/petshop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-app bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity"
        >
          ادامه خرید
        </Link>
        <Link
          href="/account/orders"
          className="ml-4 inline-flex items-center gap-2 px-6 py-3 rounded-app border border-border bg-surface font-bold hover:bg-muted transition-colors"
        >
          <ArrowIcon direction="back" className="size-4" />
          مشاهده سفارشات من
        </Link>
      </div>
    </section>
  );
}