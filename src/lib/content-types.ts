/**
 * Shared content types — the single source of truth for the public-site
 * content models. These types describe both the static snapshot shape
 * (historical / tests) and the JSONB payloads stored in `site_content`
 * plus the presentation columns on services/doctors/testimonials/diseases.
 * Runtime values now live in Supabase (see src/lib/cms.ts) — no static
 * content objects should be defined in this repo anymore.
 */

export type ServiceAccent = "purple" | "orange" | "lime" | "magenta";

export type Service = {
  key: string;
  numeral: string;
  name: string;
  tagline: string;
  title: string;
  text: string;
  image: string;
  alt: string;
  accent: ServiceAccent;
  href: string;
};

export type ServicesSection = {
  eyebrow: string;
  headline: string[];
  intro: string;
  items: Service[];
};

export type Facility = {
  key: string;
  name: string;
  title: string;
  text: string;
  image: string;
  alt: string;
};

export type FacilitiesSection = {
  eyebrow: string;
  headline: string[];
  intro: string;
  items: Facility[];
};

export type AnimalKey = "dog" | "cat" | "bird" | "exotic" | "other";

export type AnimalCategory = {
  key: AnimalKey;
  name: string;
  image: string;
  alt: string;
  title: string;
  text: string;
};

export type AnimalsSection = {
  eyebrow: string;
  headline: string[];
  intro: string;
  categories: AnimalCategory[];
};

export type Doctor = {
  key: string;
  name: string;
  role: string;
  image: string;
  alt: string;
  slug: string;
  education: string[];
  experience: string;
  bio: string;
  focusAreas: string[];
  clinicRole: string;
};

export type DoctorsSection = {
  eyebrow: string;
  headline: string[];
  intro: string;
  items: Doctor[];
};

export type TestimonialItem = {
  id: number;
  name: string;
  pet: string;
  content: string;
  species: "dog" | "cat";
};

export type TestimonialsSection = {
  eyebrow: string;
  headline: string[];
  intro: string;
  items: TestimonialItem[];
};

export type AppointmentStepKey = "service" | "animal" | "date" | "contact";

export type AppointmentStep = {
  key: AppointmentStepKey;
  label: string;
  title: string;
  hint: string;
};

export type TimeSlot = { key: string; label: string };

export type AppointmentSection = {
  eyebrow: string;
  headline: string[];
  intro: string;
  note: string;
  steps: AppointmentStep[];
  timeSlots: TimeSlot[];
};

export type OpenHours = { days: string; time: string };

export type Clinic = {
  name: string;
  brand: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  mobile1: string;
  mobile1Href: string;
  mobile1WhatsApp: string;
  mobile2: string;
  mobile2Href: string;
  mobile2WhatsApp: string;
  email: string;
  address: string;
  addressShort: string;
  hours: OpenHours[];
  hoursNote: string;
  instagram: string;
  instagramUrl: string;
  threads: string;
  threadsUrl: string;
};

export type AboutSection = {
  eyebrow: string;
  statement: string[];
  body: string;
  signature: string;
  image: { src: string; alt: string };
};

export type WhyStep = {
  number: string;
  title: string;
  text: string;
};

export type WhySection = {
  eyebrow: string;
  headline: string[];
  intro: string;
  steps: WhyStep[];
  image: { src: string; alt: string };
};

export type MarqueeSection = {
  label: string;
  items: string[];
};

export type EmergencySection = {
  eyebrow: string;
  headline: string[];
  intro: string;
  phone: string;
  mobile1: string;
  mobile2: string;
  hours: OpenHours[];
  hoursNote: string;
  phoneHref: string;
  mobile1Href: string;
  mobile1WhatsApp: string;
  mobile2Href: string;
  mobile2WhatsApp: string;
};

export type ContactSection = {
  eyebrow: string;
  headline: string[];
  intro: string;
  phones: {
    label: string;
    number: string;
    href: string;
    icon: string;
    whatsapp?: string;
  }[];
  socials: { label: string; handle: string; href: string }[];
  address: string;
  hours: OpenHours[];
  hoursNote: string;
  finalMessage: string;
};

export type DiseaseCategory = "infectious" | "chronic";

export type Disease = {
  name: string;
  symptoms: string;
  care: string;
  category: DiseaseCategory;
};

export type AnimalDiseases = {
  key: AnimalKey;
  label: string;
  diseases: Disease[];
  accent: "dog" | "cat" | "bird";
  image: string;
  alt: string;
};

export type DiseasesContent = {
  groups: AnimalDiseases[];
  generalAdvice: string[];
  disclaimer: { title: string; text: string };
};

export type SiteContentKeys =
  | "clinic"
  | "about"
  | "why"
  | "animals"
  | "marquee"
  | "emergency"
  | "appointment"
  | "contact"
  | "facilities"
  | "services_section"
  | "doctors_section"
  | "testimonials_section"
  | "diseases_groups"
  | "general_advice"
  | "disclaimer";

export type SiteContentRow = {
  id: string;
  key: string;
  data: unknown;
  created_at: string;
  updated_at: string;
};

/** Everything the public site knows about the clinic — one immutable snapshot. */
export type CmsContent = {
  clinic: Clinic;
  about: AboutSection;
  why: WhySection;
  animals: AnimalsSection;
  marquee: MarqueeSection;
  services: ServicesSection;
  facilities: FacilitiesSection;
  doctors: DoctorsSection;
  emergency: EmergencySection;
  testimonials: TestimonialsSection;
  appointment: AppointmentSection;
  contact: ContactSection;
  diseases: DiseasesContent;
};