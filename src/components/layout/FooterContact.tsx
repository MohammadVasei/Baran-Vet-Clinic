"use client";

import { ClockIcon, PhoneIcon, MapPinIcon } from "@/components/icons";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useCms } from "@/context/CmsContext";

export function FooterContact() {
  const CLINIC = useCms().clinic;

  return (
    <div className="col-span-2 lg:col-span-1">
      <h2 className="font-display text-base font-bold text-foreground">اطلاعات بیشتر</h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground lg:mt-4">
        ترجیح می‌دهید مستقیم با ما در تماس باشید؟ از راه‌های زیر می‌توانید اقدام کنید.
      </p>

      <ul className="mt-5 space-y-4 text-sm">
        <li className="flex items-start gap-2.5">
          <ClockIcon className="mt-0.5 size-4 shrink-0 text-primary-text" />
          <div>
            <span className="block font-semibold text-foreground">ساعت کاری</span>
            <span className="mt-0.5 block text-muted-foreground">{CLINIC.hoursNote}</span>
            {CLINIC.hours.map((h, i) => (
              <span key={i} className="block leading-relaxed text-muted-foreground">
                {h.days}: {h.time}
              </span>
            ))}
          </div>
        </li>
        <li className="flex items-start gap-2.5">
          <PhoneIcon className="mt-0.5 size-4 shrink-0 text-primary-text" />
          <div>
            <span className="block font-semibold text-foreground">تلفن</span>
            <a
              dir="ltr"
              href={CLINIC.phoneHref}
              className="mt-0.5 block text-muted-foreground transition-colors duration-fast hover:text-primary-text-hover"
            >
              {CLINIC.phone}
            </a>
          </div>
        </li>
        <li className="flex items-start gap-2.5">
          <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary-text" />
          <div>
            <span className="block font-semibold text-foreground">آدرس</span>
            <span className="mt-0.5 block leading-relaxed text-muted-foreground">{CLINIC.address}</span>
          </div>
        </li>
      </ul>

      <MagneticButton href={CLINIC.phoneHref} className="btn btn-primary mt-6">
        تماس با کلینیک
      </MagneticButton>
    </div>
  );
}
