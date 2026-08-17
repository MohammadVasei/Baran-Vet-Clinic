"use client";

import { useState } from "react";
import { PawIcon, MenuIcon, CloseIcon } from "@/components/icons";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { MagneticButton } from "@/components/motion/MagneticButton";

const NAV_LINKS = [
  { label: "خانه", href: "#top" },
  { label: "درباره ما", href: "#about" },
  { label: "خدمات", href: "#services" },
  { label: "بیماران ما", href: "#patients" },
  { label: "پزشکان", href: "#doctors" },
  { label: "تماس", href: "#contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-header">
      <div className="container-site flex h-16 items-center justify-between gap-6 border-b border-border bg-[var(--nav-bg)] backdrop-blur-lg rounded-[var(--nav-radius)]">
        <a href="#top" className="group flex items-center gap-2.5" aria-label="کلینیک دامپزشکی باران — صفحه اصلی">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-on-primary transition-transform duration-normal ease-out group-hover:-rotate-6">
            <PawIcon className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold text-foreground">باران</span>
            <span className="block font-label text-xs text-muted-foreground">کلینیک دامپزشکی</span>
          </span>
        </a>

        <nav aria-label="ناوبری اصلی" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link"
              aria-current={i === 0 ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <MagneticButton href="#appointment" className="btn btn-primary hidden sm:inline-flex">
            رزرو نوبت
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