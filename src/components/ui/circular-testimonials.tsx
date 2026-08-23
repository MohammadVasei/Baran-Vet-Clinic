"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
  href?: string;
}

interface Colors {
  name?: string;
  designation?: string;
  testimony?: string;
  arrowBackground?: string;
  arrowForeground?: string;
  arrowHoverBackground?: string;
}

interface FontSizes {
  name?: string;
  designation?: string;
  quote?: string;
}

interface CircularTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  colors?: Colors;
  fontSizes?: FontSizes;
}

function calculateGap(width: number) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export const CircularTestimonials = ({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
}: CircularTestimonialsProps) => {
  const colorName = colors.name ?? "var(--foreground)";
  const colorDesignation = colors.designation ?? "var(--muted-foreground)";
  const colorTestimony = colors.testimony ?? "var(--foreground)";
  const colorArrowBg = colors.arrowBackground ?? "var(--foreground)";
  const colorArrowFg = colors.arrowForeground ?? "var(--background)";
  const colorArrowHoverBg = colors.arrowHoverBackground ?? "var(--primary)";
  const fontSizeName = fontSizes.name ?? "1.5rem";
  const fontSizeDesignation = fontSizes.designation ?? "0.925rem";
  const fontSizeQuote = fontSizes.quote ?? "1.125rem";

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const testimonialsLength = useMemo(() => testimonials.length, [testimonials]);
  const activeTestimonial = useMemo(
    () => testimonials[activeIndex],
    [activeIndex, testimonials]
  );

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonialsLength);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (autoplay) {
      autoplayIntervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonialsLength);
      }, 5000);
    }
    return () => {
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    };
  }, [autoplay, testimonialsLength]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev]);

  function getImageStyle(index: number): React.CSSProperties {
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.8;
    const isActive = index === activeIndex;
    const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
    const isRight = (activeIndex + 1) % testimonialsLength === index;

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(0px) translateY(0px) scale(1) rotateY(0deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }
    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }
    if (isRight) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }
    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    };
  }

  const quoteVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const renderContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeIndex}
        variants={quoteVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <h3
          className="name"
          style={{ color: colorName, fontSize: fontSizeName }}
        >
          {activeTestimonial.name}
        </h3>
        <p
          className="designation"
          style={{ color: colorDesignation, fontSize: fontSizeDesignation }}
        >
          {activeTestimonial.designation}
        </p>
        <motion.p
          className="quote"
          style={{ color: colorTestimony, fontSize: fontSizeQuote }}
        >
          {activeTestimonial.quote.split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut", delay: 0.025 * i }}
              style={{ display: "inline-block" }}
            >
              {word}&nbsp;
            </motion.span>
          ))}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="relative max-w-[56rem] mx-auto px-4">
      <div className="grid gap-20 lg:grid-cols-2 lg:gap-10 items-start">
        <div className="relative lg:order-2" ref={imageContainerRef} style={{ height: "24rem" }}>
          {testimonials.map((testimonial, index) => (
            <Link
              key={testimonial.src}
              href={testimonial.href ?? "#"}
              className="block"
              aria-label={testimonial.name}
            >
              <Image
                src={testimonial.src}
                alt={testimonial.name}
                fill
                className="testimonial-image object-cover rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                data-index={index}
                style={getImageStyle(index)}
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </Link>
          ))}
        </div>
        <div className="flex flex-col justify-between min-h-[24rem] lg:order-1">
          <div>{renderContent()}</div>
          <div className="flex gap-6 pt-12">
            <button
              className="arrow-button prev-button flex-shrink-0 w-[2.7rem] h-[2.7rem] rounded-full flex items-center justify-center cursor-pointer transition-colors border-none"
              onClick={handlePrev}
              style={{
                backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg,
              }}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              aria-label="Previous service"
            >
              <FaArrowLeft size={28} color={colorArrowFg} />
            </button>
            <button
              className="arrow-button next-button flex-shrink-0 w-[2.7rem] h-[2.7rem] rounded-full flex items-center justify-center cursor-pointer transition-colors border-none"
              onClick={handleNext}
              style={{
                backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg,
              }}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              aria-label="Next service"
            >
              <FaArrowRight size={28} color={colorArrowFg} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularTestimonials;