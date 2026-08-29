"use client";

import { useEffect } from "react";
import { XIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingCartIcon } from "@/components/icons";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useGSAP, gsap } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const {
    state,
    removeItem,
    updateQuantity,
    clearCart,
    closeCart,
    getSubtotal,
    getItemCount,
  } = useCart();
  const { items, isOpen } = state;
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !drawerRef.current || !contentRef.current) return;

      const tl = gsap.timeline();
      tl.fromTo(
        drawerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" }
      ).fromTo(
        contentRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.4, ease: "power3.out" },
        "<"
      );

      return () => tl.kill();
    },
    { scope: drawerRef, dependencies: [isOpen, reduced] }
  );

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={closeCart}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-sm lg:max-w-md bg-background shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="سبد خرید"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display text-xl font-bold text-foreground">سبد خرید</h2>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="بستن سبد خرید"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div ref={contentRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
              <ShoppingCartIcon className="size-16 mb-4 opacity-50" />
              <p className="font-medium">سبد خرید خالی است</p>
              <p className="text-sm mt-1">محصولاتی را به سبد اضافه کنید</p>
            </div>
          ) : (
            <>
              <ul className="space-y-4" role="list" aria-label="آیتم‌های سبد خرید">
                {items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex gap-3 p-3 rounded-app border border-border bg-surface"
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
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">مجموع ({itemCount} مورد)</span>
                  <span className="font-display font-bold text-foreground">
                    {formatPrice(subtotal)} <span className="font-body text-xs">ریال</span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  هزینه ارسال در تسویه‌حساب محاسبه می‌شود
                </p>
                <Button
                  className="w-full py-3 text-lg"
                  onClick={() => {
                    closeCart();
                    window.location.href = "/checkout";
                  }}
                >
                  ادامه به تسویه‌حساب
                </Button>
                {items.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                  >
                    خالی کردن سبد
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}