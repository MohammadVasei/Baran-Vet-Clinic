"use client";

import { Fragment, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP, gsap } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion, duration, ease } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SERVICES, type Service } from "@/lib/content";
import { SERVICE_ACCENTS as ACCENTS } from "@/lib/accents";
import { ArrowIcon } from "@/components/icons";
import { ServicesMobile } from "@/components/sections/mobile/ServicesMobile";

export function Services() {
  const isMobile = useIsMobile();
  return isMobile ? <ServicesMobile /> : <ServicesDesktop />;
}

function ServicesDesktop() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const first = useRef(true);

  const [active, setActive] = useState<Service["key"]>(SERVICES.items[0].key);
  const service = SERVICES.items.find((s) => s.key === active) ?? SERVICES.items[0];
  const accent = ACCENTS[service.accent];

  function handleListKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const keys = SERVICES.items.map((s) => s.key);
    if (keys.length === 0) return;
    const cur = keys.indexOf(active);
    let next: string | null = null;
    if (e.key === "ArrowDown") next = keys[(cur + 1) % keys.length];
    else if (e.key === "ArrowUp") next = keys[(cur - 1 + keys.length) % keys.length];
    else if (e.key === "Home") next = keys[0];
    else if (e.key === "End") next = keys[keys.length - 1];
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`service-tab-${next}`)?.focus();
  }

  // Section entry reveals (eyebrow, split headline, intro, list, panel).
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
      revealUp(".svc-list", { once: true });
      revealUp(".svc-media", { once: true });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  // Cross-fade on service change (skipped on first mount to avoid a flash).
  useGSAP(
    () => {
      if (!root.current) return;
      // Under reduced motion the className opacity is authoritative — clear any
      // stale GSAP inline styles (e.g. from a live OS reduced-motion toggle).
      if (prefersReducedMotion() || reduced) {
        gsap.set(".svc-img", { clearProps: "opacity,visibility" });
        return;
      }
      if (first.current) {
        first.current = false;
        gsap.set(`.svc-img[data-key="${active}"]`, { autoAlpha: 1 });
        return;
      }
      gsap.to(".svc-img", {
        autoAlpha: 0,
        duration: duration("--duration-fast"),
        ease: "power1.in",
        overwrite: "auto",
      });
      gsap.to(`.svc-img[data-key="${active}"]`, {
        autoAlpha: 1,
        duration: duration("--duration-normal"),
        ease: "power1.inOut",
        delay: 0.06,
        overwrite: "auto",
      });
      gsap.fromTo(
        ".svc-panel-body",
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: duration("--duration-normal"),
          ease: ease(),
          overwrite: "auto",
        }
      );
    },
    { scope: root, dependencies: [active, reduced] }
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

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Media panel — large swapped image + description + accent (WOW 03) */}
          <div className="svc-media lg:col-span-7 lg:sticky lg:self-start lg:top-[var(--services-panel-top)]">
            <div className="group relative aspect-[4/3] overflow-hidden rounded-app-lg border border-border bg-surface shadow-lg sm:aspect-[16/10] lg:aspect-auto lg:h-[min(72vh,40rem)]">
              <div
                className={`absolute inset-x-0 top-0 z-10 h-1.5 transition-colors duration-slow ${accent.bar}`}
                aria-hidden
              />
              {SERVICES.items.map((s) => (
                <div
                  key={s.key}
                  data-key={s.key}
                  aria-hidden={active !== s.key}
                  className={`svc-img absolute inset-0 ${active === s.key ? "opacity-100" : "opacity-0"}`}
                >
                  {/*
                    Token-validator exception: `sizes` media queries require
                    literal px breakpoints — CSS var() is invalid there.
                  */}
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 1024px) 550px, 800px"
                    className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
                  />
                </div>
              ))}

              <div
                id="service-panel"
                role="tabpanel"
                aria-labelledby={`service-tab-${active}`}
                aria-live="polite"
                className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background/95 via-background/40 to-transparent p-6 sm:p-8"
              >
                <div key={active} className="svc-panel-body">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2.5 rounded-full transition-colors duration-slow ${accent.dot}`}
                      aria-hidden
                    />
                    <span className="font-label text-sm font-semibold text-foreground">
                      {service.name}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
                    {service.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {service.text}
                  </p>
                  <a
                    href="#appointment"
                    className="link-reveal mt-5 min-h-11"
                  >
                    رزرو نوبت
                    <ArrowIcon className={`link-arrow size-5 ${accent.fg}`} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive service list */}
          <div
            className="svc-list lg:col-span-5"
            role="tablist"
            aria-label="خدمات کلینیک"
            aria-orientation="vertical"
            onKeyDown={handleListKeyDown}
          >
            {SERVICES.items.map((s) => {
              const isActive = active === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  id={`service-tab-${s.key}`}
                  aria-selected={isActive}
                  aria-controls="service-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActive(s.key)}
                  onFocus={() => setActive(s.key)}
                  onMouseEnter={() => setActive(s.key)}
                  className={`group flex w-full items-center gap-4 border-b border-border py-5 text-start transition-colors duration-normal ${
                    isActive
                      ? `bg-muted/60 border-s-4 ${accent.edge}`
                      : "border-s-4 border-transparent hover:bg-muted"
                  }`}
                >
                  <span
                    className={`font-label text-2xl font-bold transition-colors duration-normal ${
                      isActive ? accent.fg : "text-muted-foreground"
                    }`}
                  >
                    {s.numeral}
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-xl font-bold text-foreground">
                      {s.name}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{s.tagline}</span>
                  </span>
                  <ArrowIcon
                    className={`size-5 shrink-0 transition-all duration-normal ${
                      isActive
                        ? `${accent.fg} opacity-100`
                        : "text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:text-foreground"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}