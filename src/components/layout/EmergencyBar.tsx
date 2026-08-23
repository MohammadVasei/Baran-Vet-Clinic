import { PhoneIcon } from "@/components/icons";
import { EMERGENCY } from "@/lib/content";

export function EmergencyBar() {
  return (
    <div className="bg-[var(--emergency-bg)] text-[var(--emergency-fg)]">
      <div className="container-site flex items-center justify-between gap-6 py-2 text-sm">
        <p className="flex items-center gap-2 font-label font-medium">
          <PhoneIcon className="size-4 shrink-0" />
          <span>اورژانس دامپزشکی (۹ صبح تا ۱۰ شب):</span>
          <a
            href={EMERGENCY.phoneHref}
            className="font-bold underline-offset-4 transition-colors hover:underline"
            dir="ltr"
          >
            {EMERGENCY.phone}
          </a>
        </p>
      </div>
    </div>
  );
}