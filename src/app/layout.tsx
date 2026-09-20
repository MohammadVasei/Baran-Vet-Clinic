import type { Metadata, Viewport } from "next";
import { Vazirmatn, Estedad } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { EmergencyBar } from "@/components/layout/EmergencyBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/layout/Preloader";
import { ThemeColorSync } from "@/components/layout/ThemeColorSync";
import { PageTransition } from "@/components/motion/PageTransition";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { CmsProvider } from "@/context/CmsContext";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { MobileQuickAccess } from "@/components/layout/MobileQuickAccess";
import { getCmsData } from "@/lib/cms";

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cms = await getCmsData();

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${estedad.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/baran-logo.svg" />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Skip link for keyboard navigation */}
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:bg-primary focus-visible:text-on-primary focus-visible:z-10 focus-visible:py-2 focus-visible:px-4"
        >
          به محتوای اصلی برو
        </a>

        <Script
          src="https://cdn.spline.design/@splinetool/hana-viewer@1.2.54/hana-viewer.js"
          type="module"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <CmsProvider data={cms}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="baran-theme"
          >
            <AuthProvider>
              <CartProvider>
                <ThemeColorSync />
                <PageTransition />
                <Preloader />
                <EmergencyBar />
                <Header />
                <main id="main" className="flex-1">
                  {children}
                </main>
                <Footer />
                <CartDrawer />
                <MobileQuickAccess />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </CmsProvider>
      </body>
    </html>
  );
}