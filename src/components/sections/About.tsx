"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import { useGSAP, gsap } from "@/lib/gsap";
import { fadeMask, revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ABOUT } from "@/lib/content";

export function About() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  // Scroll reveals: eyebrow, split-line statement, body, signature, image curtain.
  useGSAP(
    () => {
      if (reduced || !root.current || !headline.current) return;

      const { split } = revealLines(headline.current, {
        mask: true,
        stagger: 0.1,
        start: "top 82%",
        once: true,
      });

      revealUp(".about-eyebrow", { once: true });
      revealUp(".about-body", { once: true });
      revealUp(".about-meta", { once: true });
      fadeMask(".about-img", { start: "top 85%", once: true });

      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  // Editorial parallax: inner image drifts against a clipped frame (skipped under reduced motion).
  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current) return;
      gsap.fromTo(
        ".about-img-inner",
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-img",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section
      id="about"
      ref={root}
      className="relative overflow-hidden bg-background py-20 lg:py-32"
    >
      {/* Decorative soft orb */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute start-[-6rem] top-24 size-96 rounded-full bg-primary-soft opacity-70 blur-3xl" />
      </div>

      <div className="container-site relative grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        {/* Statement — inline-start (right in RTL) */}
        <div className="lg:col-span-6 xl:col-span-6">
          <p className="about-eyebrow eyebrow">{ABOUT.eyebrow}</p>

          <h2
            ref={headline}
            className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {ABOUT.statement.map((line, i) => (
              <Fragment key={line}>
                {line}
                {i < ABOUT.statement.length - 1 && <br />}
              </Fragment>
            ))}
          </h2>

          <p className="about-body mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {ABOUT.body}
          </p>

          <div className="about-meta mt-10 flex items-center gap-4">
            <span className="h-px w-12 bg-primary" aria-hidden />
            <span className="font-label text-sm font-medium text-muted-foreground">
              {ABOUT.signature}
            </span>
          </div>
        </div>

        {/* Editorial parallax image — inline-end (left in RTL) */}
        <div className="relative lg:col-span-6 xl:col-span-6">
          <div className="about-img group relative aspect-[4/5] overflow-hidden rounded-app-lg border border-border bg-surface shadow-lg">
            <div className="about-img-inner absolute inset-0">
              {/*
                Token-validator exception: `sizes` media queries require literal
                px breakpoints — CSS var() is invalid inside the `sizes` attribute.
              */}
              <Image
                src={ABOUT.image.src}
                alt={ABOUT.image.alt}
                fill
                sizes="(min-width: 1024px) 500px, 800px"
                className="scale-[1.2] object-cover transition-transform duration-slow ease-out group-hover:scale-[1.26]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}