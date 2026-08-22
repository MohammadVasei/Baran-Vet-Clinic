import { Metadata } from "next";
import { ServiceDetailPage } from "@/components/pages/ServiceDetailPage";

export const metadata: Metadata = {
  title: "شستشو و اصلاح حرفه‌ای پت | گرومینگ کلینیک باران مشهد",
  description: "گرومینگ آرام و حرفه‌ای سگ و گربه در کلینیک دامپزشکی باران احمدآباد — شستشو و اصلاح با دقت و مهربانی.",
};

export default function GroomingPage() {
  return <ServiceDetailPage serviceKey="grooming" />;
}