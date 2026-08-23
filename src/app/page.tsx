import { Hero } from "@/components/sections/Hero";
import { WhyBaran } from "@/components/sections/WhyBaran";
import { Services } from "@/components/sections/Services";
import { Doctors } from "@/components/sections/Doctors";
import { TestimonialsSection } from "@/components/sections/AnimatedTestimonials";
import { Emergency } from "@/components/sections/Emergency";
import { AppointmentCTA } from "@/components/sections/AppointmentCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <WhyBaran />
      <Doctors />
      <TestimonialsSection />
      <Emergency />
      <AppointmentCTA />
    </>
  );
}