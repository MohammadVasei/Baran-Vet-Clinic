"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { SERVICES, type Service } from "@/lib/content";
import { SERVICE_ACCENTS, type ServiceAccentClasses } from "@/lib/accents";
import { MobileSectionHeader } from "@/components/sections/mobile/MobileSectionHeader";
import { SnapCarousel } from "@/components/sections/mobile/SnapCarousel";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ServicesMobile() {
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
    <section id="services" className="relative overflow-hidden bg-surface-alt py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute end-[-6rem] top-24 size-96 rounded-full bg-accent-soft opacity-60 blur-3xl" />
      </div>

      <div className="container-site relative">
        <MobileSectionHeader
          eyebrow={SERVICES.eyebrow}
          headline={SERVICES.headline}
          intro={SERVICES.intro}
        />

        <div className="mt-8 -mx-6" ref={containerRef}>
          <SnapCarousel
            ariaLabel="خدمات باران"
            slideClassName="w-[82%]"
            showDots={false}
            onIndexChange={setActiveIndex}
          >
            {SERVICES.items.map((item) => (
              <Link key={item.key} href={item.href}>
                <ServiceCard item={item} />
              </Link>
            ))}
          </SnapCarousel>

          <ServiceProgressIndicator
            count={SERVICES.items.length}
            active={activeIndex}
            accent={SERVICES.items[activeIndex].accent}
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ item }: { item: Service }) {
  const accent: ServiceAccentClasses = SERVICE_ACCENTS[item.accent];
  const frameNum = item.numeral;

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
          <span className="font-label text-sm font-semibold" style={{ color: `var(--${accent.fg.replace("text-", "")})` }}>{item.name}</span>
        </div>
        <h3 className="mt-1.5 font-display text-xl font-bold text-foreground">{item.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">{item.text}</p>
      </div>
    </article>
  );
}

function ServiceProgressIndicator({
  count,
  active,
  accent,
}: {
  count: number;
  active: number;
  accent: Service["accent"];
}) {
  const accentClasses: ServiceAccentClasses = SERVICE_ACCENTS[accent];
  const current = SERVICES.items[active].numeral;
  const total = SERVICES.items[count - 1].numeral;
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