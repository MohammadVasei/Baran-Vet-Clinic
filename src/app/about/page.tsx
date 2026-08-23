import { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "درباره کلینیک دامپزشکی باران | احمدآباد مشهد",
  description: "آشنایی با تیم، فضاها و تجربه‌های مراجعین کلینیک دام‌های کوچک باران در احمدآباد مشهد. درمان، گرومینگ و مراقبت با دقت و مهربانی.",
};

export default function AboutPageRoute() {
  return <AboutPage />;
}