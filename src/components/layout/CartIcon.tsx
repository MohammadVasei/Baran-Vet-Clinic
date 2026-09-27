"use client";

import { useEffect, useRef } from "react";
import { ShoppingCartIcon } from "@/components/icons";
import { useCart, CART_FLY_EVENT } from "@/context/CartContext";
import { useGSAP, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Seconds between successive dots in one add. */
const DOT_STAGGER = 0.055;
/** Upper bound on dots per add, so a bulk add stays watchable. */
const MAX_DOTS = 12;

export function CartIcon({ animate = false }: { animate?: boolean }) {
  const { state, openCart, getItemCount } = useCart();
  const count = getItemCount();
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);

  // Hydrating a stored cart is a 0 -> N jump on every page load. Baseline the
  // count on the first hydrated commit so it never replays the add animation.
  const countRef = useRef(0);
  const primedRef = useRef(false);
  const liveDots = useRef<HTMLSpanElement[]>([]);

  useGSAP(
    () => {
      if (!state.hydrated) return;
      if (!primedRef.current) {
        primedRef.current = true;
        countRef.current = count;
        return;
      }
      const prev = countRef.current;
      countRef.current = count;
      if (count <= prev) return;
      if (prefersReducedMotion() || reduced) return;

      const tl = gsap.timeline({
        // Drop the inline transforms once the pop settles, so the icon does not
        // keep a compositing hint (or a stray translate) between adds.
        onComplete: () => {
          [iconRef, badgeRef, pulseRef].forEach((r) => {
            if (r.current) gsap.set(r.current, { clearProps: "transform,opacity" });
          });
        },
      });
      if (iconRef.current) {
        tl.fromTo(
          iconRef.current,
          { scale: 1, rotate: 0 },
          { scale: 1.18, duration: 0.14, ease: "power2.out" }
        )
          .to(iconRef.current, { scale: 1, duration: 0.2, ease: "power2.inOut" })
          .to(
            iconRef.current,
            { rotate: 0, scale: 1.16, duration: 0.1, ease: "power1.out" },
            "<"
          )
          .to(iconRef.current, { scale: 1, duration: 0.34, ease: "back.out(2.4)" });
      }
      if (badgeRef.current) {
        // First item springs in from nothing; later bumps just pop.
        const from = prev === 0 ? { scale: 0, opacity: 0 } : { scale: 1.3 };
        tl.fromTo(
          badgeRef.current,
          from,
          { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(3)" },
          0.04
        );
      }
      if (pulseRef.current) {
        tl.fromTo(
          pulseRef.current,
          { scale: 0.6, opacity: 0.9 },
          { scale: 1.9, opacity: 0, duration: 0.55, ease: "power2.out" },
          0
        );
      }
      return () => {
        tl.kill();
        [iconRef, badgeRef, pulseRef].forEach((r) => {
          if (r.current) gsap.set(r.current, { clearProps: "transform,opacity" });
        });
      };
    },
    { scope: rootRef, dependencies: [count, state.hydrated, reduced] }
  );

  // Flying dot: launched by addItem() anywhere in the app, lands on this button.
  // Opt-in via `animate`, because a second CartIcon lives in the mobile menu
  // panel. That panel is hidden with a transform when closed, so its children
  // still report a non-zero rect and would launch a duplicate dot.
  useEffect(() => {
    if (!animate) return;
    if (prefersReducedMotion() || reduced) return;

    // Dots live on document.body, so unmounting mid-flight would orphan them —
    // an addEventListener callback cannot return a cleanup. Track and sweep.
    const live = liveDots;
    live.current = [];
    const onFly = (event: Event) => {
      const from = (event as CustomEvent<{ x: number; y: number; count?: number }>).detail;
      const el = rootRef.current;
      if (!from || !el) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      if (rect.right < 0 || rect.left > window.innerWidth) return;

      const to = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      // One dot per unit added, staggered so the burst reads as a stream rather
      // than a single blob. Capped so a 50-unit add stays watchable.
      const total = Math.min(Math.max(1, Math.round(from.count ?? 1)), MAX_DOTS);

      // Control point lifts the arc above the straight line.
      const cx = (from.x + to.x) / 2;
      const cy = Math.min(from.y, to.y) - Math.min(120, Math.abs(from.y - to.y) * 0.45);

      for (let i = 0; i < total; i++) {
        const dot = document.createElement("span");
        dot.setAttribute("aria-hidden", "true");
        dot.style.cssText = [
          "position:fixed",
          "left:0",
          "top:0",
          "z-index:var(--z-toast)",
          "width:14px",
          "height:14px",
          "margin:-7px 0 0 -7px",
          "border-radius:var(--radius-full)",
          "background:var(--primary)",
          "box-shadow:0 0 0 4px var(--primary-soft)",
          "pointer-events:none",
          "will-change:transform",
        ].join(";");
        // Park it on the start of its arc straight away — a staggered dot has no
        // tween running yet, and without this it would sit at the viewport origin.
        const place = (t: number) => {
          const inv = 1 - t;
          dot.style.transform = `translate(${
            inv * inv * from.x + 2 * inv * t * cx + t * t * to.x
          }px, ${inv * inv * from.y + 2 * inv * t * cy + t * t * to.y}px) scale(${1 - 0.4 * t})`;
        };
        place(0);
        document.body.appendChild(dot);
        live.current.push(dot);

        const progress = { t: 0 };
        gsap.timeline({
          delay: i * DOT_STAGGER,
          onComplete: () => {
            dot.remove();
            live.current = live.current.filter((d) => d !== dot);
          },
        }).to(progress, {
          t: 1,
          duration: 0.42,
          ease: "power2.inOut",
          onUpdate: () => place(progress.t),
        });
      }
    };

    window.addEventListener(CART_FLY_EVENT, onFly);
    return () => {
      window.removeEventListener(CART_FLY_EVENT, onFly);
      live.current.forEach((d) => d.remove());
      live.current = [];
    };
  }, [animate, reduced]);

  return (
    <button
      ref={rootRef}
      onClick={openCart}
      className="btn btn-outline size-10 relative !p-0"
      aria-label={`سبد خرید${count > 0 ? `، ${count} مورد` : "، خالی"}`}
    >
      {/* Only mounted when there is something to pulse, so an empty cart has
          no ring element at all. */}
      {count > 0 && (
        <span
          ref={pulseRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-app border-2 border-primary opacity-0"
        />
      )}
      <span ref={iconRef} className="inline-flex">
        <ShoppingCartIcon className="size-5 text-foreground" />
      </span>
      {count > 0 && (
        <span
          ref={badgeRef}
          className="absolute -top-1 -left-1 min-w-5 h-5 bg-primary text-on-primary text-xs font-bold rounded-full flex items-center justify-center px-1.5 tabular-nums ring-2 ring-[var(--nav-bg)] shadow-md"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
