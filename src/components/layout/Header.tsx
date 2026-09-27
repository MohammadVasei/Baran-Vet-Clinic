"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MenuIcon, CloseIcon, UserIcon } from "@/components/icons";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { CartIcon } from "@/components/layout/CartIcon";
import { useAuth } from "@/context/AuthContext";
import { useDashboardPath } from "@/hooks/useDashboardPath";

const NAV_LINKS = [
  { label: "خانه", href: "/" },
  { label: "خدمات", href: "/services" },
  { label: "پت‌شاپ", href: "/services/petshop" },
  { label: "بیماری‌های شایع", href: "/common-diseases" },
  { label: "پزشکان", href: "/doctors" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { user } = useAuth();

  const dashboardPath = useDashboardPath();

  return (
    <header className="sticky top-0 z-header">
      <div className="container-site flex h-16 items-center justify-between gap-2 border-b border-border bg-[var(--nav-bg)] backdrop-blur-lg rounded-app sm:gap-6">
        <Link href="/" className="group flex items-center gap-1.5 sm:gap-2.5" aria-label="کلینیک دام‌های کوچک باران — صفحه اصلی">
          <Image
            src="/baran-logo-navbar.png"
            alt="باران کلینیک دام‌های کوچک"
            width={64}
            height={36}
            className="h-auto w-14 shrink-0 transition-transform duration-normal ease-out group-hover:-rotate-6"
            priority
          />
          <span className="leading-tight min-w-0">
            <span className="block font-display text-lg font-bold text-foreground">باران</span>
            <span className="hidden font-label text-xs text-muted-foreground sm:block">کلینیک دام‌های کوچک باران</span>
          </span>
        </Link>

        <nav aria-label="ناوبری اصلی" className="hidden flex-1 items-center justify-center gap-1.5 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "text-primary-text" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden lg:inline-flex">
            <ThemeToggle />
          </span>
          <span className="hidden lg:inline-flex">
            <CartIcon animate />
          </span>
          {user ? (
            <Link
              href={dashboardPath}
              className="btn btn-outline size-10 !p-0"
              aria-label="حساب کاربری"
              title={user.user_metadata?.full_name || user.email?.split("@")[0] || "کاربر"}
            >
              <UserIcon className="size-5" />
            </Link>
          ) : (
            <>
              <MagneticButton
                href="/auth/register"
                className="btn btn-outline hidden lg:inline-flex"
              >
                عضویت
              </MagneticButton>
              <Link
                href="/auth/register"
                className="btn btn-outline size-10 !p-0 lg:hidden"
                aria-label="ورود یا عضویت"
              >
                <UserIcon className="size-5" />
              </Link>
            </>
          )}
          <MagneticButton href="/#appointment" className="btn btn-primary hidden lg:inline-flex">
            تماس و نوبت
          </MagneticButton>
          <button
            ref={menuTriggerRef}
            type="button"
            className="btn btn-outline lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "بستن منوی موبایل" : "باز کردن منوی موبایل"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      <MobileMenu open={open} onClose={() => setOpen(false)} triggerRef={menuTriggerRef} />
    </header>
  );
}