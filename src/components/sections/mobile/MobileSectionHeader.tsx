"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type MobileSectionHeaderProps = {
  eyebrow: string;
  headline: string[];
  intro: string;
};

/**
 * Shared chapter header for all mobile section variants — one eyebrow,
 * split-line headline and intro so every mobile section speaks the same
 * typographic/spacing language as the desktop chapters.
 */
export function MobileSectionHeader({ eyebrow, headline, intro }: MobileSectionHeaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const h = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !root.current || !h.current || headline.length === 0) return;
      const { split } = revealLines(h.current, {
        mask: true,
        stagger: 0.1,
        start: "top 85%",
        once: true,
      });
      revealUp(".msh-eyebrow", { once: true });
      revealUp(".msh-intro", { once: true });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced, headline.length] }
  );

  return (
    <div ref={root} className="max-w-2xl">
      <p className="msh-eyebrow eyebrow">{eyebrow}</p>
      <h2
        ref={h}
        className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground"
      >
        {headline.map((line, i) => (
          <Fragment key={line}>
            {line}
            {i < headline.length - 1 && <br />}
          </Fragment>
        ))}
      </h2>
      <p className="msh-intro mt-6 text-lg leading-relaxed text-muted-foreground">{intro}</p>
    </div>
  );
}