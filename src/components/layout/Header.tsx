"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { PawIcon, MenuIcon, CloseIcon } from "@/components/icons";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV_LINKS = [
  { label: "خانه", href: "/" },
  { label: "خدمات", href: "/services" },
  { label: "پزشکان", href: "/doctors" },
  { label: "تماس با ما", href: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-header">
      <div className="container-site flex h-16 items-center justify-between gap-6 border-b border-border bg-[var(--nav-bg)] backdrop-blur-lg rounded-app">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="کلینیک دام‌های کوچک باران — صفحه اصلی">
          <span className="grid size-10 place-items-center rounded-app bg-primary text-on-primary transition-transform duration-normal ease-out group-hover:-rotate-6">
            <PawIcon className="size-5" />
          </span>
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
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
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