import { InstagramIcon, ThreadsIcon } from "@/components/icons";
import { Logo } from "@/components/ui/Logo";
import { FooterContact } from "@/components/layout/FooterContact";

const QUICK_LINKS = [
  { label: "خانه", href: "/" },
  { label: "خدمات", href: "/services" },
  { label: "بیماری‌های شایع", href: "/common-diseases" },
  { label: "پزشکان", href: "/doctors" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

const SOCIALS = [
  { label: "اینستاگرام", href: "https://www.instagram.com/baran_clinic_petshop/", Icon: InstagramIcon },
  { label: "ترددز", href: "https://www.threads.com/@baran_clinic_petshop/", Icon: ThreadsIcon },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-site grid grid-cols-2 gap-6 py-10 lg:grid-cols-3 lg:gap-10 lg:py-16">
        <div className="space-y-4">
          <a href="#top" className="flex items-center gap-2.5">
            <Logo className="transition-transform duration-normal ease-out group-hover:-rotate-6" width={48} height={48} />
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-foreground">باران</span>
              <span className="block font-label text-xs text-muted-foreground">کلینیک دام‌های کوچک باران</span>
            </span>
          </a>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            درمان • شناسنامه سلامت • شستشو و اصلاح حرفه‌ای • پت‌شاپ
          </p>
          <ul className="flex items-center gap-2">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors duration-fast hover:border-primary hover:text-primary-text-hover"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="دسترسی سریع">
          <h2 className="font-display text-base font-bold text-foreground">دسترسی سریع</h2>
          <ul className="mt-3 space-y-2.5 lg:mt-4">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-fast hover:text-primary-text-hover"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <FooterContact />
      </div>

<div className="border-t border-border">
          <div className="container-site flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row sm:py-6">
            <p>© ۱۴۰۵ کلینیک dam‌های کوچک باران — تمامی حقوق محفوظ است.</p>
            <p className="font-label">
              Developed by{" "}
              <a
                href="https://Moahmmadvasei.ir"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                Mohammad Vasi
              </a>
            </p>
            <p className="font-label">ساخته‌شده با دقت و مهربانی</p>
          </div>
        </div>
    </footer>
  );
}