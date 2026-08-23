"use client";

import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export function Logo({ className = "", width = 40, height = 40, alt = "باران کلینیک دام‌های کوچک" }: LogoProps) {
  return (
    <Image
      src="/baran-logo-complete.png"
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}