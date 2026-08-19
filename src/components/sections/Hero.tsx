"use client";

import { useRef } from "react";
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

import { GoldieVideo } from "@/components/mascot";

const META_ICONS = {
  hours: ClockIcon,
  emergency: HeartPulseIcon,
  location: PinIcon,
} as const;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !root.current || !headline.current)
        return;

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
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[calc(100svh-var(--header-height))] items-center overflow-hidden bg-background"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="hero-orb absolute -top-24 inline-end-[-6rem] size-96">
          <div className="size-full rounded-full bg-primary-soft opacity-50 blur-3xl" />
        </div>
        <div className="hero-orb absolute bottom-[-8rem] inline-start-[-6rem] size-[28rem]">
          <div className="size-full rounded-full bg-accent-soft opacity-40 blur-3xl" />
        </div>
      </div>

      <div className="container-site relative grid w-full items-center gap-12 pb-20 pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-12">
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

        <div className="relative lg:col-span-6 hidden lg:block">
          <div
            ref={heroVisualRef}
            className="relative flex items-center justify-center aspect-[5/4] min-h-[500px] max-h-[70vh]"
          >
            <GoldieVideo
              src="/videos/goldie/greeting.webm"
              alt="گلدگی، سگ کلینیک باران"
              className="hero-cat w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Mobile compact Goldie — shows below CTA on <lg */}
      <div className="lg:hidden mt-10 flex justify-center">
        <GoldieVideo
          src="/videos/goldie/greeting.webm"
          alt="گلدگی، سگ کلینیک باران"
          className="w-[28vw] max-w-[16rem]"
        />
      </div>

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