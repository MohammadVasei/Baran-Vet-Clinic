"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ABOUT } from "@/lib/content";
import { MobileSectionHeader } from "@/components/sections/mobile/MobileSectionHeader";
import { revealLines, revealUp } from "@/lib/motion";

const STATEMENT_COLORS = [
  "text-accent-yellow",
  "text-accent-coral",
  "text-accent-green",
] as const;

export function AboutMobile() {
  const root = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !root.current || !headlineRef.current) return;

      const { split } = revealLines(headlineRef.current, {
        mask: true,
        stagger: 0.15,
        start: "top 85%",
        once: true,
      });

      revealUp(".about-body-mobile", { once: true, delay: 0.3 });
      revealUp(".about-meta-mobile", { once: true, delay: 0.4 });

      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section id="about" ref={root} className="relative overflow-hidden bg-background py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute start-[-6rem] top-24 size-96 rounded-full bg-primary-soft opacity-60 blur-3xl" />
      </div>

      <div className="container-site relative">
        <MobileSectionHeader
          eyebrow={ABOUT.eyebrow}
          headline={[]}
          intro={""}
        />

        <div className="mt-8 max-w-2xl">
          <h2
            ref={headlineRef}
            className="font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl"
          >
            {ABOUT.statement.map((line, i) => (
              <Fragment key={line}>
                <span className={STATEMENT_COLORS[i]}>
                  {line}
                </span>
                {i < ABOUT.statement.length - 1 && <br />}
              </Fragment>
            ))}
          </h2>

          <p className="about-body-mobile mt-6 text-base leading-relaxed text-muted-foreground">
            {ABOUT.body}
          </p>

          <div className="about-meta-mobile mt-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-primary" aria-hidden />
            <span className="font-label text-sm font-medium text-muted-foreground whitespace-nowrap">
              {ABOUT.signature}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}