import { Suspense } from "react";
import { Metadata } from "next";
import { CommonDiseasesPage } from "@/components/pages/CommonDiseasesPage";

export const metadata: Metadata = {
  title: "بیماری‌های شایع سگ، گربه و پرندگان | کلینیک دامپزشکی باران مشهد",
  description: "آشنایی با بیماری‌های رایج سگ، گربه و پرندگان خانگی، علائم و مراقبت‌های اولیه — اطلاعات آموزشی از کلینیک دام‌های کوچک باران احمدآباد.",
  openGraph: {
    title: "بیماری‌های شایع سگ، گربه و پرندگان | کلینیک دامپزشکی باران مشهد",
    description: "آشنایی با بیماری‌های رایج سگ، گربه و پرندگان خانگی، علائم و مراقبت‌های اولیه — اطلاعات آموزشی از کلینیک دام‌های کوچک باران احمدآباد.",
    type: "website",
    locale: "fa_IR",
    siteName: "کلینیک دامپزشکی باران",
  },
  twitter: {
    title: "بیماری‌های شایع سگ، گربه و پرندگان | کلینیک دامپزشکی باران مشهد",
    description: "آشنایی با بیماری‌های رایج سگ، گربه و پرندگان خانگی، علائم و مراقبت‌های اولیه",
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CommonDiseasesPageRoute() {
  return (
    <Suspense fallback={null}>
      <CommonDiseasesPage />
    </Suspense>
  );
}