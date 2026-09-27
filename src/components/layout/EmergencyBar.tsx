import { PhoneIcon } from "@/components/icons";
import { getCmsData } from "@/lib/cms";
import type { EmergencySection } from "@/lib/content-types";

export async function EmergencyBar() {
  const emergency: EmergencySection = (await getCmsData()).emergency;

  return (
    <div className="hidden emergency-bar bg-[var(--emergency-bg)] text-[var(--emergency-fg)] lg:block">
      <div className="container-site flex items-center justify-between gap-6 py-2.5 text-sm">
        <p className="flex items-center gap-2 font-label font-medium">
          <PhoneIcon className="size-4 shrink-0" />
          <span>اورژانس دامپزشکی (۹ صبح تا ۱۰ شب):</span>
          <a
            href={emergency.phoneHref}
            className="font-bold underline-offset-4 transition-colors hover:underline"
            dir="ltr"
          >
            {emergency.phone}
          </a>
        </p>
        <div className="flex items-center gap-4">
          <a
            href={emergency.mobile1WhatsApp}
            className="flex items-center gap-1.5 font-label transition-colors hover:opacity-80"
            dir="ltr"
            target="_blank"
            rel="noopener"
          >
            <PhoneIcon className="size-3.5" />
            <span className="text-xs">واتساپ</span>
          </a>
        </div>
      </div>
    </div>
  );
}