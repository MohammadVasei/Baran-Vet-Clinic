"use client";

import { About } from "@/components/sections/About";
import { Facilities } from "@/components/sections/Facilities";
import { AnimalExperience } from "@/components/sections/AnimalExperience";

export function AboutPage() {
  return (
    <>
      <About />
      <Facilities />
      <AnimalExperience />
    </>
  );
}