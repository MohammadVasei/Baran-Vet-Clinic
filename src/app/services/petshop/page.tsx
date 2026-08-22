import { Metadata } from "next";
import { ServiceDetailPage } from "@/components/pages/ServiceDetailPage";

export const metadata: Metadata = {
  title: "پت‌شاپ کلینیک باران | محصولات حیوانات خانگی در احمدآباد",
  description: "خرید محصولات مورد نیاز پت در پت‌شاپ کلینیک دامپزشکی باران مشهد — راحت و در دسترس.",
};

export default function PetshopPage() {
  return <ServiceDetailPage serviceKey="petshop" />;
}