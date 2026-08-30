"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { useCms } from "@/context/CmsContext";

export function TestimonialsSection() {
  const TESTIMONIALS = useCms().testimonials;
  return (
    <AnimatedTestimonials testimonials={TESTIMONIALS.items} autoplay={true} autoplayInterval={5000} />
  );
}

export default TestimonialsSection;