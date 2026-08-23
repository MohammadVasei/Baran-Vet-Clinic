"use client";

import { Fragment, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SERVICES } from "@/lib/content";
import { SERVICE_ACCENTS } from "@/lib/accents";
import { ArrowIcon } from "@/components/icons";

export function ServicesPage() {
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
      revealUp(".svc-page-eyebrow", { once: true });
      revealUp(".svc-page-intro", { once: true });
      revealUp(".svc-page-grid", { once: true, y: 24 });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section id="services" ref={root} className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="container-site relative">
        <div className="max-w-2xl">
          <p className="svc-page-eyebrow eyebrow">{SERVICES.eyebrow}</p>
          <h1
            ref={headline}
            className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {SERVICES.headline.map((line, i) => (
              <Fragment key={line}>
                {line}
                {i < SERVICES.headline.length - 1 && <br />}
              </Fragment>
            ))}
          </h1>
          <p className="svc-page-intro mt-6 text-lg leading-relaxed text-muted-foreground">
            {SERVICES.intro}
          </p>
        </div>

        <div className="svc-page-grid mt-12 grid gap-6 md:grid-cols-2">
          {SERVICES.items.map((service) => {
            const accent = SERVICE_ACCENTS[service.accent];
            return (
              <Link
                key={service.key}
                href={service.href}
                className="group relative block overflow-hidden rounded-app-lg border border-border bg-surface transition-shadow duration-normal hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 top-0 z-10 h-1.5" aria-hidden style={{ backgroundColor: `var(--${accent.bar.replace("bg-", "")})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" aria-hidden style={{ backgroundColor: `var(--${accent.dot.replace("bg-", "")})` }} />
                    <span className="font-label text-sm font-semibold text-primary-text">{service.name}</span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-foreground group-hover:text-primary-text-hover transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">{service.text}</p>
                  <div className="mt-4 flex items-center gap-2 text-primary-text font-semibold">
                    جزئیات بیشتر
                    <ArrowIcon className="size-4 rtl:rotate-180" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg leading-relaxed text-muted-foreground mb-6">
            سؤالی دارید یا می‌خواهید نوبت بگیرید؟
          </p>
          <p className="text-muted-foreground mb-4">با ما در ارتباط باشید.</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#contact" className="btn btn-primary">
              تماس با کلینیک
            </a>
            <a href="https://wa.me/989153588160" target="_blank" rel="noopener" className="btn btn-outline">
              پیام در واتساپ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}