import { Hero } from "@/components/sections/Hero";
import { WhyBaran } from "@/components/sections/WhyBaran";
import { Services } from "@/components/sections/Services";
import { Doctors } from "@/components/sections/Doctors";
import { Emergency } from "@/components/sections/Emergency";
import { Trust } from "@/components/sections/Trust";
import { AppointmentCTA } from "@/components/sections/AppointmentCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <WhyBaran />
      <Doctors />
      <Trust />
      <Emergency />
      <AppointmentCTA />
    </>
  );
}