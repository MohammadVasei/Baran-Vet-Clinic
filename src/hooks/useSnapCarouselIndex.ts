"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks the active slide index of a horizontal scroll-snap track from its
 * scroll position. RTL-safe (uses |scrollLeft| so negative RTL offsets behave
 * identically to LTR). Uses a passive scroll listener with an rAF throttle.
 * Computes stride = slideWidth + gap (from computed columnGap) for accurate
 * dot highlighting at every scroll position.
 */
export function useSnapCarouselIndex(trackRef: React.RefObject<HTMLElement | null>) {
  const [index, setIndex] = useState(0);
  const raf = useRef<number | null>(null);

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    const max = scrollWidth - clientWidth;
    if (max <= 0) {
      setIndex(0);
      return;
    }

    const children = Array.from(track.children) as HTMLElement[];
    const count = children.length;
    if (count <= 1) {
      setIndex(0);
      return;
    }

    const first = children[0];
    const slideWidth = first.offsetWidth;

    // Read the actual columnGap from the track's computed style
    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.columnGap || cs.gap || "0") || 0;
    const stride = slideWidth + gap;

    const pos = Math.abs(scrollLeft);
    const idx = Math.round(pos / stride);
    setIndex(Math.min(idx, count - 1));
  }, [trackRef]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(update);
    };
    update();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [trackRef, update]);

  return index;
}