import { Fragment } from "react";
import { PawIcon } from "@/components/icons";
import { getCmsData } from "@/lib/cms";

async function MarqueeGroup() {
  const marquee = (await getCmsData()).marquee;
  return (
    <div className="marquee-group">
      {marquee.items.map((item) => (
        <Fragment key={item}>
          <span className="whitespace-nowrap font-display text-lg font-semibold text-foreground">
            {item}
          </span>
          <PawIcon className="size-5 shrink-0 text-primary-text" />
        </Fragment>
      ))}
    </div>
  );
}

export async function Marquee() {
  const marquee = (await getCmsData()).marquee;
  return (
    <div role="region" aria-label={marquee.label} className="marquee">
      <div className="marquee-track">
        <MarqueeGroup />
        <MarqueeGroup />
      </div>
    </div>
  );
}