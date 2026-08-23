"use client";

import { Fragment, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dog, Cat, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MobileSectionHeader } from "@/components/sections/mobile/MobileSectionHeader";
import { SnapCarousel } from "@/components/sections/mobile/SnapCarousel";
import { gsap } from "gsap";
import { TESTIMONIALS, type TestimonialItem } from "@/lib/content";

interface AnimatedTestimonialsProps {
  testimonials: TestimonialItem[];
  autoplay?: boolean;
  autoplayInterval?: number;
}

const SPECIES_ICONS: Record<"dog" | "cat", typeof Dog> = {
  dog: Dog,
  cat: Cat,
};

const SPECIES_LABELS: Record<"dog" | "cat", string> = {
  dog: "سگ",
  cat: "گربه",
};

function AnimatedTestimonialsDesktop({
  testimonials,
  autoplay = true,
  autoplayInterval = 5000,
}: AnimatedTestimonialsProps) {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const prefersReduced = prefersReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeTestimonial = useMemo(() => testimonials[activeIndex], [activeIndex, testimonials]);
  const testimonialsLength = testimonials.length;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonialsLength);
  }, [testimonialsLength]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength);
  }, [testimonialsLength]);

  const goToIndex = useCallback((index: number) => {
    setActiveIndex(index);
    if (autoplayRef.current) clearInterval(autoplayRef.current);
  }, []);

  useEffect(() => {
    if (!autoplay || prefersReduced) return;
    autoplayRef.current = setInterval(handleNext, autoplayInterval);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [autoplay, autoplayInterval, handleNext, prefersReduced]);

  useEffect(() => {
    if (!autoplay || prefersReduced) return;
    const handleMouseEnter = () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
    const handleMouseLeave = () => {
      autoplayRef.current = setInterval(handleNext, autoplayInterval);
    };
    const section = rootRef.current;
    section?.addEventListener("mouseenter", handleMouseEnter);
    section?.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      section?.removeEventListener("mouseenter", handleMouseEnter);
      section?.removeEventListener("mouseleave", handleMouseLeave);
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [autoplay, autoplayInterval, handleNext, prefersReduced]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handlePrev();
      if (e.key === "ArrowLeft") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev]);

  useGSAP(
    () => {
      if (reduced || !rootRef.current || !headlineRef.current) return;
      const ctx = gsap.context(() => {
        const { split } = revealLines(headlineRef.current!, {
          mask: true,
          stagger: 0.1,
          start: "top 85%",
          once: true,
        });
        revealUp(".testimonial-eyebrow", { once: true });
        revealUp(".testimonial-intro", { once: true });
        revealUp(".testimonial-nav", { once: true, y: 20, delay: 0.2 });
        return () => split.revert();
      }, rootRef);
      return () => ctx.revert();
    },
    { scope: rootRef, dependencies: [reduced] }
  );

  const quoteVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const SpeciesIcon = SPECIES_ICONS[activeTestimonial.species];
  const speciesLabel = SPECIES_LABELS[activeTestimonial.species];

  return (
    <section
      id="testimonials"
      ref={rootRef}
      className="relative overflow-hidden bg-background py-20 lg:py-28"
      dir="rtl"
      aria-labelledby="testimonials-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute start-[8%] top-[-3rem] size-[22rem] rounded-full bg-primary-soft opacity-40 blur-3xl" />
      </div>

      <div className="container-site relative">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          <div className="max-w-xl">
            <p className="testimonial-eyebrow eyebrow">{TESTIMONIALS.eyebrow}</p>
            <h2
              id="testimonials-heading"
              ref={headlineRef}
              className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
            >
              {TESTIMONIALS.headline.map((line, i) => (
                <Fragment key={line}>
                  {line}
                  {i < TESTIMONIALS.headline.length - 1 && <br />}
                </Fragment>
              ))}
            </h2>
            <p className="testimonial-intro mt-6 text-lg leading-relaxed text-muted-foreground">
              {TESTIMONIALS.intro}
            </p>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                variants={quoteVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="card-hover rounded-app-lg border border-border bg-surface p-8 shadow-sm h-full"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 size-12 rounded-full bg-primary-soft flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Quote className="size-6 text-primary-text opacity-30" />
                  </div>
                  <blockquote className="flex-1 text-lg leading-relaxed text-foreground">
                    {activeTestimonial.content}
                  </blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-4 pt-6 border-t border-border">
                  <div
                    className="flex-shrink-0 size-12 rounded-full bg-primary-soft flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <SpeciesIcon className="size-6 text-primary-text" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-foreground">
                      {activeTestimonial.name}
                    </p>
                    <p className="font-label text-sm text-muted-foreground">
                      {activeTestimonial.pet} · {speciesLabel}
                    </p>
                  </div>
                </figcaption>
              </motion.div>
            </AnimatePresence>

            <div className="testimonial-nav mt-10 flex items-center justify-between">
              <button
                className="nav-button flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-normal border border-border bg-surface hover:bg-primary hover:text-on-primary hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={handlePrev}
                aria-label={`نظر قبلی: ${testimonials[(activeIndex - 1 + testimonialsLength) % testimonialsLength].name}`}
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>

              <div className="flex items-center gap-2" role="tablist" aria-label="نمایش نظرات">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === activeIndex}
                    aria-label={`نمایش نظر ${testimonials[i].name}`}
                    onClick={() => goToIndex(i)}
                    className={`size-2.5 rounded-full transition-all duration-normal ${
                      i === activeIndex
                        ? "bg-primary"
                        : "bg-border-strong hover:bg-border"
                    }`}
                  />
                ))}
              </div>

              <button
                className="nav-button flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-normal border border-border bg-surface hover:bg-primary hover:text-on-primary hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={handleNext}
                aria-label={`نظر بعدی: ${testimonials[(activeIndex + 1) % testimonialsLength].name}`}
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimatedTestimonialsMobile({
  testimonials,
}: AnimatedTestimonialsProps) {
  return (
    <section id="testimonials" className="relative overflow-hidden bg-background py-20" dir="rtl" aria-labelledby="testimonials-heading">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute start-[8%] top-[-3rem] size-[22rem] rounded-full bg-primary-soft opacity-40 blur-3xl" />
      </div>

      <div className="container-site relative">
        <MobileSectionHeader
          eyebrow={TESTIMONIALS.eyebrow}
          headline={TESTIMONIALS.headline}
          intro={TESTIMONIALS.intro}
        />

        <div className="mt-8 -mx-6">
          <SnapCarousel
            ariaLabel="بازخورد مراجعین"
            slideClassName="w-[88%]"
            dotsActiveClass="bg-primary"
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} item={testimonial} />
            ))}
          </SnapCarousel>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  const SpeciesIcon = SPECIES_ICONS[item.species];
  const speciesLabel = SPECIES_LABELS[item.species];

  return (
    <figure className="card-hover flex flex-col justify-between rounded-app-lg border border-border bg-surface p-7 shadow-sm h-full">
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 size-10 rounded-full bg-primary-soft flex items-center justify-center"
          aria-hidden="true"
        >
          <Quote className="size-5 text-primary-text opacity-30" />
        </div>
        <blockquote className="flex-1 text-lg leading-relaxed text-foreground">
          {item.content}
        </blockquote>
      </div>
      <figcaption className="mt-8 flex items-center gap-3 pt-6 border-t border-border">
        <div
          className="flex-shrink-0 size-10 rounded-full bg-primary-soft flex items-center justify-center"
          aria-hidden="true"
        >
          <SpeciesIcon className="size-5 text-primary-text" aria-hidden="true" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-foreground">
            {item.name}
          </p>
          <p className="font-label text-xs text-muted-foreground">
            {item.pet} · {speciesLabel}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function AnimatedTestimonials({ testimonials, autoplay = true, autoplayInterval = 5000 }: AnimatedTestimonialsProps) {
  const isMobile = useIsMobile();
  return isMobile
    ? <AnimatedTestimonialsMobile testimonials={testimonials} />
    : <AnimatedTestimonialsDesktop testimonials={testimonials} autoplay={autoplay} autoplayInterval={autoplayInterval} />;
}

export default AnimatedTestimonials;