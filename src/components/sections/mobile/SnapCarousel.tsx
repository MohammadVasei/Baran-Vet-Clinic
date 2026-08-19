"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useSnapCarouselIndex } from "@/hooks/useSnapCarouselIndex";

type CarouselDotsProps = {
  count: number;
  active: number;
  activeClass?: string;
};

export function CarouselDots({ count, active, activeClass = "bg-primary" }: CarouselDotsProps) {
  if (count <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2" role="tablist" aria-label="نشانگر اسلایدها">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          role="tab"
          aria-selected={i === active}
          aria-label={`اسلاید ${i + 1}`}
          className={`size-2 rounded-full transition-colors duration-normal ${
            i === active ? activeClass : "bg-border-strong"
          }`}
        />
      ))}
    </div>
  );
}

type SnapCarouselProps = {
  children: ReactNode[];
  ariaLabel?: string;
  className?: string;
  slideClassName?: string;
  showDots?: boolean;
  dotsActiveClass?: string;
  onIndexChange?: (index: number) => void;
};

/**
 * Touch-first horizontal carousel built on native CSS scroll-snap (no JS
 * library). RTL-safe: the flex track flows from the inline-start and the
 * active index is derived from |scrollLeft|.
 *
 * `slideClassName` controls the slide width (e.g. `w-[85%]`) so the next
 * slide peeks, signalling more content. `showDots` renders the shared
 * CarouselDots indicator below the track.
 */
export function SnapCarousel({
  children,
  ariaLabel,
  className,
  slideClassName = "w-[85%]",
  showDots = true,
  dotsActiveClass,
  onIndexChange,
}: SnapCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const index = useSnapCarouselIndex(trackRef);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  return (
    <div className={className}>
      <div
        ref={trackRef}
        role="list"
        aria-label={ariaLabel}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 px-6"
      >
        {children.map((child, i) => (
          <div key={i} role="listitem" className={`snap-start shrink-0 ${slideClassName}`}>
            {child}
          </div>
        ))}
      </div>
      {showDots && (
        <div className="mt-5">
          <CarouselDots
            count={children.length}
            active={index}
            activeClass={dotsActiveClass}
          />
        </div>
      )}
    </div>
  );
}