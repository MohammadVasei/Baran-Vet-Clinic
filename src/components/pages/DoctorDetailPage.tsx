"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DOCTORS, CLINIC } from "@/lib/content";
import { PhoneIcon, ArrowIcon } from "@/components/icons";
import Link from "next/link";

type DoctorKey = "tazik" | "vasei" | "moghan-jahani";

interface DoctorDetailPageProps {
  doctorKey: DoctorKey;
}

export function DoctorDetailPage({ doctorKey }: DoctorDetailPageProps) {
  const doctor = DOCTORS.items.find((d) => d.slug === doctorKey) ?? DOCTORS.items[0];

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
      revealUp(".doc-detail-eyebrow", { once: true });
      revealUp(".doc-detail-hero", { once: true, y: 24 });
      revealUp(".doc-detail-content", { once: true, y: 24 });
      revealUp(".doc-detail-cta", { once: true, y: 24 });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section id="doctor-detail" ref={root} className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="container-site relative">
        {/* Hero Image */}
        <div className="relative aspect-[3/4] max-w-md mx-auto mb-10 overflow-hidden rounded-app-lg">
          <Image
            src={doctor.image}
            alt={doctor.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-cover"
          />
          <div
            className="absolute inset-x-0 top-0 z-10 h-1.5 bg-primary"
            aria-hidden
          />
        </div>

        {/* Hero */}
        <div className="max-w-3xl text-center mb-12">
          <p className="doc-detail-eyebrow eyebrow text-primary-text">{DOCTORS.eyebrow}</p>
          <h1
            ref={headline}
            className="doc-detail-hero mt-4 font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {doctor.name}
          </h1>
          <p className="doc-detail-hero mt-3 text-lg font-medium text-primary-text">{doctor.role}</p>
        </div>

        {/* Content */}
        <div className="doc-detail-content mt-12 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-8 text-right">
            {/* Education & Experience */}
            <div className="rounded-app-lg border border-border bg-surface p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">تحصیلات و تجربه</h2>
              <dl className="space-y-4">
                {doctor.education.map((edu, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 size-2 rounded-full shrink-0 bg-primary" aria-hidden />
                    <dd className="text-muted-foreground">{edu}</dd>
                  </div>
                ))}
                {doctor.experience && (
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 size-2 rounded-full shrink-0 bg-primary" aria-hidden />
                    <dd className="text-muted-foreground">{doctor.experience}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Bio */}
            <div>
              {doctor.bio.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-lg leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Focus Areas */}
            {doctor.focusAreas.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">تمرکز‌های اصلی</h2>
                <ul className="space-y-3">
                  {doctor.focusAreas.map((area, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 size-2 rounded-full shrink-0 bg-primary" aria-hidden />
                      <span className="text-muted-foreground">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clinic Role */}
            {doctor.clinicRole && (
              <div className="rounded-app-lg border border-border bg-surface p-6">
                <h3 className="font-display text-xl font-semibold text-foreground">نقش در کلینیک باران</h3>
                <p className="mt-2 text-muted-foreground">{doctor.clinicRole}</p>
              </div>
            )}

            {/* Emotional Closer */}
            <div className="pt-4 border-t border-border">
              <p className="font-display text-lg font-semibold text-foreground italic">
                {doctorKey === "tazik"
                  ? "پت شما عضو خانواده است. ما این را می‌فهمیم و با همان حس مسئولیت کنار شما هستیم."
                  : doctorKey === "vasei"
                  ? "هر پرنده نیاز به توجه خاص خود را دارد و همین نگاه فردی، پایه کار ماست."
                  : "راحتی و خوشحالی پت شما، هدف اول و آخر ماست. با صبر و محبت، برایش بهترین تجربه را می‌سازیم."}
              </p>
            </div>
          </div>

          {/* CTA Sidebar */}
          <aside className="doc-detail-cta lg:col-span-5">
            <div className="sticky top-24 rounded-app-lg border border-border bg-surface p-6 shadow-lg sm:p-8">
              <h3 className="font-display text-xl font-bold text-foreground">رزرو نوبت با {doctor.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">برای مشاوره و نوبت، با ما تماس بگیرید یا در واتساپ پیام دهید.</p>

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
                  href="/doctors"
                  className="link-reveal inline-flex items-center gap-1.5 font-label text-sm font-medium text-muted-foreground hover:text-primary-text-hover"
                >
                  <ArrowIcon direction="back" className="size-4" />
                  بازگشت به پزشکان
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}