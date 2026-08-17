import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { About } from "@/components/sections/About";
import { WhyBaran } from "@/components/sections/WhyBaran";
import { AnimalExperience } from "@/components/sections/AnimalExperience";
import { Services } from "@/components/sections/Services";
import { Facilities } from "@/components/sections/Facilities";
import { Doctors } from "@/components/sections/Doctors";
import { Emergency } from "@/components/sections/Emergency";
import { Trust } from "@/components/sections/Trust";
import { AppointmentCTA } from "@/components/sections/AppointmentCTA";

export default function Home() {
  return (
    <>
      {/* Step 7 — sections build sequentially; each verified before the next.
          Current: 7.11 AppointmentCTA (WOW 05) single-screen booking flow. */}
      <Hero />
      <Marquee />
      <About />
      <WhyBaran />
      <AnimalExperience />
      <Services />
      <Facilities />
      <Doctors />
      <Emergency />
      <Trust />
      <AppointmentCTA />
    </>
  );
}