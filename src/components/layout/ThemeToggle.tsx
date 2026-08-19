"use client";

import { SunIcon, MoonIcon } from "@/components/icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const currentTheme = resolvedTheme || theme;

  if (!mounted) {
    return (
      <button
        className="btn btn-outline size-10 relative"
        aria-label="تبدیل تم"
      >
        <SunIcon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">در حال بارگذاری...</span>
      </button>
    );
  }

  return (
    <button
      className="btn btn-outline size-10 relative"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      aria-label={currentTheme === "dark" ? "حالت روشن" : "حالت تیره"}
      aria-pressed={currentTheme === "dark"}
    >
      <SunIcon
        className="h-5 w-5 rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0"
        aria-hidden="true"
      />
      <MoonIcon
        className="absolute h-5 w-5 rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      />
      <span className="sr-only">{currentTheme === "dark" ? "حالت روشن" : "حالت تیره"}</span>
    </button>
  );
}