"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  form?: string;
  disabled?: boolean;
  ariaLabel?: string;
  ariaBusy?: boolean;
  /** How far the control is pulled toward the pointer (0 = off, 1 = full). */
  strength?: number;
  onClick?: () => void;
};

/**
 * Desktop-only magnetic hover: the whole control is pulled toward the pointer.
 * - GSAP `quickTo` on x/y — transform only, compositor-friendly, no layout thrash.
 * - Runs only for pointing devices (`hover + pointer: fine`) and only when the
 *   user has not requested reduced motion → touch devices and reduced-motion
 *   users get a plain, static (default-browser) control. Nothing here can block
 *   a tap/click — the transform is purely visual.
 */
export function MagneticButton({
  children,
  className,
  href,
  type = "button",
  form,
  disabled,
  ariaLabel,
  ariaBusy,
  strength = 0.28,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      prefersReducedMotion()
    ) {
      return;
    }

    const setX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const setY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

    // Cache the element's rect and refresh only on resize/scroll — never read
    // `getBoundingClientRect()` per pointermove (avoids a forced layout from
    // thrashing the main thread at high pointer-move rates).
    let cached = el.getBoundingClientRect();
    const measure = () => {
      cached = el.getBoundingClientRect();
    };
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });

    const onMove = (e: PointerEvent) => {
      const fromCenterX = e.clientX - (cached.left + cached.width / 2);
      const fromCenterY = e.clientY - (cached.top + cached.height / 2);
      setX(fromCenterX * strength);
      setY(fromCenterY * strength);
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.45, ease: "elastic.out(1, 0.4)" });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  if (href !== undefined) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={className}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      form={form}
      disabled={disabled}
      aria-busy={ariaBusy}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}