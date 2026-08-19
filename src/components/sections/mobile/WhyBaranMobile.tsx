"use client";

import { useRef, useState, forwardRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { WHY } from "@/lib/content";
import { MobileSectionHeader } from "@/components/sections/mobile/MobileSectionHeader";
import { SnapCarousel } from "@/components/sections/mobile/SnapCarousel";
import { WHY_STEP_ACCENTS, type AccentClasses } from "@/lib/accents";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toPersianNum(n: number) {
  return String(n).replace(/\d/g, (d) => PERSIAN_DIGITS[+d]);
}

const WhyProgressIndicator = forwardRef<HTMLDivElement, { count: number; active: number; accent: number }>(
  ({ count, active, accent }, ref) => {
    const accentClasses: AccentClasses = WHY_STEP_ACCENTS[accent];
    const current = toPersianNum(active + 1).padStart(2, "۰");
    const total = toPersianNum(count).padStart(2, "۰");
    const progress = ((active + 1) / count) * 100;

    return (
      <div
        ref={ref}
        className="why-progress-indicator mt-6 flex items-center justify-between px-6"
        role="status"
        aria-live="polite"
      >
        <p className="font-label text-sm text-muted-foreground">
          <span
            className="font-bold"
            style={{ color: `var(--${accentClasses.fg.replace("text-accent-", "accent-")}-fg)` }}
          >
            {`${current} / ${total}`}
          </span>
        </p>
        <div className="h-1 flex-1 max-w-[10rem] rounded-full bg-border overflow-hidden ms-4">
          <div
            className="why-progress-fill h-full rounded-full transition-[width] duration-slow"
            style={{
              width: `${progress}%`,
              backgroundColor: `var(--${accentClasses.bar.replace("bg-", "")})`,
            }}
            aria-hidden
          />
        </div>
      </div>
    );
  }
);

WhyProgressIndicator.displayName = "WhyProgressIndicator";

export function WhyBaranMobile() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: "power3.out",
      });

      gsap.from(".why-step-card", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  useGSAP(() => {
    if (prefersReducedMotion || !progressRef.current) return;

    const ctx = gsap.context(() => {
      const progressBar = progressRef.current?.querySelector(".why-progress-fill");
      if (progressBar) {
        gsap.to(progressBar, {
          width: `${((activeIndex + 1) / WHY.steps.length) * 100}%`,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    }, progressRef);

    return () => ctx.revert();
  }, [activeIndex, prefersReducedMotion]);

  return (
    <section id="why" className="relative overflow-hidden bg-surface-alt py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute end-[-6rem] bottom-24 size-96 rounded-full bg-accent-soft opacity-60 blur-3xl" />
      </div>

      <div className="container-site relative">
        <MobileSectionHeader
          eyebrow={WHY.eyebrow}
          headline={WHY.headline}
          intro={WHY.intro}
        />

        <div className="mt-8 -mx-6" ref={containerRef}>
          <SnapCarousel
            ariaLabel="مراحل درمان در باران"
            slideClassName="w-full sm:w-[90%]"
            showDots={false}
            onIndexChange={setActiveIndex}
          >
            {WHY.steps.map((step, index) => (
              <WhyStepCard key={step.number} step={step} index={index} />
            ))}
          </SnapCarousel>

          <WhyProgressIndicator
            ref={progressRef}
            count={WHY.steps.length}
            active={activeIndex}
            accent={activeIndex}
          />
        </div>
      </div>
    </section>
  );
}

function WhyStepCard({ step, index }: { step: typeof WHY.steps[0]; index: number }) {
  const accent: AccentClasses = WHY_STEP_ACCENTS[index];
  const stepNumber = toPersianNum(index + 1).padStart(2, "۰");

  return (
    <article className="why-step-card relative overflow-hidden rounded-app-lg border border-border bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="h-2" aria-hidden style={{ backgroundColor: `var(--${accent.bar.replace("bg-", "")})` }} />

      <div className="p-6">
        <div className="flex items-start gap-4">
          <span
            className="flex shrink-0 size-14 items-center justify-center rounded-2xl font-label text-lg font-bold"
            style={{
              backgroundColor: `var(--${accent.chip.replace("bg-", "").replace("text-", "")}-soft)`,
              color: `var(--${accent.fg.replace("text-", "")}-fg)`,
            }}
            aria-hidden
          >
            {stepNumber}
          </span>

          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-display text-xl font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{step.text}</p>
          </div>
        </div>
      </div>
    </article>
  );
}