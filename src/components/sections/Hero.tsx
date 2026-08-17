"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP, gsap, SplitText } from "@/lib/gsap";
import { duration, ease, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { HERO } from "@/lib/content";
import {
  ClockIcon,
  HeartPulseIcon,
  PinIcon,
  ChevronDownIcon,
  ArrowIcon,
} from "@/components/icons";

const META_ICONS = {
  hours: ClockIcon,
  emergency: HeartPulseIcon,
  location: PinIcon,
} as const;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current)
        return;

      // Split Persian headline into masked lines (RTL-safe).
      const split = SplitText.create(headline.current, {
        type: "lines",
        mask: "lines",
      });

      const tl = gsap.timeline({
        defaults: { ease: ease("--ease-smooth") },
        delay: duration("--duration-instant", 0.075),
      });

      tl.fromTo(
        ".hero-eyebrow",
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: duration("--duration-normal") }
      );
      tl.fromTo(
        split.lines,
        { yPercent: 120, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: duration("--duration-slower"),
          stagger: 0.12,
        },
        "-=0.25"
      );
      tl.fromTo(
        ".hero-sub",
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: duration("--duration-normal") },
        "-=0.4"
      );
      tl.fromTo(
        ".hero-cta",
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: duration("--duration-normal"), stagger: 0.1 },
        "-=0.3"
      );
      tl.fromTo(
        ".hero-meta",
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: duration("--duration-normal"), stagger: 0.09 },
        "-=0.3"
      );
      // Image curtain reveal (clip-path inset from bottom).
      tl.fromTo(
        ".hero-img",
        { clipPath: "inset(0% 0% 100% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: duration("--duration-slowest"),
        },
        "-=0.5"
      );
      tl.fromTo(
        ".hero-cat",
        { autoAlpha: 0, y: 40, scale: 0.92 },
        { autoAlpha: 1, y: 0, scale: 1, duration: duration("--duration-slow") },
        "-=0.5"
      );
      tl.fromTo(
        ".hero-scroll",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: duration("--duration-normal") },
        "-=0.3"
      );

      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  // Gentle continuous drift (decorative only; skipped under reduced motion).
  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current) return;
      gsap.to(".hero-orb", {
        y: () => gsap.utils.random(-18, 18),
        x: () => gsap.utils.random(-12, 12),
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 1.4 },
      });
      gsap.to(".hero-cat", {
        y: -10,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[calc(100svh-var(--header-height))] items-center overflow-hidden bg-background"
    >
      {/* Decorative orbs — GSAP animates the wrapper's `transform` only; the
          (expensive) `blur` + `opacity` sit on a static inner layer so the
          filter is never re-rasterized per frame. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="hero-orb absolute -top-24 inline-end-[-6rem] size-96">
          <div className="size-full rounded-full bg-primary-soft opacity-70 blur-3xl" />
        </div>
        <div className="hero-orb absolute bottom-[-8rem] inline-start-[-6rem] size-[28rem]">
          <div className="size-full rounded-full bg-accent-soft opacity-60 blur-3xl" />
        </div>
      </div>

      <div className="container-site relative grid w-full items-center gap-12 pb-20 pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-12">
        {/* Copy — inline-start in RTL */}
        <div className="lg:col-span-6 xl:col-span-6">
          <p className="hero-eyebrow eyebrow">حیوان خانگی شما، بیمار ماست</p>

          <h1
            ref={headline}
            className="mt-8 font-display text-4xl font-bold leading-[1.35] text-foreground sm:text-6xl lg:text-[4.25rem] lg:leading-[1.15]"
          >
            {HERO.headline[0]}
            <br />
            {HERO.headline[1]}
          </h1>

          <p className="hero-sub mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {HERO.subhead}
          </p>

          <div className="hero-cta mt-9 flex flex-wrap items-center gap-3">
            <MagneticButton href={HERO.cta.primary.href} className="btn btn-primary text-lg">
              {HERO.cta.primary.label}
              <ArrowIcon direction="forward" className="size-5" />
            </MagneticButton>
            <a href={HERO.cta.secondary.href} className="btn btn-outline text-lg">
              {HERO.cta.secondary.label}
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {HERO.meta.map((item) => {
              const Icon = META_ICONS[item.key];
              return (
                <li key={item.key} className="hero-meta flex items-center gap-2">
                  <Icon className="size-5 text-primary" />
                  <span className="font-label text-sm font-medium text-foreground">
                    {item.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Imagery — inline-end in RTL */}
        <div className="relative lg:col-span-6">
          <div className="hero-img group relative aspect-[5/4] overflow-hidden rounded-2xl bg-surface shadow-lg">
            {/*
              Token-validator exception: `sizes` media queries require literal
              px breakpoints — CSS var() is invalid inside the `sizes` attribute.
            */}
            <Image
              src={HERO.image.dog}
              alt="سگ خانگی در حال معاینه در کلینیک دامپزشکی باران"
              fill
              // `priority` is deprecated in Next 16 → `preload` (LCP element,
              // emits <link rel="preload" as="image"> in <head>). `preload`
              // alone doesn't raise the fetch priority, so add `fetchPriority`
              // (matches the old `priority` behavior: link + high priority).
              preload
              fetchPriority="high"
              sizes="(min-width: 1024px) 50vw, 90vw"
              className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
            />
          </div>

          {/* Floating cat card */}
          <div className="hero-cat absolute -bottom-8 start-[-0.5rem] w-40 overflow-hidden rounded-xl border-2 border-background bg-surface shadow-lg sm:w-48 sm:start-6 lg:-bottom-10">
            <div className="relative aspect-[4/5]">
              <Image
                src={HERO.image.cat}
                alt="گربه‌ای آرام در کلینیک دامپزشکی باران"
                fill
                sizes="(min-width: 640px) 12rem, 10rem"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        aria-label="رفتن به بخش بعدی"
        className="hero-scroll absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground transition-colors duration-fast hover:text-foreground sm:flex"
      >
        <span className="font-label text-xs">مشاهده بیشتر</span>
        <ChevronDownIcon className="size-5 animate-bounce" />
      </a>
    </section>
  );
}