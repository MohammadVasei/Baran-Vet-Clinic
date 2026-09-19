"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarIcon, CloseIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { useCms } from "@/context/CmsContext";

export function MobileQuickAccess() {
  const [open, setOpen] = useState(false);
  const emergency = useCms().emergency;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="fixed bottom-4 right-4 z-20 lg:hidden" dir="rtl">
      <div
        className={`mb-3 flex origin-bottom-right flex-col gap-2 transition-all duration-normal ease-out ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <a
          href={emergency.phoneHref}
          className="btn btn-primary shadow-lg"
          dir="ltr"
          tabIndex={open ? 0 : -1}
        >
          <PhoneIcon className="size-5" />
          تماس فوری
        </a>
        <a
          href={emergency.mobile1WhatsApp}
          className="btn bg-accent-lime text-white shadow-lg"
          target="_blank"
          rel="noopener"
          tabIndex={open ? 0 : -1}
        >
          <WhatsAppIcon className="size-5" />
          واتساپ
        </a>
        <Link
          href="/#appointment"
          className="btn btn-outline bg-background shadow-lg"
          tabIndex={open ? 0 : -1}
        >
          <CalendarIcon className="size-5" />
          رزرو نوبت
        </Link>
      </div>

      <button
        type="button"
        className="btn btn-primary size-14 !p-0 rounded-full shadow-lg"
        aria-expanded={open}
        aria-label={open ? "بستن دسترسی سریع تماس" : "باز کردن دسترسی سریع تماس"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <CloseIcon className="size-6" /> : <PhoneIcon className="size-6" />}
      </button>
    </div>
  );
}