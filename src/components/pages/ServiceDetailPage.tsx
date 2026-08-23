"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SERVICES, CLINIC } from "@/lib/content";
import { SERVICE_ACCENTS } from "@/lib/accents";
import { PhoneIcon, ArrowIcon } from "@/components/icons";
import Link from "next/link";

type ServiceKey = "darman" | "shenasname" | "grooming" | "petshop";

interface ServiceDetailPageProps {
  serviceKey: ServiceKey;
}

export function ServiceDetailPage({ serviceKey }: ServiceDetailPageProps) {
  const service = SERVICES.items.find((s) => s.key === serviceKey) ?? SERVICES.items[0];
  const accent = SERVICE_ACCENTS[service.accent];

  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const { split } = revealLines(headline.current, {
        mask: true,
        stagger: 0.1,
        start: "top 85%",
        once: true,
      });
      revealUp(".svc-detail-eyebrow", { once: true });
      revealUp(".svc-detail-intro", { once: true });
      revealUp(".svc-detail-content", { once: true, y: 24 });
      revealUp(".svc-detail-cta", { once: true, y: 24 });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  const serviceContent: Record<ServiceKey, { heroHeadline: string; intro: string; focusPoints: string[]; forPetOwners: string; emotionalCloser: string }> = {
    darman: {
      heroHeadline: "درمان با دقت و آرامش",
      intro: "وقتی پت‌تان حالش خوب نیست، اولین چیزی که نیاز دارید اطمینان است. در کلینیک باران، معاینه و مراقبت درمانی با تمرکز کامل روی حیوانات خانگی انجام می‌شود. ما سعی می‌کنیم محیط را آرام نگه داریم تا هم شما و هم پت‌تان احساس امنیت کنید.",
      focusPoints: [
        "معاینه دقیق و شنیدن نگرانی‌های شما",
        "تشخیص نیاز واقعی پت",
        "مراقبت و پیگیری متناسب با شرایط",
      ],
      forPetOwners: "قبل از مراجعه، تماس بگیرید تا زمان مناسب را هماهنگ کنیم. اگر جابه‌جایی پت برای شما سخت است، امکان هماهنگی برای ویزیت در محل را نیز بررسی می‌کنیم.",
      emotionalCloser: "پت شما عضو خانواده است. ما این را می‌فهمیم و با همان حس مسئولیت کنار شما هستیم.",
    },
    shenasname: {
      heroHeadline: "شناسنامه سلامت؛ سوابق پت در یک نگاه",
      intro: "داشتن یک شناسنامه منظم برای حیوان خانگی، کار ساده‌ای است که بعداً خیلی به کارتان می‌آید. در کلینیک باران می‌توانید شناسنامه سلامت پت خود را دریافت کنید و از همان ابتدا سوابق درمانی و برنامه‌های پیشگیرانه را ثبت کنید.",
      focusPoints: [
        "ثبت منظم معاینات و اقدامات",
        "یادآوری آسان‌تر زمان واکسیناسیون و چکاپ",
        "سندی کاربردی برای نگهداری بلندمدت پت",
      ],
      forPetOwners: "کافی است یک بار مراجعه کنید. از آن به بعد، پیگیری سلامت پت‌تان منظم‌تر و خیالتان راحت‌تر خواهد بود.",
      emotionalCloser: "سلامت پت‌تان، یه دفترچه ساده و مرتب.",
    },
    grooming: {
      heroHeadline: "شستشو و اصلاح؛ راحتی و زیبایی پت شما",
      intro: "گرومینگ فقط ظاهر نیست؛ بخشی از رفاه و احساس خوب حیوان خانگی است. در کلینیک باران، شستشو و اصلاح توسط گرومر مجموعه با حوصله و توجه انجام می‌شود تا پت شما تجربه‌ای آرام داشته باشد.",
      focusPoints: [
        "شستشوی اصولی",
        "اصلاح و مرتب‌سازی مو و ظاهر",
        "توجه به آرامش پت در طول کار",
      ],
      forPetOwners: "اگر پت شما حساس، مضطرب یا برای اولین بار است که گرومینگ می‌شود، حتماً موقع رزرو اطلاع دهید تا با آمادگی بیشتری همراهی‌اش کنیم. گرومر کلینیک: مژگان جهانی",
      emotionalCloser: "یه پت تمیز و خوش‌بو، یه پت خوشحال.",
    },
    petshop: {
      heroHeadline: "پت‌شاپ؛ هر آنچه برای نگهداری روزمره نیاز دارید",
      intro: "کنار خدمات درمانی و گرومینگ، پت‌شاپ کلینیک باران هم آماده است تا محصولات مورد نیاز حیوانات خانگی را در اختیار شما بگذارد. دیگر لازم نیست برای هر خرید ساده مسیرهای طولانی بروید.",
      focusPoints: [
        "محصولات مرتبط با نگهداری روزمره پت",
        "امکان پرسش و راهنمایی از طریق تماس یا واتساپ",
      ],
      forPetOwners: "قبل از مراجعه می‌توانید موجودی اقلام مورد نیازتان را از طریق تماس یا پیام واتساپ چک کنید تا وقت‌تان تلف نشود.",
      emotionalCloser: "کالای پت‌تون، همون‌جا که ویزیت می‌کنید.",
    },
  };

  const content = serviceContent[serviceKey];

  return (
    <section id="service-detail" ref={root} className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="container-site relative">
        {/* Hero */}
        <div className="max-w-3xl">
          <p className="svc-detail-eyebrow eyebrow text-primary-text">{SERVICES.eyebrow}</p>
          <h1
            ref={headline}
            className="mt-4 font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {content.heroHeadline}
          </h1>
        </div>

        {/* Content */}
        <div className="svc-detail-content mt-12 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-8">
            <div>
              <p className="text-lg leading-relaxed text-muted-foreground">{content.intro}</p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4"> روی چه مواردی تمرکز داریم </h2>
              <ul className="space-y-3">
                {content.focusPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 size-2 rounded-full shrink-0" aria-hidden style={{ backgroundColor: `var(--${accent.dot.replace("bg-", "")})` }} />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-app-lg border border-border bg-surface p-6">
              <h3 className="font-display text-xl font-semibold text-foreground">برای مالکان پت</h3>
              <p className="mt-2 text-muted-foreground">{content.forPetOwners}</p>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="font-display text-lg font-semibold text-foreground italic">{content.emotionalCloser}</p>
            </div>
          </div>

          {/* CTA Sidebar */}
          <aside className="svc-detail-cta lg:col-span-5">
            <div className="sticky top-24 rounded-app-lg border border-border bg-surface p-6 shadow-lg sm:p-8">
              <h3 className="font-display text-xl font-bold text-foreground">تماس برای نوبت</h3>
              <p className="mt-2 text-sm text-muted-foreground">برای رزرو نوبت یا مشاوره، با ما تماس بگیرید یا در واتساپ پیام دهید.</p>

              <div className="mt-6 space-y-4">
                <a
                  href={CLINIC.phoneHref}
                  className="flex items-center justify-center gap-2 rounded-app bg-primary px-6 py-3 font-bold text-on-primary transition-opacity hover:opacity-90"
                  dir="ltr"
                >
                  <PhoneIcon className="size-5" />
                  {CLINIC.phone}
                </a>
                <a
                  href={CLINIC.mobile1WhatsApp}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-center gap-2 rounded-app bg-accent-lime px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
                >
                  <PhoneIcon className="size-5" />
                  {CLINIC.mobile1} (واتساپ)
                </a>
                <a
                  href={CLINIC.mobile2WhatsApp}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-center gap-2 rounded-app bg-accent-lime px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
                >
                  <PhoneIcon className="size-5" />
                  {CLINIC.mobile2} (واتساپ)
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="font-label text-xs text-primary-text">{CLINIC.hoursNote}</p>
                {CLINIC.hours.map((h, i) => (
                  <p key={i} className="mt-1 text-sm text-muted-foreground">
                    {h.days}: {h.time}
                  </p>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  href="/services"
                  className="link-reveal inline-flex items-center gap-1.5 font-label text-sm font-medium text-muted-foreground hover:text-primary-text-hover"
                >
                  <ArrowIcon direction="back" className="size-4" />
                  بازگشت به خدمات
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}