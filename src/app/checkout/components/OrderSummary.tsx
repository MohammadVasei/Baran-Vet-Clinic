"use client";

import { formatPrice } from "@/lib/products";
import { ShoppingCartIcon } from "@/components/icons";

interface OrderSummaryProps {
  itemCount: number;
  subtotal: number;
  shipping?: number;
}

export function OrderSummary({ itemCount, subtotal, shipping = 0 }: OrderSummaryProps) {
  const total = subtotal + shipping;

  return (
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
  );
}