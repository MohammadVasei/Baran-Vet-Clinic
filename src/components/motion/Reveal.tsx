"use client";

import { useRef, type ElementType, type ReactNode, type Ref } from "react";
import { useGSAP } from "@/lib/gsap";
import { revealUp } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  start?: string;
  y?: number;
  once?: boolean;
};

/**
 * Scroll-triggered fade-up reveal wrapper.
 * - GSAP runs client-side only (useGSAP), scoped to the element.
 * - Reduced motion → animation skipped entirely (content stays visible).
 * - Cleanup is automatic via useGSAP's context revert on unmount.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  start,
  y,
  once,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      revealUp(ref.current, { delay, start, y, once });
    },
    { scope: ref, dependencies: [reduced, delay, start, y, once] }
  );

  return (
    <Tag ref={ref as Ref<HTMLElement>} className={className}>
      {children}
    </Tag>
  );
}
