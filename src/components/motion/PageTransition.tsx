"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { duration, ease, prefersReducedMotion } from "@/lib/motion";

/**
 * Layered blue/white page transition (Step 9) — "wired for future routes".
 *
 * A fixed two-layer overlay — a white `--surface` panel layered under a blue
 * `--primary` panel — sweeps over the old page (white, then blue on top),
 * `router.push` runs while fully covered, then the layers sweep off (blue,
 * then white trailing) revealing the new page. ~640ms total, direction-neutral
 * (vertical) → RTL-correct by construction.
 *
 * - Capture-phase click interceptor: only genuine same-origin route
 *   navigations are intercepted (skips `#hash` same-page anchors, tel/mailto,
 *   external origins, new-tab/modified clicks, downloads). Every future route
 *   automatically gets the transition — no per-route wiring needed.
 * - Reduced motion → plain `router.push`, overlay never appears.
 * - Touch taps fire a `click`, so the transition behaves identically on touch.
 * - Panels are `pointer-events-none`; a rapid second click during the sweep is
 *   honoured as a direct navigation (rare, visually imperfect, never broken).
 */
export function PageTransition() {
  const router = useRouter();
  const whiteRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const navigate = (href: string) => {
      const white = whiteRef.current;
      const blue = blueRef.current;
      if (busyRef.current || !white || !blue) {
        router.push(href);
        return;
      }
      busyRef.current = true;

      if (prefersReducedMotion()) {
        busyRef.current = false;
        router.push(href);
        return;
      }

      const fast = duration("--duration-fast", 0.15);
      const smooth = ease("--ease-smooth");
      const hold = fast; // pause between cover and reveal while React commits

      const tl = gsap.timeline({
        defaults: { ease: smooth },
        onComplete: () => {
          busyRef.current = false;
        },
      });

      // 1) White panel sweeps over the old page (bottom-up). Visibility must
      //    be flipped on by GSAP (CSS default is `hidden` so SSR/no-JS never
      //    paints the overlay).
      tl.fromTo(
        white,
        { visibility: "visible", yPercent: 100 },
        { yPercent: 0, duration: fast },
        0.02
      )
        // 2) Blue panel sweeps over the white while navigation starts.
        .fromTo(
          blue,
          { visibility: "visible", yPercent: 100 },
          { yPercent: 0, duration: fast },
          fast
        )
        .add(() => router.push(href), fast)
        // 3) Hold, then sweep the panels off — blue first, white trailing —
        //    and hide them again when the sweep completes.
        .to(blue, { yPercent: -100, duration: fast }, fast * 2 + hold)
        .to(
          white,
          { yPercent: -100, duration: fast },
          fast * 2 + hold + 0.04
        )
        .set([white, blue], { visibility: "hidden" });
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if ((anchor.getAttribute("rel") ?? "").split(/\s+/).includes("external")) return;

      let url: URL;
      try {
        url = new URL(rawHref, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      if (url.pathname + url.search === location.pathname + location.search) return;

      e.preventDefault();
      e.stopPropagation();
      navigate(url.pathname + url.search + url.hash);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[var(--z-page-transition)]"
    >
      <div ref={whiteRef} className="pt-panel absolute inset-0 bg-surface" />
      <div ref={blueRef} className="pt-panel absolute inset-0 bg-primary" />
    </div>
  );
}
