import { Hero } from "@/components/sections/Hero";
import { WhyBaran } from "@/components/sections/WhyBaran";
import { Services } from "@/components/sections/Services";
import { Doctors } from "@/components/sections/Doctors";
import { TestimonialsSection } from "@/components/sections/AnimatedTestimonials";
import { Emergency } from "@/components/sections/Emergency";
import { AppointmentCTA } from "@/components/sections/AppointmentCTA";
import { PetshopBanner } from "@/components/sections/PetshopBanner";
import { getFeaturedProducts } from "@/lib/featured-products";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <Hero />
      <WhyBaran />
      <PetshopBanner products={featuredProducts} />
      <Services />
      <Doctors />
      <TestimonialsSection />
      <Emergency />
      <AppointmentCTA />
    </>
  );
}