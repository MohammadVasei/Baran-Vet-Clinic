"use client";

import { GoldieVideo } from "@/components/mascot";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="flex min-h-[calc(100svh-var(--header-height))] items-center justify-center px-6 bg-background">
      <div className="mx-auto max-w-md text-center">
        <GoldieVideo
          src="/videos/goldie/sleeping.webm"
          alt="گلدگی، خوابیده"
          className="w-64 h-64 mx-auto mb-8"
        />
        <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
          صفحه پیدا نشد
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          متأسفیم، صفحهٔ مورد نظر شما وجود ندارد یا منتقل شده است.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 btn btn-primary"
        >
          بازگشت به صفحه اصلی
          <ArrowIcon direction="forward" className="size-5" />
        </Link>
      </div>
    </section>
  );
}