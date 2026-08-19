"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import { useGSAP, gsap } from "@/lib/gsap";
import { duration, ease, fadeMask, revealLines, revealUp } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { WHY } from "@/lib/content";
import { WhyBaranMobile } from "@/components/sections/mobile/WhyBaranMobile";

export function WhyBaran() {
  const isMobile = useIsMobile();
  return isMobile ? <WhyBaranMobile /> : <WhyBaranDesktop />;
}

function WhyBaranDesktop() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  // Scroll reveals: eyebrow, split-line headline, intro, staggered steps, image sweep.
  useGSAP(
    () => {
      if (reduced || !root.current || !headline.current) return;

      const { split } = revealLines(headline.current, {
        mask: true,
        stagger: 0.1,
        start: "top 85%",
        once: true,
      });

      revealUp(".why-eyebrow", { once: true });
      revealUp(".why-intro", { once: true });

      // Steps stagger together (editorial list, not cards).
      gsap.fromTo(
        ".why-step",
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: duration("--duration-normal"),
          ease: ease(),
          stagger: 0.09,
          scrollTrigger: {
            trigger: ".why-steps",
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );

      // Image curtain sweeps from the inline-start (right in RTL).
      fadeMask(".why-img", {
        from: "inset(0% 0% 0% 100%)",
        to: "inset(0% 0% 0% 0%)",
        start: "top 85%",
        once: true,
      });

      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section
      id="why"
      ref={root}
      className="relative overflow-hidden bg-surface-alt py-20 lg:py-32"
    >
      {/* Decorative soft accent orb (green — health moment) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute end-[-6rem] bottom-24 size-96 rounded-full bg-accent-soft opacity-60 blur-3xl" />
      </div>

      <div className="container-site relative">
        {/* Chapter header */}
        <div className="max-w-2xl">
          <p className="why-eyebrow eyebrow">{WHY.eyebrow}</p>
          <h2
            ref={headline}
            className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {WHY.headline.map((line, i) => (
              <Fragment key={line}>
                {line}
                {i < WHY.headline.length - 1 && <br />}
              </Fragment>
            ))}
          </h2>
          <p className="why-intro mt-6 text-lg leading-relaxed text-muted-foreground">
            {WHY.intro}
          </p>
        </div>

        {/* Steps + supporting image */}
        <div className="mt-6 grid items-center gap-14 lg:mt-12 lg:grid-cols-12 lg:gap-10">
          <div className="relative lg:col-span-5 xl:col-span-5">
            <div className="why-img relative aspect-[3/4] overflow-hidden rounded-app-lg border border-border bg-surface shadow-lg">
              {/*
                Token-validator exception: `sizes` media queries require literal
                px breakpoints — CSS var() is invalid inside the `sizes` attribute.
              */}
              <Image
                src={WHY.image.src}
                alt={WHY.image.alt}
                fill
                sizes="(min-width: 1024px) 420px, 800px"
                className="object-cover"
              />
            </div>
          </div>

          <ol className="why-steps mt-6 divide-y divide-border lg:col-span-7 xl:col-span-7">
            {WHY.steps.map((step) => (
              <li
                key={step.number}
                className="why-step grid grid-cols-[3.5rem_1fr] gap-x-5 gap-y-1 py-6 sm:grid-cols-[5rem_1fr]"
              >
                <span className="font-label text-2xl font-bold text-primary sm:text-3xl">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}