"use client";

import { Fragment, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DOCTORS, CLINIC } from "@/lib/content";
import { PhoneIcon } from "@/components/icons";

export function DoctorsPage() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const { split } = revealLines(headline.current, {
        mask: true,
        stagger: 0.1,
        start: "top 85%",
        once: true,
      });
      revealUp(".doc-page-eyebrow", { once: true });
      revealUp(".doc-page-intro", { once: true });
      revealUp(".doc-page-grid", { once: true, y: 24 });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section id="doctors" ref={root} className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute start-1/2 top-[-4rem] size-[30rem] -translate-x-1/2 rounded-full bg-primary-soft opacity-40 blur-3xl" />
      </div>

      <div className="container-site relative">
        <div className="max-w-2xl">
          <p className="doc-page-eyebrow eyebrow">{DOCTORS.eyebrow}</p>
          <h1
            ref={headline}
            className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {DOCTORS.headline.map((line, i) => (
              <Fragment key={line}>
                {line}
                {i < DOCTORS.headline.length - 1 && <br />}
              </Fragment>
            ))}
          </h1>
          <p className="doc-page-intro mt-6 text-lg leading-relaxed text-muted-foreground">
            {DOCTORS.intro}
          </p>
        </div>

        <div className="doc-page-grid mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DOCTORS.items.map((doc) => (
            <Link
              key={doc.key}
              href={`/doctors/${doc.slug}`}
              className="group relative block overflow-hidden rounded-app-lg border border-border bg-surface transition-shadow duration-normal hover:shadow-lg"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={doc.image}
                  alt={doc.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-slow ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                <span className="block font-label text-xs font-semibold tracking-wide text-primary">
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
          ))}
        </div>

        <div className="mt-16">
          <div className="rounded-app-lg border border-border bg-surface p-6 sm:p-8 text-center">
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              برای نوبت ویزیت یا گرومینگ، کافی است با شماره‌های کلینیک تماس بگیرید. ما از شنیدن صدای شما خوشحال می‌شویم.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={CLINIC.phoneHref} className="btn btn-primary">
                <PhoneIcon className="size-4" />
                تماس با کلینیک
              </a>
              <a href={CLINIC.mobile1WhatsApp} target="_blank" rel="noopener" className="btn btn-outline">
                <PhoneIcon className="size-4" />
                پیام در واتساپ
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}