import type { Metadata, Viewport } from "next";
import { Vazirmatn, Estedad } from "next/font/google";
import "./globals.css";
import { EmergencyBar } from "@/components/layout/EmergencyBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/layout/Preloader";
import { ThemeColorSync } from "@/components/layout/ThemeColorSync";
import { PageTransition } from "@/components/motion/PageTransition";

// Self-hosted via next/font/google (variable, arabic subset for Persian).
// CSS variables feed the token system (--font-body/--font-heading/--font-numeral).
const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  weight: "variable",
  display: "swap",
});

const estedad = Estedad({
  variable: "--font-estedad",
  subsets: ["arabic"],
  weight: "variable",
  display: "swap",
});

// Full SEO treatment lands in Step 11; base identity is set here.
export const metadata: Metadata = {
  title: {
    default: "کلینیک دامپزشکی باران",
    template: "%s | کلینیک دامپزشکی باران",
  },
  description:
    // TODO: real data — rewrite when clinic copy is finalized
    "کلینیک دامپزشکی باران؛ درمان حرفه‌ای، با مهربانی و علم روز برای سگ، گربه، پرندگان و حیوانات اگزوتیک. رزرو نوبت آنلاین.",
  applicationName: "کلینیک دامپزشکی باران",
};

// colorScheme moved out of `metadata` (deprecated) into `viewport`.
// theme-color is handled at runtime by <ThemeColorSync /> reading the
// --background token (no hardcoded hex; the static API can't use var()).
export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${estedad.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeColorSync />
        <PageTransition />
        <Preloader />
        <EmergencyBar />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}