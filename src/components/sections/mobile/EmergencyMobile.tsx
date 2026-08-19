"use client";

import { PhoneIcon, ClockIcon } from "@/components/icons";
import { EMERGENCY } from "@/lib/content";
import { MobileSectionHeader } from "@/components/sections/mobile/MobileSectionHeader";

/**
 * Mobile (<768px) variant of «اورژانس» — highly actionable, large tap targets,
 * phone number as a prominent card, full-width CTA button. Uses the existing
 * destructive (emergency) colour tokens for consistency with desktop.
 */
export function EmergencyMobile() {
  return (
    <section id="emergency" className="relative overflow-hidden bg-[var(--emergency-bg)] text-[var(--emergency-fg)] py-20">
      <div className="container-site">
        <MobileSectionHeader
          eyebrow={EMERGENCY.eyebrow}
          headline={EMERGENCY.headline}
          intro={EMERGENCY.intro}
        />

        <div className="mt-8 text-center">
          {/* Phone card — large tappable target */}
          <a
            href={EMERGENCY.phoneHref}
            dir="ltr"
            className="block rounded-app-lg bg-white/10 backdrop-blur border border-white/15 p-6 transition-opacity hover:opacity-90"
          >
            <span className="block font-label text-xs text-white/70 uppercase tracking-widest">
              تماس مستقیم
            </span>
            <span className="block mt-1 text-2xl font-bold tracking-wider">
              {EMERGENCY.phone}
            </span>
          </a>

          {/* Hours */}
          <p className="mt-6 flex items-center justify-center gap-2 font-label text-sm text-white/90">
            <ClockIcon className="size-4 shrink-0" />
            <span>{EMERGENCY.hours}</span>
          </p>

          {/* CTA — full width, comfortable thumb target */}
          <a
            href={EMERGENCY.phoneHref}
            className="mt-8 block w-full rounded-full bg-white py-4 font-bold text-[var(--emergency-bg)] min-h-14 flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            aria-label="تماس فوری با کلینیک دامپزشکی باران"
          >
            تماس فوری
            <PhoneIcon className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}