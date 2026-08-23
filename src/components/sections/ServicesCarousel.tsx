"use client";

import { Fragment } from "react";
import { SERVICES } from "@/lib/content";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";

const placeholderImages: Record<string, string> = {
  darman: "/images/service-dental.jpg",
  shenasname: "/images/service-surgery.jpg",
  grooming: "/images/service-lab.jpg",
  petshop: "/images/service-petshop.jpg",
};

const carouselItems = SERVICES.items.map((s) => ({
  src: placeholderImages[s.key] ?? "/images/service-petshop.jpg",
  name: `${s.numeral} ${s.name}`,
  designation: s.tagline,
  quote: s.title,
  href: s.href,
}));

export function ServicesCarousel() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-surface-alt py-20 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute end-[-6rem] top-24 size-96 rounded-full bg-accent-soft opacity-60 blur-3xl" />
      </div>

      <div className="container-site relative">
        <div className="max-w-2xl mb-12 lg:mb-16">
          <p className="eyebrow">{SERVICES.eyebrow}</p>
          <h2 className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]">
            {SERVICES.headline.map((line, i) => (
              <Fragment key={line}>
                {line}
                {i < SERVICES.headline.length - 1 && <br />}
              </Fragment>
            ))}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {SERVICES.intro}
          </p>
        </div>

        <CircularTestimonials
          testimonials={carouselItems}
          autoplay={true}
        />
      </div>
    </section>
  );
}