import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF to supporting browsers (Chrome/Firefox/Safari 16.4+) with
    // WebP fallback — largest image-transfer win (Step 10: images optimized).
    formats: ["image/avif", "image/webp"],
    // Product photos are uploaded to Supabase Storage and served from
    // <project>.supabase.co — allow Next <Image> to optimize them.
    remotePatterns: [
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname }]
        : []),
      { protocol: "https" as const, hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
