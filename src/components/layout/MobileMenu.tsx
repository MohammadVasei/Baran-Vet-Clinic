"use client";

import { useEffect, useRef } from "react";
import { CloseIcon, PawIcon, PhoneIcon } from "@/components/icons";

const NAV_LINKS = [
  { label: "خانه", href: "#top" },
  { label: "درباره ما", href: "#about" },
  { label: "خدمات", href: "#services" },
  { label: "بیماران ما", href: "#patients" },
  { label: "پزشکان", href: "#doctors" },
  { label: "تماس", href: "#contact" },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Robust inert: imperative guarantee the closed menu stays out of the tab
  // order even if the declarative `inert` prop is ever dropped by the pipeline.
  useEffect(() => {
    menuRef.current?.toggleAttribute("inert", !open);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      ref={menuRef}
      className={open ? "" : "pointer-events-none"}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        className="menu-backdrop"
        style={{ opacity: open ? 1 : undefined }}
        onClick={onClose}
        aria-hidden
      />
      <nav
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="منوی موبایل"
        data-open={open}
        className="menu-panel flex flex-col gap-6 p-6"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-on-primary">
              <PawIcon className="size-5" />
            </span>
            <span className="font-display text-lg font-bold text-foreground">باران</span>
          </span>
          <button
            ref={closeBtnRef}
            type="button"
            className="btn btn-outline"
            aria-label="بستن منو"
            onClick={onClose}
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link, i) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block rounded-md px-3 py-3 font-display text-lg font-semibold text-foreground transition-colors duration-fast hover:bg-muted"
                aria-current={i === 0 ? "page" : undefined}
                onClick={onClose}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-3 border-t border-border pt-6">
          <a href="#appointment" className="btn btn-primary w-full" onClick={onClose}>
            رزرو نوبت
          </a>
          <a
            href="tel:+982122000000"
            className="btn btn-outline w-full"
            dir="ltr"
            onClick={onClose}
          >
            <PhoneIcon className="size-4" />
            {/* TODO: real data */}
            ۰۲۱-۲۲۰۰۰۰۰۰
          </a>
        </div>
      </nav>
    </div>
  );
}