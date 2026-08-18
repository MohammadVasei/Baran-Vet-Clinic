"use client";

import type { VideoHTMLAttributes } from "react";

interface GoldieVideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> {
  src: string;
  alt?: string;
}

export function GoldieVideo({ src, alt = "Goldie mascot", className = "", ...props }: GoldieVideoProps) {
  return (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className={className}
      aria-label={alt}
      role="img"
      {...props}
    />
  );
}