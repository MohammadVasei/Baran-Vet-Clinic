"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import Link from "next/link";
import { XCircleIcon, AlertCircleIcon, PackageIcon, ArrowIcon, RotateCcwIcon, PhoneIcon, ShieldIcon, TruckIcon, RotateCcwIcon as RotateCcwIcon2 } from "@/components/icons";
import { formatPrice, CATEGORY_LABELS } from "@/lib/products";
import { CLINIC } from "@/lib/content";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_rial: number;
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
} | null;

interface CheckoutFailedClientProps {
  order: Order;
  cancelled: boolean;
  error?: string | null;
}

export function CheckoutFailedClient({ order, cancelled, error }: CheckoutFailedClientProps) {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".error-icon", { once: true, y: 24, delay: 0.1 }),
        revealUp(".error-details", { once: true, y: 24, delay: 0.2 }),
        revealUp(".retry-actions", { once: true, y: 24, delay: 0.3 }),
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
    <section ref={root} id="checkout-failed" className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="container-site relative">
        {/* Error Icon */}
        <div className="text-center mb-12">
          <div className="error-icon inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mx-auto mb-6">
            {cancelled ? (
              <XCircleIcon className="size-12 text-red-600" />
            ) : (
              <AlertCircleIcon className="size-12 text-red-600" />
            )}
          </div>
          <h1 ref={headline} className="font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl">
            {cancelled ? "پرداخت لغو شد" : "پرداخت ناموفق بود"}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {cancelled
              ? "شما از فرآیند پرداخت منصرف شدید. سفارش شما در وضعیت «در انتظار پرداخت» باقی مانده و می‌توانید در هر زمانی مجدداً تلاش کنید."
              : "متأسفانه پرداخت شما با خطا مواجه شد. لطفاً مجدداً تلاش کنید یا با ما تماس بگیرید."}
          </p>
        </div>

        {order && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info */}
              <div className="error-details rounded-app-lg border border-border bg-surface p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <PackageIcon className="size-5 text-primary-text" />
                  جزئیات سفارش
                </h2>
                <dl className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-app bg-background">
                    <dt className="text-muted-foreground">کد سفارش</dt>
                    <dd className="font-mono font-bold text-primary-text">{order.id.slice(0, 8).toUpperCase()}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-app bg-background">
                    <dt className="text-muted-foreground">تاریخ سفارش</dt>
                    <dd className="font-medium">{formatDate(order.created_at)}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-app bg-background">
                    <dt className="text-muted-foreground">مبلغ</dt>
                    <dd className="font-display font-bold text-primary-text">{formatPrice(order.total_rial)} <span className="font-body text-sm">ریال</span></dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-app bg-background">
                    <dt className="text-muted-foreground">وضعیت</dt>
                    <dd className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                      <AlertCircleIcon className="size-4" /> {cancelled ? "لغو شده" : "در انتظار پرداخت"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Items */}
              <div className="rounded-app-lg border border-border bg-surface p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <PackageIcon className="size-5 text-primary-text" />
                  اقلام سفارش
                </h2>
                <div className="space-y-3">
                  {order.order_items.map((item, idx) => {
                    const product = item.products?.[0];
                    const lineTotal = item.unit_price_rial * item.quantity;
                    return (
                      <div key={idx} className="flex gap-4 p-4 rounded-app border border-border bg-background opacity-70">
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

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <span className="font-display text-xl font-bold text-foreground">مبلغ کل</span>
                    <span className="font-display text-2xl font-bold text-primary-text">
                      {formatPrice(order.total_rial)} <span className="font-body text-sm">ریال</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Retry Actions */}
            <div className="space-y-6">
              <div className="retry-actions rounded-app-lg border border-border bg-surface p-6 sticky top-24">
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <RotateCcwIcon className="size-5 text-primary-text" />
                  چه کار باید انجام دهید؟
                </h2>
                <div className="space-y-3">
                  <Link
                    href={`/checkout?order_id=${order.id}`}
                    className="block w-full text-center px-6 py-3 rounded-app bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity"
                  >
                    تلاش مجدد برای پرداخت
                  </Link>
                  <p className="text-center text-sm text-muted-foreground">یا</p>
                  <Link
                    href="/services/petshop"
                    className="block w-full text-center px-6 py-3 rounded-app border border-border bg-surface font-bold hover:bg-muted transition-colors"
                  >
                    بازگشت به پت‌شاپ
                  </Link>
                </div>

                {error && (
                  <div className="mt-4 p-3 rounded-app bg-red-50 border border-red-100">
                    <p className="text-sm text-red-700 font-medium">کد خطا: {error}</p>
                    <p className="text-xs text-red-600 mt-1">این کد را به پشتیبانی گزارش دهید.</p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <p className="font-label text-sm text-primary-text">راهنمای حل مشکل</p>
                  <ul className="space-y-2 text-sm text-muted-foreground text-right">
                    <li className="flex items-center gap-2"><ShieldIcon className="size-4 text-primary-text" /> مطمئن شوید کارت شما برای پرداخت اینترنتی فعال است</li>
                    <li className="flex items-center gap-2"><ShieldIcon className="size-4 text-primary-text" /> موجودی کارت باید بیشتر از مبلغ سفارش باشد</li>
                    <li className="flex items-center gap-2"><ShieldIcon className="size-4 text-primary-text" /> در صورت تکرار خطا، با پشتیبانی تماس بگیرید</li>
                    <li className="flex items-center gap-2"><ShieldIcon className="size-4 text-primary-text" /> سفارش شما ذخیره شده و از بین نمی‌رود</li>
                  </ul>
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-app-lg border border-border bg-surface p-6 space-y-4">
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
        )}

        {!order && (
          <div className="text-center max-w-md mx-auto">
            <PackageIcon className="size-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground">سفارش یافت نشد</h2>
            <p className="mt-2 text-muted-foreground">لطفاً از پت‌شاپ مجدداً خریداری کنید یا با پشتیبانی تماس بگیرید.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/services/petshop"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-app bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity"
              >
                رفتن به پت‌شاپ
              </Link>
              <a
                href={CLINIC.phoneHref}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-app border border-border bg-surface font-bold hover:bg-muted transition-colors"
                dir="ltr"
              >
                <PhoneIcon className="size-5" />
                تماس با پشتیبانی
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}