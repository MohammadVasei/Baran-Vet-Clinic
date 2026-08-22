import { Metadata } from "next";
import { ServiceDetailPage } from "@/components/pages/ServiceDetailPage";

export const metadata: Metadata = {
  title: "شناسنامه سلامت پت | کلینیک دامپزشکی باران",
  description: "صدور شناسنامه سلامت حیوانات خانگی در کلینیک باران احمدآباد — پیگیری آسان واکسیناسیون و چکاپ.",
};

export default function ShenasnamePage() {
  return <ServiceDetailPage serviceKey="shenasname" />;
}