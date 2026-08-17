import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Register once. Guarded so this module is safe to import during SSR
// (plugin registration touches browser globals).
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // Mobile perf: ignore the URL-bar/viewport height resize churn on mobile
  // so ScrollTrigger doesn't refresh (re-measure) on every scroll bounce.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
