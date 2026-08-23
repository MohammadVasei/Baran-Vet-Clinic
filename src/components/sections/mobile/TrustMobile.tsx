"use client";

import { TRUST } from "@/lib/content";
import { HeartPulseIcon } from "@/components/icons";
import { MobileSectionHeader } from "@/components/sections/mobile/MobileSectionHeader";
import { SnapCarousel } from "@/components/sections/mobile/SnapCarousel";

/**
 * Mobile (<768px) variant of «اعتماد شما» — horizontal testimonial carousel
 * with one prominent quote at a time, dots indicator. Card styling matches
 * the Doctor/Facility cards for a coherent system.
 */
export function TrustMobile() {
  return (
    <section id="trust" className="relative overflow-hidden bg-background py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute end-[8%] top-[-3rem] size-[22rem] rounded-full bg-primary-soft opacity-40 blur-3xl" />
      </div>

      <div className="container-site relative">
        <MobileSectionHeader
          eyebrow={TRUST.eyebrow}
          headline={TRUST.headline}
          intro={TRUST.intro}
        />

        <div className="mt-8 -mx-6">
          <SnapCarousel
            ariaLabel="بازخورد مراجعین"
            slideClassName="w-[88%]"
            dotsActiveClass="bg-primary"
          >
            {TRUST.items.map((item) => (
              <TestimonialCard key={item.key} item={item} />
            ))}
          </SnapCarousel>
        </div>

        <p className="mt-10 inline-flex items-center gap-2 text-sm leading-relaxed text-muted-foreground">
          <HeartPulseIcon className="size-4 text-primary-text" />
          {TRUST.note}
        </p>
      </div>
    </section>
  );
}

function TestimonialCard({ item }: { item: typeof TRUST.items[0] }) {
  return (
    <figure className="card-hover flex flex-col justify-between rounded-app-lg border border-border bg-surface p-7 shadow-sm h-full">
      <blockquote className="text-lg leading-relaxed text-foreground">
        {item.quote}
      </blockquote>
      <figcaption className="mt-8 border-t border-border pt-5">
        <p className="font-display text-base font-semibold text-foreground">
          {item.author}
        </p>
        <p className="mt-1 font-label text-sm text-muted-foreground">
          {item.context}
        </p>
      </figcaption>
    </figure>
  );
}