"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";

// Total visibility < 0.9s (plan gate). Reduced-motion: hides instantly.
const SHOW_MS = 420;
const FADE_MS = 300;

export function Preloader() {
  const [hidden, setHidden] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const showMs = reduce ? 0 : SHOW_MS;
    const fadeMs = reduce ? 0 : FADE_MS;
    const t1 = window.setTimeout(() => setHidden(true), showMs);
    const t2 = window.setTimeout(() => setDone(true), showMs + fadeMs);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={ref}
      className="preloader"
      style={{ opacity: hidden ? 0 : 1 }}
      aria-hidden={hidden}
    >
      <div className="flex flex-col items-center gap-4">
        <Logo width={120} height={120} className="drop-shadow-lg" />
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-foreground">باران</p>
          <p className="font-label text-sm text-muted-foreground">کلینیک دامپزشکی</p>
        </div>
        <div className="h-0.5 w-24 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full origin-right scale-x-0 animate-[preloader-bar_420ms_cubic-bezier(0.22,1,0.36,1)_forwards] bg-primary" />
        </div>
      </div>
    </div>
  );
}