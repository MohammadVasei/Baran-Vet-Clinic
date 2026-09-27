import { Logo } from "@/components/ui/Logo";

const QUICK_LINKS = [
  { label: "خانه", href: "/" },
  { label: "خدمات", href: "/services" },
  { label: "بیماری‌های شایع", href: "/common-diseases" },
  { label: "پزشکان", href: "/doctors" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-site flex flex-col items-center justify-between gap-8 py-8 lg:flex-row lg:py-10">
        <div className="flex items-center gap-2">
          <Logo width={32} height={32} />
          <span className="font-display text-base font-bold text-foreground">باران</span>
          <span className="font-label text-xs text-muted-foreground">دام های کوچک</span>
        </div>

        <nav aria-label="دسترسی سریع" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors duration-fast hover:text-primary-text-hover"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row sm:py-6">
          <p>© ۱۴۰۵ دام های کوچک باران — تمامی حقوق محفوظ است.</p>
          <p className="font-label">
            ساخته‌شده توسط{" "}
            <a
              href="https://Moahmmadvasei.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-text transition-colors hover:text-primary-text-hover underline"
            >
              Mohammad Vasei
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}