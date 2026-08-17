import { PawIcon, PinIcon, PhoneIcon, MailIcon, ClockIcon, InstagramIcon, TelegramIcon, WhatsAppIcon } from "@/components/icons";

// TODO: real data — replace all placeholder values below with clinic data
const FOOTER = {
  quickLinks: [
    { label: "درباره ما", href: "#about" },
    { label: "خدمات", href: "#services" },
    { label: "پزشکان", href: "#doctors" },
    { label: "رزرو نوبت", href: "#appointment" },
    { label: "تماس با ما", href: "#contact" },
  ],
  services: [
    { label: "داخلی و درمان", href: "#services" },
    { label: "جراحی تخصصی", href: "#services" },
    { label: "تصویربرداری و آزمایشگاه", href: "#services" },
    { label: "دندان‌پزشکی", href: "#services" },
    { label: "واکسیناسیون و پیشگیری", href: "#services" },
  ],
  contact: {
    address: "تهران، خیابان ولیعصر، کوچه باران، پلاک ۱۲",
    phone: "۰۲۱-۲۲۰۰۰۰۰۰",
    email: "info@baran-vet.ir",
    hours: "هر روز هفته: ۹ صبح تا ۱۰ شب",
  },
};

const SOCIALS = [
  { label: "اینستاگرام", href: "#instagram", Icon: InstagramIcon },
  { label: "تلگرام", href: "#telegram", Icon: TelegramIcon },
  { label: "واتس‌اپ", href: "#whatsapp", Icon: WhatsAppIcon },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-site grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-on-primary">
              <PawIcon className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-foreground">باران</span>
              <span className="block font-label text-xs text-muted-foreground">کلینیک دامپزشکی</span>
            </span>
          </a>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {/* TODO: real data — clinic mission/description */}
            جایی که علم دامپزشکی با مهربانی همراه می‌شود؛ از نخستین واکسن تا پیچیده‌ترین جراحی، کنار شما و حیوان عزیزتان هستیم.
          </p>
          <ul className="flex items-center gap-2">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors duration-fast hover:border-primary hover:text-primary"
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
            {FOOTER.quickLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-fast hover:text-primary"
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
            {FOOTER.services.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-fast hover:text-primary"
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
              <PinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="leading-relaxed">{FOOTER.contact.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <PhoneIcon className="size-4 shrink-0 text-primary" />
              <a href="tel:+982122000000" className="transition-colors duration-fast hover:text-primary" dir="ltr">
                {FOOTER.contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MailIcon className="size-4 shrink-0 text-primary" />
              <a href="mailto:info@baran-vet.ir" className="transition-colors duration-fast hover:text-primary" dir="ltr">
                {FOOTER.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <ClockIcon className="size-4 shrink-0 text-primary" />
              <span>{FOOTER.contact.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© ۱۴۰۵ کلینیک دامپزشکی باران — تمامی حقوق محفوظ است.</p>
          <p className="font-label">ساخته‌شده با دقت و مهربانی</p>
        </div>
      </div>
    </footer>
  );
}