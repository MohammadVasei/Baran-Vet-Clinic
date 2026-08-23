"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SERVICES, type Service } from "@/lib/content";
import { SERVICE_ACCENTS, type ServiceAccentClasses } from "@/lib/accents";
import { ServicesMobile } from "@/components/sections/mobile/ServicesMobile";

export function Services() {
  const isMobile = useIsMobile();
  return isMobile ? <ServicesMobile /> : <ServicesDesktop />;
}

function ServicesDesktop() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !root.current || !headline.current) return;
      const { split } = revealLines(headline.current, {
        mask: true,
        stagger: 0.1,
        start: "top 85%",
        once: true,
      });
      revealUp(".svc-eyebrow", { once: true });
      revealUp(".svc-intro", { once: true });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section
      id="services"
      ref={root}
      className="relative overflow-hidden bg-surface-alt py-20 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute end-[-6rem] top-24 size-96 rounded-full bg-accent-soft opacity-60 blur-3xl" />
      </div>

      <div className="container-site relative">
        <div className="max-w-2xl">
          <p className="svc-eyebrow eyebrow">{SERVICES.eyebrow}</p>
          <h2
            ref={headline}
            className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {SERVICES.headline.map((line, i) => (
              <Fragment key={line}>
                {line}
                {i < SERVICES.headline.length - 1 && <br />}
              </Fragment>
            ))}
          </h2>
          <p className="svc-intro mt-6 text-lg leading-relaxed text-muted-foreground">
            {SERVICES.intro}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.items.map((item) => (
            <Link key={item.key} href={item.href}>
              <ServiceCard item={item} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ item }: { item: Service }) {
  const accent: ServiceAccentClasses = SERVICE_ACCENTS[item.accent];
  const frameNum = item.numeral;

  return (
    <article className="relative flex flex-col overflow-hidden rounded-app-lg border border-border bg-surface shadow-sm hover:shadow-md transition-shadow duration-normal h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        <span
          className="absolute inset-x-0 top-0 z-10 h-1.5"
          aria-hidden
          style={{ backgroundColor: `var(--${accent.bar.replace("bg-", "")})` }}
        />
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-slow ease-out hover:scale-105"
        />
        <span
          className="absolute bottom-3 start-3 z-10 rounded-full bg-background/85 px-3 py-1 text-sm font-bold font-label backdrop-blur-sm"
          style={{ color: `var(--${accent.fg.replace("text-accent-", "accent-")}-fg)` }}
        >
          {frameNum}
        </span>
      </div>

      <div className="border-t border-border bg-surface p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full shrink-0"
            aria-hidden
            style={{ backgroundColor: `var(--${accent.dot.replace("bg-", "")})` }}
          />
          <span className="font-label text-sm font-semibold" style={{ color: `var(--${accent.fg.replace("text-", "")})` }}>{item.name}</span>
        </div>
        <h3 className="mt-1.5 font-display text-xl font-bold text-foreground">{item.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground flex-1">{item.text}</p>
        <span className="mt-4 inline-flex items-center gap-1 font-label text-sm font-medium" style={{ color: `var(--${accent.fg.replace("text-", "")})` }}>
          مشاهده جزئیات
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12 14 0" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </div>
    </article>
  );
}