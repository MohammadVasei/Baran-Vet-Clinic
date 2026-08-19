"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// Desktop-first during SSR/hydration (matches the shipped markup, so there is
// no hydration mismatch). Once mounted, mobile viewports swap to the
// mobile-specific variants below the fold.
function getServerSnapshot() {
  return true;
}

/**
 * True when the viewport is narrower than the 768px mobile breakpoint.
 * Desktop-first: server snapshot is `false` (desktop), and the value flips to
 * `true` client-side only after hydration on phones.
 */
export function useIsMobile(): boolean {
  const isDesktop = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return !isDesktop;
}
