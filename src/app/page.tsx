import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Doctors } from "@/components/sections/Doctors";
import { TestimonialsSection } from "@/components/sections/AnimatedTestimonials";
import { AppointmentCTA } from "@/components/sections/AppointmentCTA";
import { PetshopBanner } from "@/components/sections/PetshopBanner";
import { getFeaturedProducts } from "@/lib/featured-products";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <Hero />
      <PetshopBanner products={featuredProducts} />
      <Services />
      <Doctors />
      <AppointmentCTA />
      <TestimonialsSection />
    </>
  );
}