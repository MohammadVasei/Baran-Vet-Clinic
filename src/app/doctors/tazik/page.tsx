import { Metadata } from "next";
import { DoctorDetailPage } from "@/components/pages/DoctorDetailPage";

export const metadata: Metadata = {
  title: "دکتر محمد ابراهیم تازیک | دامپزشک عمومی | کلینیک باران",
  description: "دکتر محمد ابراهیم تازیک، دامپزشک عمومی و مدیر کلینیک دام‌های کوچک باران در احمدآباد مشهد",
};

export default function TazikPage() {
  return <DoctorDetailPage doctorKey="tazik" />;
}