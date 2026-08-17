import { ClockIcon, PhoneIcon } from "@/components/icons";

export function EmergencyBar() {
  // TODO: real data — emergency phone + hours from clinic
  return (
    <div className="bg-[var(--emergency-bg)] text-[var(--emergency-fg)]">
      <div className="container-site flex items-center justify-between gap-6 py-2 text-sm">
        <p className="flex items-center gap-2 font-label font-medium">
          <PhoneIcon className="size-4 shrink-0" />
          <span>اورژانس دامپزشکی (۲۴ ساعته):</span>
          <a
            href="tel:+982122000000"
            className="font-bold underline-offset-4 transition-colors hover:underline"
            dir="ltr"
          >
            ۰۲۱-۲۲۰۰۰۰۰۰
          </a>
        </p>
        <p className="hidden items-center gap-2 font-label font-medium sm:flex">
          <ClockIcon className="size-4 shrink-0" />
          <span>هر روز هفته: ۹ صبح تا ۱۰ شب</span>
        </p>
      </div>
    </div>
  );
}