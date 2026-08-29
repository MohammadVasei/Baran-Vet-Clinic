"use client";

import { ShieldIcon, TruckIcon, RotateCcwIcon } from "@/components/icons";

export function BenefitsSection() {
  const benefits = [
    {
      icon: ShieldIcon,
      color: "bg-green-100 text-green-700",
      title: "اصل و با گارانتی",
      desc: "تمام محصولات از توزیع‌کنندگان رسمی تأمین می‌شوند",
    },
    {
      icon: TruckIcon,
      color: "bg-blue-100 text-blue-700",
      title: "تحویل سریع در مشهد",
      desc: "امکان تحویل در کلینیک یا ارسال پستی",
    },
    {
      icon: RotateCcwIcon,
      color: "bg-purple-100 text-purple-700",
      title: "استرجاع آسان",
      desc: "۷ روز ضمانت بازگشت کالا (شرایط اعمال می‌شود)",
    },
  ];

  return (
    <div className="mt-6 order-3 lg:order-1 rounded-app-lg border border-border bg-surface p-6 space-y-3">
      <h3 className="font-label text-sm text-primary-text">ضمانت‌های باران</h3>
      {benefits.map(({ icon: Icon, color, title, desc }, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-app bg-background">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}