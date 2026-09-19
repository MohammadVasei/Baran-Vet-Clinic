"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CloseIcon, PhoneIcon } from "@/components/icons";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { CartIcon } from "@/components/layout/CartIcon";
import { useAuth } from "@/context/AuthContext";
import { useDashboardPath } from "@/hooks/useDashboardPath";

const NAV_LINKS = [
  { label: "خانه", href: "/" },
  { label: "خدمات", href: "/services" },
  { label: "پت‌شاپ", href: "/services/petshop" },
  { label: "پزشکان", href: "/doctors" },
  { label: "بیماری‌های شایع", href: "/common-diseases" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

export function MobileMenu({
  open,
  onClose,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { user } = useAuth();

  const dashboardPath = useDashboardPath();

  // Robust inert: imperative guarantee the closed menu stays out of the tab
  // order even if the declarative `inert` prop is ever dropped by the pipeline.
  useEffect(() => {
    menuRef.current?.toggleAttribute("inert", !open);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const menuElement = menuRef.current;
    const triggerElement = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (document.activeElement instanceof HTMLElement && menuElement?.contains(document.activeElement)) {
        triggerElement?.focus();
      }
    };
  }, [open, onClose, triggerRef]);

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
                <Link
                  href={link.href}
                  className={`block rounded-app px-4 py-2 font-display text-base font-medium transition-colors duration-fast hover:bg-muted ${
                    isActive ? "text-primary-text bg-muted" : "text-foreground truncate"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="space-y-2 border-t border-border pt-5">
          {user ? (
            <Link href={dashboardPath} className="btn btn-primary w-full" onClick={onClose}>
              حساب کاربری
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-primary w-full" onClick={onClose}>
                ورود
              </Link>
              <Link href="/auth/register" className="btn btn-outline w-full" onClick={onClose}>
                عضویت
              </Link>
            </>
          )}
        </div>

        <div className="space-y-3 border-t border-border pt-5">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-app bg-muted px-4 py-2">
              <span className="font-label text-sm font-medium text-foreground">حالت نمایش</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between rounded-app bg-muted px-4 py-2">
              <span className="font-label text-sm font-medium text-foreground">سبد خرید</span>
              <CartIcon />
            </div>
          </div>
          <Link href="/#appointment" className="btn btn-primary w-full" onClick={onClose}>
            تماس و نوبت
          </Link>
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