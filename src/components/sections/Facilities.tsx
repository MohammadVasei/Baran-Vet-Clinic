"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import { useGSAP, gsap } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FACILITIES } from "@/lib/content";

const IMG_COUNT = FACILITIES.items.length;

export function Facilities() {
  const root = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (IMG_COUNT === 0) return;
      if (prefersReducedMotion() || reduced || !root.current || !pinRef.current || !headline.current) return;

      // Entry reveals for the chapter header (eyebrow, headline, intro).
      const { split } = revealLines(headline.current, {
        mask: true,
        stagger: 0.1,
        start: "top 85%",
        once: true,
      });
      revealUp(".fac-eyebrow", { once: true });
      revealUp(".fac-intro", { once: true });

      // Keep the header readable for much longer before the pinned panel takes over.
      gsap.to(".fac-header", {
        autoAlpha: 0,
        y: -12,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top 15%",
          end: "top 0%",
          scrub: true,
        },
      });

      // Cinematic pinned timeline — scrub maps scroll progress to clip-path reveals.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          pin: pinRef.current,
          scrub: 0.6,
        },
      });

      // Make each frame stay on screen noticeably longer so the section feels
      // slower, more premium, and less like it is fading out too early.
      const seg = 1 / IMG_COUNT;

      FACILITIES.items.forEach((_, i) => {
        const sel = `.fac-img[data-idx="${i}"]`;
        const label = `.fac-label[data-idx="${i}"]`;
        const start = i * seg;
        const revealDur = seg * 0.22;
        const holdDur = seg * 0.68;
        const hideDur = seg * 0.18;

        // Reveal: clip from bottom edge up.
        tl.fromTo(
          sel,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: revealDur, ease: "power2.inOut" },
          start
        );

        // Label fade-in.
        tl.fromTo(
          label,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: revealDur * 0.6, ease: "power2.out" },
          start + revealDur * 0.3
        );

        // Hold (already visible — just a spacer in the timeline).
        // No animation needed; the clip-path stays at inset(0).

        // Hide: clip to top edge (except last image, which stays visible).
        if (i < IMG_COUNT - 1) {
          tl.to(
            sel,
            { clipPath: "inset(100% 0% 0% 0%)", duration: hideDur, ease: "power2.inOut" },
            start + revealDur + holdDur
          );
          tl.to(
            label,
            { autoAlpha: 0, y: -10, duration: hideDur * 0.5, ease: "power1.in" },
            start + revealDur + holdDur
          );
        }
      });

      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  // Reduced-motion fallback: static visible layout (no pin, no clip-path).
  // Uses the SSR-safe `reduced` hook (NOT the live matchMedia) so SSR and
  // client hydration render the same branch — the effect guard on line 20
  // still uses the live check as belt-and-braces after hydration.
  if (reduced) {
    return (
      <section
        id="facilities"
        ref={root}
        className="relative overflow-hidden bg-background py-20 lg:py-32"
      >
        <div className="container-site relative">
          <div className="max-w-2xl">
            <p className="fac-eyebrow eyebrow">{FACILITIES.eyebrow}</p>
            <h2
              className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
            >
              {FACILITIES.headline.map((line, i) => (
                <Fragment key={line}>
                  {line}
                  {i < FACILITIES.headline.length - 1 && <br />}
                </Fragment>
              ))}
            </h2>
            <p className="fac-intro mt-6 text-lg leading-relaxed text-muted-foreground">
              {FACILITIES.intro}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {FACILITIES.items.map((item) => (
              <div
                key={item.key}
                className="card-hover group relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 450px, 800px"
                  className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-6">
                  <span className="font-label text-sm font-semibold text-primary">{item.name}</span>
                  <h3 className="mt-1 font-display text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="facilities"
      ref={root}
      className="relative bg-background"
      style={{ height: `${IMG_COUNT * 100}vh` }}
    >
      <div className="fac-header container-site absolute inset-x-0 top-0 z-30 pt-8 lg:pt-12">
        <div className="max-w-2xl rounded-2xl bg-background/70 backdrop-blur-xl border border-white/[0.08] p-8 lg:p-10">
          <p className="fac-eyebrow eyebrow">{FACILITIES.eyebrow}</p>
          <h2
            ref={headline}
            className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {FACILITIES.headline.map((line, i) => (
              <Fragment key={line}>
                {line}
                {i < FACILITIES.headline.length - 1 && <br />}
              </Fragment>
            ))}
          </h2>
          <p className="fac-intro mt-6 text-lg leading-relaxed text-muted-foreground">
            {FACILITIES.intro}
          </p>
        </div>
      </div>

      {/* Pinned cinematic panel — pinned inside the tall scroll area */}
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden pt-20 lg:pt-32">
        {FACILITIES.items.map((item, i) => (
          <div
            key={item.key}
            data-idx={i}
            aria-hidden={i > 0}
            className={`fac-img absolute inset-0 ${i === 0 ? "" : "clip-hidden"}`}
            style={i === 0 ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="100vw"
              className="object-cover"
            />
            {/* Dark overlay for text legibility */}
            <div className="absolute inset-0 bg-background/30" aria-hidden />
          </div>
        ))}

        {/* Text labels — positioned over the pinned images */}
        {FACILITIES.items.map((item, i) => (
          <div
            key={item.key}
            data-idx={i}
            className={`fac-label absolute inset-x-0 bottom-0 z-10 px-6 pb-12 sm:px-12 lg:px-20 ${
              i === 0 ? "" : "opacity-0"
            }`}
          >
            <div className="inline-block max-w-lg rounded-2xl bg-background/80 px-8 py-6 backdrop-blur-md">
              <span className="font-label text-sm font-semibold text-primary">{item.name}</span>
              <h3 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {item.text}
              </p>
            </div>
          </div>
        ))}

        {/* Progress dots */}
        <div className="absolute end-6 top-1/2 z-20 -translate-y-1/2 flex flex-col gap-3" aria-hidden>
          {FACILITIES.items.map((item, i) => (
            <div
              key={item.key}
              className="fac-dot size-2.5 rounded-full bg-white/40 transition-colors"
              data-idx={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
