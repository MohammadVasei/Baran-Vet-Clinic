"use client";

import { useRef } from "react";

type SwipeOptions = {
  onPrev: () => void;
  onNext: () => void;
  threshold?: number;
};

/**
 * Minimal RTL-aware horizontal pointer-swipe detector for non-scroll panels.
 * A swipe toward the inline-start edge (right in RTL, left in LTR) maps to the
 * "previous" item and a swipe toward the inline-end maps to "next", matching
 * the natural behaviour of a scroll-snap track in the current direction.
 *
 * Returns the pointer handlers to spread onto the target element.
 */
export function useSwipe({ onPrev, onNext, threshold = 56 }: SwipeOptions) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    start.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    // Ignore predominantly vertical gestures (page scrolling).
    if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return;

    const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";
    const towardStart = isRtl ? dx > 0 : dx < 0;
    if (towardStart) onPrev();
    else onNext();
  };

  const onPointerCancel = () => {
    start.current = null;
  };

  return { onPointerDown, onPointerUp, onPointerCancel };
}