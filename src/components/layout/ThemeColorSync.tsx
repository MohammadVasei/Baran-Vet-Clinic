"use client";

import { useEffect } from "react";

/**
 * Keeps <meta name="theme-color"> in sync with the design-token
 * `--background` (single source of truth). The static metadata API can't
 * use `var()`, so we read the active computed value at runtime and update
 * on system-theme changes. No hardcoded hex anywhere.
 */
export function ThemeColorSync() {
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    const sync = () => {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim();
      if (bg) meta!.content = bg;
    };

    sync();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return null;
}