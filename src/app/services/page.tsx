import { Metadata } from "next";
import { ServicesPage } from "@/components/pages/ServicesPage";

export const metadata: Metadata = {
  title: "خدمات کلینیک دامپزشکی باران | درمان، شناسنامه، گرومینگ و پت‌شاپ",
  description: "همه خدمات کلینیک دام‌های کوچک باران در یک نگاه — درمان، شناسنامه سلامت، شستشو و اصلاح و پت‌شاپ در احمدآباد مشهد.",
};

export default function ServicesPageRoute() {
  return <ServicesPage />;
}