"use client";

import Link from "next/link";
import Image from "next/image";
import { DOCTORS } from "@/lib/content";
import { MobileSectionHeader } from "@/components/sections/mobile/MobileSectionHeader";
import { SnapCarousel } from "@/components/sections/mobile/SnapCarousel";

/**
 * Mobile (<768px) variant of «تیم پزشکان» — horizontal snap carousel with
 * one prominent doctor card at a time, partial next visible, dots indicator.
 * Links to `/doctors/[slug]` preserved.
 */
export function DoctorsMobile() {
  return (
    <section id="doctors" className="relative overflow-hidden bg-surface-alt py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute start-1/2 top-[-4rem] size-[30rem] -translate-x-1/2 rounded-full bg-primary-soft opacity-40 blur-3xl" />
      </div>

      <div className="container-site relative">
        <MobileSectionHeader
          eyebrow={DOCTORS.eyebrow}
          headline={DOCTORS.headline}
          intro={DOCTORS.intro}
        />

        <div className="mt-8 -mx-6">
          <SnapCarousel
            ariaLabel="تیم پزشکان"
            slideClassName="w-[85%]"
            dotsActiveClass="bg-primary"
          >
            {DOCTORS.items.map((doc) => (
              <DoctorCard key={doc.key} doc={doc} />
            ))}
          </SnapCarousel>
        </div>
      </div>
    </section>
  );
}

function DoctorCard({ doc }: { doc: typeof DOCTORS.items[0] }) {
  return (
    <Link
      href={`/doctors/${doc.slug}`}
      className="group relative block overflow-hidden rounded-app-lg border border-border bg-surface transition-shadow duration-normal hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={doc.image}
          alt={doc.alt}
          fill
          sizes="(max-width: 767px) 100vw, 0px"
          className="object-cover transition-transform duration-slow ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-5">
        <span className="block font-label text-xs font-semibold tracking-wide text-primary-text">
          {doc.role}
        </span>
        <span className="mt-1 block font-display text-lg font-bold text-foreground">
          {doc.name}
        </span>
      </div>

      <span className="absolute end-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground opacity-0 backdrop-blur-sm transition-all duration-normal group-hover:opacity-100" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-4 rtl:rotate-180">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </span>
    </Link>
  );
}