import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF to supporting browsers (Chrome/Firefox/Safari 16.4+) with
    // WebP fallback — largest image-transfer win (Step 10: images optimized).
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
