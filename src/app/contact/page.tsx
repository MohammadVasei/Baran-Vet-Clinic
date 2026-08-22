import { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: "تماس با کلینیک دامپزشکی باران | احمدآباد مشهد",
  description: "آدرس، تلفن و واتساپ کلینیک دام‌های کوچک باران. نوبت و مشاوره سریع از طریق تماس یا پیام.",
};

export default function ContactPageRoute() {
  return <ContactPage />;
}