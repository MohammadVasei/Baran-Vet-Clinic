"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ANIMALS, type AnimalCategory } from "@/lib/content";
import { ANIMAL_ACCENTS, type AccentClasses } from "@/lib/accents";
import { MobileSectionHeader } from "@/components/sections/mobile/MobileSectionHeader";
import { SnapCarousel } from "@/components/sections/mobile/SnapCarousel";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toPersianNum(n: number) {
  return String(n).replace(/\d/g, (d) => PERSIAN_DIGITS[+d]);
}

export function AnimalExperienceMobile() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section id="patients" className="relative overflow-hidden bg-background py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute start-[-6rem] bottom-24 size-96 rounded-full bg-primary-soft opacity-60 blur-3xl" />
      </div>

      <div className="container-site relative">
        <MobileSectionHeader
          eyebrow={ANIMALS.eyebrow}
          headline={ANIMALS.headline}
          intro={ANIMALS.intro}
        />

        <div className="mt-8 -mx-6" ref={containerRef}>
          <SnapCarousel
            ariaLabel="تجربه بیماران"
            slideClassName="w-[82%]"
            showDots={false}
            onIndexChange={setActiveIndex}
          >
            {ANIMALS.categories.map((item, i) => (
              <AnimalCard key={item.key} item={item} index={i} />
            ))}
          </SnapCarousel>

          <AnimalProgressIndicator
            count={ANIMALS.categories.length}
            active={activeIndex}
            accent={ANIMALS.categories[activeIndex].key}
          />
        </div>
      </div>
    </section>
  );
}

function AnimalCard({ item, index }: { item: AnimalCategory; index: number }) {
  const accent: AccentClasses = ANIMAL_ACCENTS[item.key];
  const frameNum = toPersianNum(index + 1).padStart(2, "۰");

  return (
    <article className="relative flex h-[26rem] flex-col overflow-hidden rounded-app-lg border border-border bg-surface shadow-sm">
      <div className="relative flex-1 overflow-hidden">
        <span
          className="absolute inset-x-0 top-0 z-10 h-1.5"
          aria-hidden
          style={{ backgroundColor: `var(--${accent.bar.replace("bg-", "")})` }}
        />
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes="(max-width: 767px) 82vw, 0px"
          className="object-cover transition-transform duration-slow ease-out"
        />
        <span
          className="absolute bottom-3 start-3 z-10 rounded-full bg-background/85 px-3 py-1 text-sm font-bold font-label backdrop-blur-sm"
          style={{ color: `var(--${accent.fg.replace("text-accent-", "accent-")}-fg)` }}
        >
          {frameNum}
        </span>
      </div>

      <div className="border-t border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full shrink-0"
            aria-hidden
            style={{ backgroundColor: `var(--${accent.dot.replace("bg-", "")})` }}
          />
          <span className="font-label text-sm font-semibold text-primary-text">{item.name}</span>
        </div>
        <h3 className="mt-1.5 font-display text-xl font-bold text-foreground">{item.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
      </div>
    </article>
  );
}

function AnimalProgressIndicator({
  count,
  active,
  accent,
}: {
  count: number;
  active: number;
  accent: AnimalCategory["key"];
}) {
  const accentClasses: AccentClasses = ANIMAL_ACCENTS[accent];
  const current = toPersianNum(active + 1).padStart(2, "۰");
  const total = toPersianNum(count).padStart(2, "۰");
  const progress = ((active + 1) / count) * 100;

  return (
    <div className="mt-6 flex items-center justify-between px-6" role="status" aria-live="polite">
      <p className="font-label text-sm text-muted-foreground">
        <span className="font-bold" style={{ color: `var(--${accentClasses.fg.replace("text-accent-", "accent-")}-fg)` }}>
          {current}
        </span>{" "}
        / {total}
      </p>
      <div className="h-1 flex-1 max-w-[10rem] rounded-full bg-border overflow-hidden ms-4">
        <div
          className="h-full rounded-full transition-[width] duration-slow"
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