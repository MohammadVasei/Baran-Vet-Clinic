"use client";

import { PhoneIcon, ClockIcon } from "@/components/icons";
import { EMERGENCY } from "@/lib/content";
import { MobileSectionHeader } from "@/components/sections/mobile/MobileSectionHeader";

export function EmergencyMobile() {
  return (
    <section id="emergency" className="relative overflow-hidden bg-[var(--emergency-bg)] text-[var(--emergency-fg)] py-20">
      <div className="container-site">
        <MobileSectionHeader
          eyebrow={EMERGENCY.eyebrow}
          headline={EMERGENCY.headline}
          intro={EMERGENCY.intro}
        />

        <div className="mt-8 text-center space-y-4">
          {/* Phone cards — large tappable targets */}
          <a
            href={EMERGENCY.phoneHref}
            dir="ltr"
            className="block rounded-app-lg bg-white/10 backdrop-blur border border-white/15 p-6 transition-opacity hover:opacity-90"
          >
            <span className="block font-label text-xs text-white/70 uppercase tracking-widest">
              تلفن ثابت
            </span>
            <span className="block mt-1 text-2xl font-bold tracking-wider flex items-center justify-center gap-2">
              <PhoneIcon className="size-5" />
              {EMERGENCY.phone}
            </span>
          </a>

          <a
            href={EMERGENCY.mobile1Href}
            dir="ltr"
            className="block rounded-app-lg bg-white/10 backdrop-blur border border-white/15 p-6 transition-opacity hover:opacity-90"
          >
            <span className="block font-label text-xs text-white/70 uppercase tracking-widest">
              موبایل
            </span>
            <span className="block mt-1 text-2xl font-bold tracking-wider flex items-center justify-center gap-2">
              <PhoneIcon className="size-5" />
              {EMERGENCY.mobile1}
            </span>
          </a>

          <a
            href={EMERGENCY.mobile1WhatsApp}
            dir="ltr"
            target="_blank"
            rel="noopener"
            className="block rounded-app-lg bg-green-500/20 backdrop-blur border border-green-500/30 p-6 transition-opacity hover:opacity-90"
          >
            <span className="block font-label text-xs text-green-300 uppercase tracking-widest">
              واتساپ
            </span>
            <span className="block mt-1 text-2xl font-bold tracking-wider text-green-300 flex items-center justify-center gap-2">
              <PhoneIcon className="size-5" />
              {EMERGENCY.mobile1} (واتساپ)
            </span>
          </a>

          {/* Hours */}
          <div className="mt-4 flex items-center justify-center gap-2 font-label text-sm text-white/90">
            <ClockIcon className="size-4 shrink-0" />
            <span>{EMERGENCY.hoursNote}</span>
          </div>
          {EMERGENCY.hours.map((h, i) => (
            <p key={i} className="font-label text-sm text-white/80 text-center">
              {h.days}: {h.time}
            </p>
          ))}

          {/* CTA — full width, comfortable thumb target */}
          <a
            href={EMERGENCY.phoneHref}
            className="mt-6 block w-full rounded-full bg-white py-4 font-bold text-[var(--emergency-bg)] min-h-14 flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            aria-label="تماس با کلینیک دام‌های کوچک باران"
          >
            تماس و نوبت
            <PhoneIcon className="size-4" />
          </a>
          <a
            href={EMERGENCY.mobile1WhatsApp}
            target="_blank"
            rel="noopener"
            className="block w-full rounded-full bg-green-500 py-4 font-bold text-white min-h-14 flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            aria-label="پیام در واتساپ"
          >
            <PhoneIcon className="size-4" />
            پیام در واتساپ
          </a>
        </div>
      </div>
    </section>
  );
}