"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { TESTIMONIALS } from "@/lib/content";

export function TestimonialsSection() {
  return (
    <AnimatedTestimonials testimonials={TESTIMONIALS.items} autoplay={true} autoplayInterval={5000} />
  );
}

export default TestimonialsSection;