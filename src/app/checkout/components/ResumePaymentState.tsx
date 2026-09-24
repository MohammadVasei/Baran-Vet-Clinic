"use client";

import Link from "next/link";
import { PackageIcon, ArrowIcon, RotateCcwIcon, AlertCircleIcon, CheckCircleIcon } from "@/components/icons";
import { formatPrice, formatQuantity, CATEGORY_LABELS, UNIT_LABELS, type SellingUnit } from "@/lib/products";

export interface ResumeOrder {
  id: string;
  customer_name: string;
  total_rial: number;
  status: string;
  zarinpal_ref_id: string | null;
  created_at: string;
  order_items: Array<{
    quantity: number;
    unit_price_rial: number;
    product_id: string;
    product_name: string | null;
    selling_unit: SellingUnit | null;
    products: Array<{ name: string; images: string[] | null; category: string | null }> | null;
  }>;
}

interface ResumePaymentStateProps {
  order: ResumeOrder;
  onResume: () => void;
  resuming: boolean;
  error: string | null;
}

export function ResumePaymentState({ order, onResume, resuming, error }: ResumePaymentStateProps) {
  const alreadyPaid = Boolean(order.zarinpal_ref_id);

  return (
    <section id="checkout-resume" className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="container-site relative max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 mx-auto mb-6">
            <PackageIcon className="size-12 text-yellow-600" />
          </div>
          <h1 className="font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl">
            {alreadyPaid ? "سفارش پرداخت شده است" : "ادامه پرداخت سفارش"}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {alreadyPaid
              ? "این سفارش قبلاً پرداخت شده است و در حال پردازش است."
              : "سفارش شما از مرحله قبل ذخیره شده است و از بین نرفته است. برای تکمیل پرداخت از دکمه زیر استفاده کنید."}
          </p>
        </div>

        <div className="rounded-app-lg border border-border bg-surface p-6">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-app bg-background text-center">
              <dt className="text-sm text-muted-foreground">کد سفارش</dt>
              <dd className="mt-1 font-mono font-bold text-primary-text">{order.id.slice(0, 8).toUpperCase()}</dd>
            </div>
            <div className="p-4 rounded-app bg-background text-center">
              <dt className="text-sm text-muted-foreground">مبلغ</dt>
              <dd className="mt-1 font-display font-bold text-primary-text">{formatPrice(order.total_rial)}</dd>
            </div>
            <div className="p-4 rounded-app bg-background text-center">
              <dt className="text-sm text-muted-foreground">تاریخ ثبت</dt>
              <dd className="mt-1 font-medium">
                {new Date(order.created_at).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" })}
              </dd>
            </div>
          </dl>

          <div className="mt-6 space-y-3">
            {order.order_items.map((item, idx) => {
              const product = item.products?.[0];
              const unit = item.selling_unit ?? 'PIECE';
              const itemName = item.product_name ?? product?.name ?? "محصول نامشخص";
              const unitDenominator = UNIT_LABELS[unit] ? ` / ${UNIT_LABELS[unit]}` : "";
              return (
                <div key={idx} className="flex gap-4 p-4 rounded-app border border-border bg-background">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-app overflow-hidden bg-muted">
                    {product?.images?.[0] ? (
                      <img src={product.images[0]} alt={itemName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PackageIcon className="size-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-medium text-foreground truncate">{itemName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {product?.category ? CATEGORY_LABELS[product.category] || product.category : "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      مقدار: {formatQuantity(item.quantity, unit)} — {formatPrice(item.unit_price_rial * item.quantity)} ریال{unitDenominator}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 p-3 rounded-app bg-red-50 border border-red-100 text-red-700 text-sm">
              <AlertCircleIcon className="size-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {alreadyPaid ? (
              <Link
                href={`/checkout/success?order_id=${order.id}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-app bg-green-600 text-white font-bold hover:opacity-90 transition-opacity"
              >
                <CheckCircleIcon className="size-5" />
                مشاهده جزئیات سفارش
              </Link>
            ) : (
              <button
                onClick={onResume}
                disabled={resuming}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-app bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                <RotateCcwIcon className="size-5" />
                {resuming ? "در حال اتصال به درگاه..." : "ادامه پرداخت"}
              </button>
            )}
            <Link
              href="/services/petshop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-app border border-border bg-surface text-foreground font-bold hover:bg-muted transition-colors"
            >
              <ArrowIcon direction="back" className="size-4" />
              بازگشت به پت‌شاپ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}