"use client";

import Link from "next/link";
import { CreditCardIcon, ArrowIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useCms } from "@/context/CmsContext";

export function ContactCTA() {
  const CLINIC = useCms().clinic;
  return (
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
  );
}

export function BackToShopLink() {
  return (
    <div className="mt-12">
      <Link
        href="/services/petshop"
        className="link-reveal inline-flex items-center gap-1.5 font-label text-sm font-medium text-muted-foreground hover:text-primary-text"
      >
        <ArrowIcon direction="back" className="size-4" />
        ادامه خرید
      </Link>
    </div>
  );
}