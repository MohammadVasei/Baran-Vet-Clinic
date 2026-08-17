"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { TRUST } from "@/lib/content";
import { HeartPulseIcon } from "@/components/icons";

export function Trust() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const { split } = revealLines(headline.current, {
        mask: true,
        stagger: 0.1,
        start: "top 85%",
        once: true,
      });
      revealUp(".trust-eyebrow", { once: true });
      revealUp(".trust-intro", { once: true });
      revealUp(".trust-grid", { once: true, y: 24 });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section
      id="trust"
      ref={root}
      className="relative overflow-hidden bg-background py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute end-[8%] top-[-3rem] size-[22rem] rounded-full bg-primary-soft opacity-40 blur-3xl" />
      </div>

      <div className="container-site relative">
        <div className="max-w-2xl">
          <p className="trust-eyebrow eyebrow">{TRUST.eyebrow}</p>
          <h2
            ref={headline}
            className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {TRUST.headline.map((line, i) => (
              <Fragment key={line}>
                {line}
                {i < TRUST.headline.length - 1 && <br />}
              </Fragment>
            ))}
          </h2>
          <p className="trust-intro mt-6 text-lg leading-relaxed text-muted-foreground">
            {TRUST.intro}
          </p>
        </div>

        <div className="trust-grid mt-12 grid gap-6 md:grid-cols-3">
          {TRUST.items.map((item) => (
            <figure
              key={item.key}
              className="card-hover flex flex-col justify-between rounded-2xl border border-border bg-surface p-7 shadow-sm"
            >
              <blockquote className="text-lg leading-relaxed text-foreground">
                {item.quote}
              </blockquote>
              <figcaption className="mt-8 border-t border-border pt-5">
                <p className="font-display text-base font-semibold text-foreground">
                  {item.author}
                </p>
                <p className="mt-1 font-label text-sm text-muted-foreground">
                  {item.context}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-10 inline-flex items-center gap-2 text-sm leading-relaxed text-muted-foreground">
          <HeartPulseIcon className="size-4 text-primary" />
          {TRUST.note}
        </p>
      </div>
    </section>
  );
}