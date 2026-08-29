import { Hero } from "@/components/sections/Hero";
import { WhyBaran } from "@/components/sections/WhyBaran";
import { Services } from "@/components/sections/Services";
import { Doctors } from "@/components/sections/Doctors";
import { TestimonialsSection } from "@/components/sections/AnimatedTestimonials";
import { Emergency } from "@/components/sections/Emergency";
import { AppointmentCTA } from "@/components/sections/AppointmentCTA";
import { PetshopBanner } from "@/components/sections/PetshopBanner";

async function getFeaturedProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/petshop/featured`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to load featured products:", error);
    return [];
  }
}

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
