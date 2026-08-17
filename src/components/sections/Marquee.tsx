import { Fragment } from "react";
import { PawIcon } from "@/components/icons";
import { MARQUEE } from "@/lib/content";

function MarqueeGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="marquee-group" aria-hidden={hidden || undefined}>
      {MARQUEE.items.map((item) => (
        <Fragment key={item}>
          <span className="whitespace-nowrap font-display text-lg font-semibold text-foreground">
            {item}
          </span>
          <PawIcon className="size-5 shrink-0 text-primary" />
        </Fragment>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div role="region" aria-label={MARQUEE.label} className="marquee">
      <div className="marquee-track">
        <MarqueeGroup />
        <MarqueeGroup hidden />
      </div>
    </div>
  );
}