"use client";

import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/useIsMobile";

const LIGHT_SCENE = "https://prod.spline.design/Whp9AlSt62gpHEcm-JDn/scene.hanacode";
const DARK_SCENE = "https://prod.spline.design/Whp9AlSt62gpHEcm-Wal/scene.hanacode";
const MOBILE_SCENE = "https://prod.spline.design/Whp9AlSt62gpHEcm-Y6K/scene.hanacode";

export function Hero() {
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  const currentTheme = resolvedTheme || "light";

  if (isMobile) {
    return (
      <section
        id="top"
        className="relative flex min-h-[calc(100svh-var(--header-height))] w-full overflow-hidden bg-background"
        aria-label="باران کلینیک حیوانات، صحنه سه‌بعدی تعاملی"
      >
        {/* @ts-expect-error - hana-viewer is a custom web component */}
        <hana-viewer
          url={MOBILE_SCENE}
          className="absolute inset-0 w-full h-full"
          aria-label="باران کلینیک حیوانات، صحنه سه‌بعدی تعاملی"
        />
      </section>
    );
  }

  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-var(--header-height))] w-full overflow-hidden bg-background"
      aria-label="باران کلینیک حیوانات، صحنه سه‌بعدی تعاملی"
    >
      {/* @ts-expect-error - hana-viewer is a custom web component */}
      <hana-viewer
        key={currentTheme}
        url={currentTheme === "dark" ? DARK_SCENE : LIGHT_SCENE}
        className="absolute inset-0 w-full h-full"
        aria-label="باران کلینیک حیوانات، صحنه سه‌بعدی تعاملی"
      />
    </section>
  );
}