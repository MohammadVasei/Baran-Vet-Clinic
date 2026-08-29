import { Metadata } from "next";
import { CheckoutPageClient } from "./CheckoutPageClient";

export const metadata: Metadata = {
  title: "تسویه‌حساب | پت‌شاپ کلینیک باران",
  description: "مرحله نهایی خرید — بررسی سفارش و پرداخت",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}