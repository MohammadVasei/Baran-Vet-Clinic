"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CloseIcon, PhoneIcon } from "@/components/icons";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "خانه", href: "/" },
  { label: "خدمات", href: "/services" },
  { label: "پت‌شاپ", href: "/services/petshop" },
  { label: "پزشکان", href: "/doctors" },
  { label: "بیماری‌های شایع", href: "/common-diseases" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { user } = useAuth();

  const dashboardPath =
    user?.user_metadata?.role === "owner" || user?.user_metadata?.role === "staff"
      ? "/admin"
      : "/account";

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
            <Logo width={48} height={48} />
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
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`block rounded-app px-4 py-2 font-display text-base font-medium transition-colors duration-fast hover:bg-muted ${
                    isActive ? "text-primary-text bg-muted" : "text-foreground truncate"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onClose}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="space-y-2">
          {user ? (
            <a href={dashboardPath} className="btn btn-primary w-full" onClick={onClose}>
              حساب کاربری
            </a>
          ) : (
            <>
              <a href="/auth/login" className="btn btn-primary w-full" onClick={onClose}>
                ورود
              </a>
              <a href="/auth/register" className="btn btn-outline w-full" onClick={onClose}>
                عضویت
              </a>
            </>
          )}
        </div>

        <div className="mt-auto space-y-3 border-t border-border pt-6">
          <a href="/contact" className="btn btn-primary w-full" onClick={onClose}>
            تماس و نوبت
          </a>
          <a
            href="tel:+985138475377"
            className="btn btn-outline w-full"
            dir="ltr"
            onClick={onClose}
          >
            <PhoneIcon className="size-4" />
            <span className="truncate ml-2">۰۵۱-۳۸۴۷-۵۳۷۷</span>
          </a>
          <a
            href="https://wa.me/989153588160"
            className="btn btn-outline w-full"
            dir="ltr"
            onClick={onClose}
          >
            <PhoneIcon className="size-4" />
            <span className="truncate ml-2">۰۹۱۵-۳۵۸-۸۱۶۰ (واتساپ)</span>
          </a>
        </div>
      </nav>
    </div>
  );
}