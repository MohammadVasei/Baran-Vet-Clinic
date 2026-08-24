import { Metadata } from "next";
import { DoctorDetailPage } from "@/components/pages/DoctorDetailPage";

export const metadata: Metadata = {
  title: "مژگان جهانی | گرومر | کلینیک باران",
  description: "مژگان جهانی، گرومر ارشد کلینیک دام‌های کوچک باران در احمدآباد مشهد — گرومینگ حرفه‌ای و آرام برای سگ و گربه",
};

export default function MoghanJahaniPage() {
  return <DoctorDetailPage doctorKey="moghan-jahani" />;
}