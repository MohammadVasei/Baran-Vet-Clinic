"use client";

import Link from "next/link";
import { ShoppingCartIcon, ArrowIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function CheckoutEmptyState() {
  return (
    <section id="checkout" className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="container-site relative">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mx-auto mb-6">
            <ShoppingCartIcon className="size-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl">
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