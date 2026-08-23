import { Metadata } from "next";
import { DoctorDetailPage } from "@/components/pages/DoctorDetailPage";

export const metadata: Metadata = {
  title: "دکتر رضا واسعی | متخصص پرندگان | کلینیک باران",
  description: "دکتر رضا واسعی، متخصص طب پرندگان در کلینیک دام‌های کوچک باران احمدآباد مشهد",
};

export default function VaseiPage() {
  return <DoctorDetailPage doctorKey="vasei" />;
}