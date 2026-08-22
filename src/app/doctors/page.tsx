import { Metadata } from "next";
import { DoctorsPage } from "@/components/pages/DoctorsPage";

export const metadata: Metadata = {
  title: "پزشکان و همکاران | کلینیک دامپزشکی باران مشهد",
  description: "آشنایی با تیم کلینیک دام‌های کوچک باران در احمدآباد — پزشکان و گرومر کنار پت شما.",
};

export default function DoctorsPageRoute() {
  return <DoctorsPage />;
}