import { PawIcon, PinIcon, PhoneIcon, ClockIcon, InstagramIcon, ThreadsIcon } from "@/components/icons";

const QUICK_LINKS = [
  { label: "خانه", href: "#top" },
  { label: "خدمات", href: "#services" },
  { label: "پزشکان", href: "#doctors" },
  { label: "تماس با ما", href: "#contact" },
];

const SERVICES = [
  { label: "درمان", href: "/services/darman" },
  { label: "شناسنامه سلامت", href: "/services/shenasname" },
  { label: "شستشو و اصلاح", href: "/services/grooming" },
  { label: "پت‌شاپ", href: "/services/petshop" },
];

const CONTACT = {
  address: "مشهد، احمدآباد، بلوار بعثت، بین بلوار رضا و ابوذر غفاری، پلاک ۹۴",
  phones: [
    { label: "تلفن ثابت", number: "۰۵۱-۳۸۴۷-۵۳۷۷", href: "tel:+985138475377" },
    { label: "موبایل و واتساپ ۱", number: "۰۹۱۵-۳۵۸-۸۱۶۰", href: "tel:+989153588160", whatsapp: "https://wa.me/989153588160" },
    { label: "موبایل و واتساپ ۲", number: "۰۹۱۵-۹۹۰-۵۹۰۰", href: "tel:+989159905900", whatsapp: "https://wa.me/989159905900" },
  ],
  hours: [
    { days: "شنبه تا پنج‌شنبه", time: "۱۰ صبح تا ۹:۳۰ شب" },
    { days: "جمعه", time: "۴ عصر تا ۹ شب" },
  ],
  hoursNote: "لطفاً قبل از مراجعه تماس بگیرید",
};

const SOCIALS = [
  { label: "اینستاگرام", href: "https://www.instagram.com/baran_clinic_petshop/", Icon: InstagramIcon },
  { label: "ترددز", href: "https://www.threads.com/@baran_clinic_petshop/", Icon: ThreadsIcon },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-site grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-app bg-primary text-on-primary">
              <PawIcon className="size-5" />
            </span>
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
          <ul className="mt-4 space-y-2.5">
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

        <nav aria-label="خدمات">
          <h2 className="font-display text-base font-bold text-foreground">خدمات</h2>
          <ul className="mt-4 space-y-2.5">
            {SERVICES.map((link) => (
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

        <div>
          <h2 className="font-display text-base font-bold text-foreground">تماس با ما</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <PinIcon className="mt-0.5 size-4 shrink-0 text-primary-text" />
              <span className="leading-relaxed">{CONTACT.address}</span>
            </li>
            {CONTACT.phones.map((phone) => (
              <li key={phone.label} className="flex items-center gap-2.5">
                <PhoneIcon className="size-4 shrink-0 text-primary-text" />
                <a href={phone.href} className="transition-colors duration-fast hover:text-primary-text-hover" dir="ltr">
                  {phone.number}
                </a>
                {phone.whatsapp && (
                  <a href={phone.whatsapp} className="text-primary-text hover:underline text-xs" target="_blank" rel="noopener">
                    واتساپ
                  </a>
                )}
              </li>
            ))}
            <li className="flex items-start gap-2.5">
              <ClockIcon className="mt-0.5 size-4 shrink-0 text-primary-text" />
              <div>
                <p className="font-label text-xs text-primary-text">{CONTACT.hoursNote}</p>
                {CONTACT.hours.map((h, i) => (
                  <span key={i} className="block leading-relaxed">
                    {h.days}: {h.time}
                  </span>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© ۱۴۰۵ کلینیک دام‌های کوچک باران — تمامی حقوق محفوظ است.</p>
          <p className="font-label">ساخته‌شده با دقت و مهربانی</p>
        </div>
      </div>
    </footer>
  );
}