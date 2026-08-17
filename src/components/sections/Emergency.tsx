"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { EMERGENCY } from "@/lib/content";

export function Emergency() {
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
      revealUp(".emergency-phone", { once: true });
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
          {EMERGENCY.headline}
        </h2>

        <div className="emergency-intro text-center mb-12">
          {EMERGENCY.intro}
        </div>

        <div className="emergency-phone text-center">
          <p className="font-bold text-2xl tracking-wider mb-2">
            {EMERGENCY.phone}
          </p>
          <p className="font-label text-sm">
            {EMERGENCY.hours}
          </p>
        </div>

        <div className="emergency-cta text-center mt-8">
          <MagneticButton
            href={EMERGENCY.phoneHref}
            className="inline-block rounded-full bg-white py-3 px-8 font-bold text-[var(--emergency-bg)] transition-colors duration-200 hover:opacity-90"
            ariaLabel="تماس فوری با کلینیک دامپزشکی باران"
          >
            تماس فوری
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}