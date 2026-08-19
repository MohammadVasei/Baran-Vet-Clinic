"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP, gsap } from "@/lib/gsap";
import { duration, ease, revealLines, revealUp } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { moveTabFocus } from "@/lib/tabs";
import { ANIMALS, type AnimalCategory } from "@/lib/content";
import { ANIMAL_ACCENTS as ACCENTS } from "@/lib/accents";
import { AnimalExperienceMobile } from "@/components/sections/mobile/AnimalExperienceMobile";

export function AnimalExperience() {
  const isMobile = useIsMobile();
  return isMobile ? <AnimalExperienceMobile /> : <AnimalExperienceDesktop />;
}

const AUTO_ADVANCE_MS = 5000;

export function AnimalExperienceDesktop() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const first = useRef(true);

  const [active, setActive] = useState<AnimalCategory["key"]>(ANIMALS.categories[0].key);
  const [hovering, setHovering] = useState(false);
  const [tabsFocused, setTabsFocused] = useState(false);

  const paused = reduced || hovering || tabsFocused;
  const category = ANIMALS.categories.find((c) => c.key === active) ?? ANIMALS.categories[0];
  const accent = ACCENTS[active];

  // Auto-advance (pauses on hover/focus; disabled under reduced motion).
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((prev) => {
        const idx = ANIMALS.categories.findIndex((c) => c.key === prev);
        return ANIMALS.categories[(idx + 1) % ANIMALS.categories.length].key;
      });
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  function handleTabsKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ANIMALS.categories.map((c) => c.key);
    const next = moveTabFocus(keys, active, e.key);
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`animal-tab-${next}`)?.focus();
  }

  // Section entry reveals (eyebrow, split headline, intro, media, tabs).
  useGSAP(
    () => {
      if (reduced || !root.current || !headline.current) return;
      const { split } = revealLines(headline.current, {
        mask: true,
        stagger: 0.1,
        start: "top 85%",
        once: true,
      });
      revealUp(".animal-eyebrow", { once: true });
      revealUp(".animal-intro", { once: true });
      revealUp(".animal-media", { once: true });
      revealUp(".animal-tabs", { once: true });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  // Cross-fade on category change (skipped on first mount to avoid a flash).
  useGSAP(
    () => {
      if (reduced || !root.current) return;
      if (first.current) {
        first.current = false;
        gsap.set(`.animal-img[data-key="${active}"]`, { autoAlpha: 1 });
        return;
      }
      gsap.to(".animal-img", {
        autoAlpha: 0,
        duration: duration("--duration-fast"),
        ease: "power1.in",
        overwrite: "auto",
      });
      gsap.to(`.animal-img[data-key="${active}"]`, {
        autoAlpha: 1,
        duration: duration("--duration-normal"),
        ease: "power1.inOut",
        delay: 0.06,
        overwrite: "auto",
      });
      gsap.fromTo(
        ".animal-panel-body",
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
      id="patients"
      ref={root}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="relative overflow-hidden bg-background py-20 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute start-[-6rem] bottom-24 size-96 rounded-full bg-primary-soft opacity-60 blur-3xl" />
      </div>

      <div className="container-site relative">
        <div className="max-w-2xl">
          <p className="animal-eyebrow eyebrow">{ANIMALS.eyebrow}</p>
          <h2
            ref={headline}
            className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {ANIMALS.headline.map((line, i) => (
              <Fragment key={line}>
                {line}
                {i < ANIMALS.headline.length - 1 && <br />}
              </Fragment>
            ))}
          </h2>
          <p className="animal-intro mt-6 text-lg leading-relaxed text-muted-foreground">
            {ANIMALS.intro}
          </p>
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Media — cross-fading category images (WOW 02) */}
          <div className="animal-media relative lg:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden rounded-app-lg border border-border bg-surface shadow-lg">
              <div className={`absolute inset-x-0 top-0 z-10 h-1.5 transition-colors duration-slow ${accent.bar}`} aria-hidden />
              {ANIMALS.categories.map((c) => (
                <div
                  key={c.key}
                  data-key={c.key}
                  aria-hidden={active !== c.key}
                  className={`animal-img absolute inset-0 ${active === c.key ? "opacity-100" : "opacity-0"}`}
                >
                  {/*
                    Token-validator exception: `sizes` media queries require
                    literal px breakpoints — CSS var() is invalid there.
                  */}
                  <Image
                    src={c.image}
                    alt={c.alt}
                    fill
                    sizes="(min-width: 1024px) 580px, 800px"
                    className="object-cover"
                  />
                </div>
              ))}

              <div className="absolute inset-x-4 bottom-4 z-10 flex items-center gap-2 self-start rounded-full bg-background/90 px-4 py-2 backdrop-blur-sm">
                <span className={`size-2.5 rounded-full transition-colors duration-slow ${accent.dot}`} aria-hidden />
                <span className="font-label text-sm font-semibold text-foreground">{category.name}</span>
              </div>
            </div>
          </div>

          {/* Tabs + panel */}
          <div className="lg:col-span-5">
            <div
              role="tablist"
              aria-label="انتخاب نوع حیوان"
              onKeyDown={handleTabsKeyDown}
              onFocus={() => setTabsFocused(true)}
              onBlur={() => setTabsFocused(false)}
              className="animal-tabs flex flex-wrap gap-2"
            >
              {ANIMALS.categories.map((c) => (
                <button
                  key={c.key}
                  role="tab"
                  id={`animal-tab-${c.key}`}
                  aria-selected={active === c.key}
                  aria-controls="animal-panel"
                  tabIndex={active === c.key ? 0 : -1}
                  onClick={() => setActive(c.key)}
                  className={`min-h-11 rounded-full px-5 py-2.5 font-label text-sm font-semibold transition-colors duration-normal ${
                    active === c.key
                      ? ACCENTS[c.key].chip
                      : "bg-muted text-muted-foreground hover:bg-surface-alt hover:text-foreground"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div
              id="animal-panel"
              role="tabpanel"
              aria-labelledby={`animal-tab-${active}`}
              aria-live="polite"
              className="relative mt-6"
            >
              <div key={active} className="animal-panel-body">
                <h3 className="font-display text-2xl font-bold text-foreground">{category.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{category.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}