import { Metadata } from "next";
import { ServiceDetailPage } from "@/components/pages/ServiceDetailPage";

export const metadata: Metadata = {
  title: "درمان حیوانات خانگی | کلینیک دامپزشکی باران مشهد",
  description: "مراقبت درمانی آرام و دقیق برای پت شما در کلینیک دام‌های کوچک باران، احمدآباد مشهد.",
};

export default function DarmanPage() {
  return <ServiceDetailPage serviceKey="darman" />;
}