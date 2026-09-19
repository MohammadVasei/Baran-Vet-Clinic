"use client";

import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useEffect, useState } from "react";

const LIGHT_SCENE = "https://prod.spline.design/Whp9AlSt62gpHEcm-JDn/scene.hanacode";
const DARK_SCENE = "https://prod.spline.design/Whp9AlSt62gpHEcm-Wal/scene.hanacode";
const MOBILE_SCENE = "https://prod.spline.design/Whp9AlSt62gpHEcm-HLo/scene.hanacode";
const MOBILE_DARK_EMBED = "https://my.spline.design/untitled-mxPaJhgTqx4iZRiioVbt6FNt-3T7/";

export function Hero() {
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);
  const currentTheme = resolvedTheme || "light";

  // Set mounted state after first render to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isMobile) {
    return (
      <section
        id="top"
        className="relative flex min-h-[calc(100svh-var(--header-height))] w-full overflow-hidden bg-background"
        aria-label="باران کلینیک حیوانات، صحنه سه‌بعدی تعاملی"
        suppressHydrationWarning
      >
        {resolvedTheme === "dark" ? (
          <iframe
            src={MOBILE_DARK_EMBED}
            title="باران کلینیک حیوانات، صحنه سه‌بعدی تعاملی"
            aria-label="باران کلینیک حیوانات، صحنه سه‌بعدی تعاملی"
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
          />
        ) : (
          /* @ts-expect-error - hana-viewer is a custom web component */
          <hana-viewer
            url={MOBILE_SCENE}
            className="absolute inset-0 w-full h-full"
            aria-label="باران کلینیک حیوانات، صحنه سه‌بعدی تعاملی"
            suppressHydrationWarning
          />
        )}
      </section>
    );
  }

  // During SSR/hydration, use light theme to avoid mismatch
  // After mount, use the actual resolved theme
  const themeToUse = isMounted ? currentTheme : "light";
  const sceneUrl = themeToUse === "dark" ? DARK_SCENE : LIGHT_SCENE;

  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-var(--header-height))] w-full overflow-hidden bg-background"
      aria-label="باران کلینیک حیوانات، صحنه سه‌بعدی تعاملی"
      suppressHydrationWarning
    >
      {/* @ts-expect-error - hana-viewer is a custom web component */}
      <hana-viewer
        key={themeToUse}
        url={sceneUrl}
        className="absolute inset-0 w-full h-full"
        aria-label="باران کلینیک حیوانات، صحنه سه‌بعدی تعاملی"
        suppressHydrationWarning
      />
    </section>
  );
}