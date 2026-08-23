"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SERVICES } from "@/lib/content";
import { SERVICE_ACCENTS as ACCENTS } from "@/lib/accents";
import { ServicesMobile } from "@/components/sections/mobile/ServicesMobile";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";

export function Services() {
  const isMobile = useIsMobile();
  return isMobile ? <ServicesMobile /> : <ServicesDesktop />;
}

function ServicesDesktop() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

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
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  const testimonials = SERVICES.items.map((s) => ({
    quote: s.text,
    name: s.name,
    designation: s.tagline,
    src: s.image,
    href: s.href,
    accent: s.accent,
  }));

  const activeAccent = ACCENTS[SERVICES.items[0].accent];

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

        <div className="mt-12">
          <CircularTestimonials
            testimonials={testimonials}
            autoplay={true}
            colors={{
              name: "var(--foreground)",
              designation: "var(--muted-foreground)",
              testimony: "var(--foreground)",
              arrowBackground: activeAccent.fg.replace("text-", "").replace("-fg", "") === "accent-purple" ? "var(--accent-purple)" : 
                activeAccent.fg.replace("text-", "").replace("-fg", "") === "accent-orange" ? "var(--accent-orange)" :
                activeAccent.fg.replace("text-", "").replace("-fg", "") === "accent-lime" ? "var(--accent-lime)" : "var(--accent-magenta)",
              arrowForeground: "var(--background)",
              arrowHoverBackground: activeAccent.fg.replace("text-", "").replace("-fg", "") === "accent-purple" ? "var(--accent-purple)" : 
                activeAccent.fg.replace("text-", "").replace("-fg", "") === "accent-orange" ? "var(--accent-orange)" :
                activeAccent.fg.replace("text-", "").replace("-fg", "") === "accent-lime" ? "var(--accent-lime)" : "var(--accent-magenta)",
            }}
            fontSizes={{
              name: "2rem",
              designation: "1.125rem",
              quote: "1.125rem",
            }}
          />
        </div>
      </div>
    </section>
  );
}