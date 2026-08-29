"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MenuIcon, CloseIcon } from "@/components/icons";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { CartIcon } from "@/components/layout/CartIcon";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "خانه", href: "/", underline: "var(--nav-underline-1)" },
  { label: "خدمات", href: "/services", underline: "var(--nav-underline-2)" },
  { label: "پت‌شاپ", href: "/services/petshop", underline: "var(--nav-underline-3)" },
  { label: "بیماری‌های شایع", href: "/common-diseases", underline: "var(--nav-underline-4)" },
  { label: "پزشکان", href: "/doctors", underline: "var(--nav-underline-5)" },
  { label: "درباره ما", href: "/about", underline: "var(--nav-underline-6)" },
  { label: "تماس با ما", href: "/contact", underline: "var(--nav-underline-7)" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-header">
      <div className="container-site flex h-16 items-center justify-between gap-6 border-b border-border bg-[var(--nav-bg)] backdrop-blur-lg rounded-app">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="کلینیک دام‌های کوچک باران — صفحه اصلی">
          <Image
            src="/baran-logo-navbar.png"
            alt="باران کلینیک دام‌های کوچک"
            width={56}
            height={56}
            className="transition-transform duration-normal ease-out group-hover:-rotate-6"
            priority
          />
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold text-foreground">باران</span>
            <span className="block font-label text-xs text-muted-foreground">کلینیک دام‌های کوچک باران</span>
          </span>
        </Link>

        <nav aria-label="ناوبری اصلی" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "text-primary-text" : ""}`}
                aria-current={isActive ? "page" : undefined}
                style={{ "--nav-link-underline": link.underline } as React.CSSProperties}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <CartIcon />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground truncate">
                {user.user_metadata?.full_name || user.email?.split("@")[0] || "کاربر"}
              </span>
              <button
                onClick={() => router.push("/auth/login")}
                className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label="ورود به حساب"
              >
                ورود
              </button>
            </div>
          ) : (
            <MagneticButton
              href="/auth/register"
              className="btn btn-primary"
            >
              عضویت
            </MagneticButton>
          )}
          <MagneticButton href="/contact" className="btn btn-primary hidden sm:inline-flex">
            تماس و نوبت
          </MagneticButton>
          <button
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

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}