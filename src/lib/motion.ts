import { gsap, SplitText } from "@/lib/gsap";

/* ------------------------------------------------------------------
   Shared motion system.
   - Durations/eases are read from CSS custom-property tokens (no hex,
     no magic numbers in JS). GSAP cannot parse CSS `cubic-bezier(...)`
     strings as eases, so `ease()` maps token names to GSAP eases.
   - All helpers run client-side only (called from useGSAP / effects).
   ------------------------------------------------------------------ */

const EASES: Record<string, string> = {
  "--ease-out": "power2.out",
  "--ease-in-out": "power1.inOut",
  "--ease-spring": "back.out(1.4)",
  "--ease-smooth": "expo.inOut",
};

/** Read a CSS custom property from :root (client only). */
export function cssVar(name: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * Duration in seconds from a `--duration-*` token.
 *
 * The token is declared as `150ms` but Chrome's computed value of a custom
 * property is serialized in seconds (`0.15s`) when the property participates
 * in a `transition-duration`/`animation-duration` computation — so the parser
 * must accept BOTH `150ms` and `0.15s`. (A naive `parseFloat(...) / 1000`
 * turned `.15s` into `0.00015s` and collapsed every GSAP animation to
 * instant — verified in Step 9.) Reduced-motion callers pass the token as-is;
 * `prefersReducedMotion()` upper layers skip the tween entirely.
 */
export function duration(token = "--reveal-duration", fallback = 0.6): number {
  const raw = cssVar(token, "");
  const m = /(-?[\d.]+)\s*(ms|s)?/i.exec(raw);
  if (!m) return fallback;
  const num = parseFloat(m[1]);
  if (Number.isNaN(num)) return fallback;
  return m[2] && m[2].toLowerCase() === "ms" ? num / 1000 : num;
}

/** GSAP ease string for a `--ease-*` token name. */
export function ease(token = "--ease-out"): string {
  return EASES[token] ?? EASES["--ease-out"] ?? "power1.out";
}

export type RevealOptions = {
  trigger?: Element;
  start?: string;
  once?: boolean;
  delay?: number;
  y?: number;
  duration?: number;
  ease?: string;
};

/** Fade-up reveal bound to scroll (or load when `start` is "top 5%"). */
export function revealUp(target: gsap.TweenTarget, opts: RevealOptions = {}) {
  const trigger = opts.trigger ?? (target as Element);
  const y = opts.y ?? 28;
  return gsap.fromTo(
    target,
    { autoAlpha: 0, y },
    {
      autoAlpha: 1,
      y: 0,
      duration: opts.duration ?? duration(),
      ease: opts.ease ?? ease(),
      delay: opts.delay ?? 0,
      scrollTrigger: {
        trigger,
        start: opts.start ?? "top 85%",
        toggleActions: opts.once ? "play none none none" : "play none none reverse",
      },
    }
  );
}

/** Clip-path reveal (e.g. image curtains). Animates `inset()` string. */
export function fadeMask(
  target: gsap.TweenTarget,
  opts: RevealOptions & { from?: string; to?: string } = {}
) {
  const trigger = opts.trigger ?? (target as Element);
  const from = opts.from ?? "inset(0% 0% 100% 0%)";
  const to = opts.to ?? "inset(0% 0% 0% 0%)";
  return gsap.fromTo(
    target,
    { clipPath: from },
    {
      clipPath: to,
      duration: opts.duration ?? duration(),
      ease: opts.ease ?? ease(),
      delay: opts.delay ?? 0,
      scrollTrigger: {
        trigger,
        start: opts.start ?? "top 90%",
        toggleActions: opts.once ? "play none none none" : "play none none reverse",
      },
    }
  );
}

/** Split an element into (masked) lines for line-by-line reveals. */
export function splitLines(el: HTMLElement, opts: { mask?: boolean } = {}) {
  return SplitText.create(el, {
    type: "lines",
    ...(opts.mask === false ? {} : { mask: "lines" }),
  });
}

/** Line-by-line mask reveal for a heading (SplitText, RTL-safe). */
export function revealLines(
  el: HTMLElement,
  opts: { mask?: boolean; stagger?: number; start?: string; once?: boolean } = {}
) {
  const split = splitLines(el, opts);
  const tl = gsap.fromTo(
    split.lines,
    { yPercent: 110 },
    {
      yPercent: 0,
      stagger: opts.stagger ?? 0.08,
      duration: duration(),
      ease: ease("--ease-smooth"),
      scrollTrigger: {
        trigger: el,
        start: opts.start ?? "top 85%",
        toggleActions: opts.once ? "play none none none" : "play none none reverse",
      },
    }
  );
  return { split, tl };
}

/** Live `prefers-reduced-motion` at call time (client only). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Default scroll trigger behavior used across the site. */
export const SCROLL = {
  toggleActions: "play none none reverse" as const,
  start: "top 85%" as const,
};
