"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { EMERGENCY } from "@/lib/content";
import { EmergencyMobile } from "@/components/sections/mobile/EmergencyMobile";
import { PhoneIcon } from "@/components/icons";

export function Emergency() {
  const isMobile = useIsMobile();
  return isMobile ? <EmergencyMobile /> : <EmergencyDesktop />;
}

function EmergencyDesktop() {
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
      revealUp(".emergency-intro", { once: true });
      revealUp(".emergency-phones", { once: true });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section
      id="emergency"
      ref={root}
      className="relative overflow-hidden bg-[var(--emergency-bg)] text-[var(--emergency-fg)] py-24 lg:py-32"
    >
      <div className="container-site max-w-2xl mx-auto">
        <p className="emergency-eyebrow text-center text-sm font-medium uppercase tracking-widest mb-6">{EMERGENCY.eyebrow}</p>

        <h2
          ref={headline}
          className="text-4xl font-bold leading-tight mb-8 text-center"
        >
          {EMERGENCY.headline.map((line, i) => (
            <Fragment key={line}>
              {line}
              {i < EMERGENCY.headline.length - 1 && <br />}
            </Fragment>
          ))}
        </h2>

        <div className="emergency-intro text-center mb-12">
          {EMERGENCY.intro}
        </div>

        <div className="emergency-phones text-center space-y-4 mb-8">
          <a
            href={EMERGENCY.phoneHref}
            className="flex items-center justify-center gap-2 text-2xl font-bold tracking-wider transition-colors hover:text-primary"
            dir="ltr"
          >
            <PhoneIcon className="size-6" />
            {EMERGENCY.phone}
          </a>
          <a
            href={EMERGENCY.mobile1Href}
            className="flex items-center justify-center gap-2 text-xl font-medium tracking-wider transition-colors hover:text-primary"
            dir="ltr"
          >
            <PhoneIcon className="size-5" />
            {EMERGENCY.mobile1}
          </a>
          <a
            href={EMERGENCY.mobile1WhatsApp}
            className="flex items-center justify-center gap-2 text-xl font-medium tracking-wider text-green-400 transition-colors hover:opacity-90"
            dir="ltr"
            target="_blank"
            rel="noopener"
          >
            <PhoneIcon className="size-5" />
            {EMERGENCY.mobile1} (واتساپ)
          </a>
        </div>

        <div className="emergency-hours text-center mb-8">
          <p className="font-label text-sm text-white/70">{EMERGENCY.hoursNote}</p>
          {EMERGENCY.hours.map((h, i) => (
            <p key={i} className="font-label text-sm mt-1">
              {h.days}: {h.time}
            </p>
          ))}
        </div>

        <div className="emergency-cta text-center mt-8 flex flex-col items-center gap-3">
          <MagneticButton
            href={EMERGENCY.phoneHref}
            className="inline-block rounded-full bg-white py-3 px-8 font-bold text-[var(--emergency-bg)] transition-colors duration-200 hover:opacity-90 min-w-[200px]"
            aria-label="تماس با کلینیک دام‌های کوچک باران"
          >
            تماس و نوبت
          </MagneticButton>
          <a
            href={EMERGENCY.mobile1WhatsApp}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 py-3 px-8 font-bold text-white transition-colors duration-200 hover:opacity-90 min-w-[200px]"
            target="_blank"
            rel="noopener"
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