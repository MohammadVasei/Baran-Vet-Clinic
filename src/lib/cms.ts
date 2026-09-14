/**
 * Server-only CMS data layer (Phase 7).
 *
 * Reconstructs the public-site content snapshot (previously hardcoded in
 * src/lib/content.ts + src/lib/diseases-content.ts) from Supabase:
 *   - site_content  (JSONB)            -> section copy + clinic info
 *   - services                        -> presentation columns -> Service[]
 *   - doctors                         -> presentation columns -> Doctor[]
 *   - diseases                        -> grouped educational articles
 *   - testimonials                    -> quoted feedback cards
 *
 * Access pattern ("previous model" — no cacheComponents in next.config.ts):
 *   unstable_cache(..., { revalidate: 300, tags: [ ... ] })
 * Admin mutations fire POST /api/revalidate (tagged) so saves appear quickly;
 * otherwise any page gets a fresh snapshot every 5 minutes.
 *
 * IMPORTANT: placeholders rows (seed/TEST data, or extra services created in
 * the DB before their presentation columns existed) are filtered out by
 * requiring the CMS presentation fields to be present. This keeps the public
 * site identical to the old static snapshot while booking/admin rows that
 * matter internally stay in the database (just hidden publicly).
 */
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type {
  CmsContent,
  SiteContentRow,
  Service,
  ServiceAccent,
  Doctor,
  TestimonialItem,
  AnimalDiseases,
  DiseaseCategory,
  Disease,
} from "@/lib/content-types";

export const CMS_TAGS = {
  site: "cms:site",
  services: "cms:services",
  doctors: "cms:doctors",
  diseases: "cms:diseases",
  testimonials: "cms:testimonials",
} as const;

export const ALL_CMS_TAGS = Object.values(CMS_TAGS);

type ContentRowLike = { key: string; data: unknown };

function pick(rows: ContentRowLike[] | null | undefined, key: string): Record<string, unknown> | null {
  const row = rows?.find((r) => r.key === key);
  if (!row) return null;
  return (row.data ?? null) as Record<string, unknown> | null;
}

type Min = { eyebrow: string; headline: string[]; intro: string };

const emptyMin = (): Min => ({ eyebrow: "", headline: [], intro: "" });

const fallbackClinic = () => ({ name: "", brand: "باران", tagline: "", phone: "", phoneHref: "", mobile1: "", mobile1Href: "", mobile1WhatsApp: "", mobile2: "", mobile2Href: "", mobile2WhatsApp: "", email: "", address: "", addressShort: "", hours: [], hoursNote: "", instagram: "", instagramUrl: "", threads: "", threadsUrl: "" });

function sectionMin(row: unknown, min: Min = emptyMin()): Min {
  if (!row || typeof row !== "object") return min;
  const r = row as Record<string, unknown>;
  return {
    eyebrow: typeof r.eyebrow === "string" ? r.eyebrow : min.eyebrow,
    headline: Array.isArray(r.headline) ? (r.headline as string[]) : min.headline,
    intro: typeof r.intro === "string" ? r.intro : min.intro,
  };
}

/* ------------------------------------------------------------------ */
/* Loaders                                                             */
/* ------------------------------------------------------------------ */

type DbService = {
  key: string | null;
  name: string | null;
  description: string | null;
  tagline: string | null;
  title: string | null;
  image: string | null;
  alt: string | null;
  accent: string | null;
  numeral: string | null;
  href: string | null;
  display_order: number | null;
};

type DbDoctor = {
  key: string | null;
  name: string | null;
  role: string | null;
  image: string | null;
  alt: string | null;
  slug: string | null;
  education: string[] | null;
  experience: string | null;
  bio: string | null;
  focus_areas: string[] | null;
  clinic_role: string | null;
  display_order: number | null;
};

type DbDisease = {
  animal_type: string;
  category: string;
  name: string;
  symptoms: string;
  care: string;
  display_order: number | null;
};

type DbTestimonial = {
  name: string | null;
  quote: string | null;
  pet_note: string | null;
  animal_type: string | null;
  display_order: number | null;
};

function toServices(rows: DbService[], sectionRow: unknown): CmsContent["services"] {
  const items: Service[] = (rows ?? [])
    .filter(
      (r) =>
        r.name &&
        r.accent &&
        r.image &&
        r.tagline &&
        r.href &&
        r.numeral &&
        ["purple", "orange", "lime", "magenta"].includes(r.accent)
    )
    .map((r) => ({
      key: r.key ?? "",
      numeral: r.numeral ?? "",
      name: r.name!,
      tagline: r.tagline!,
      title: r.title ?? r.tagline!,
      text: r.description ?? "",
      image: r.image!,
      alt: r.alt ?? r.name!,
      accent: r.accent as ServiceAccent,
      href: r.href!,
    }));
  return { ...sectionMin(sectionRow), items };
}

function toDoctors(rows: DbDoctor[], sectionRow: unknown): CmsContent["doctors"] {
  const items: Doctor[] = (rows ?? [])
    .filter((r) => r.name && r.role && r.image && r.slug && r.bio)
    .map((r) => ({
      key: r.key ?? "",
      name: r.name!,
      role: r.role!,
      image: r.image!,
      alt: r.alt ?? r.name!,
      slug: r.slug!,
      education: r.education ?? [],
      experience: r.experience ?? "",
      bio: r.bio ?? "",
      focusAreas: r.focus_areas ?? [],
      clinicRole: r.clinic_role ?? "",
    }));
  return { ...sectionMin(sectionRow), items };
}

function toDiseases(
  rows: DbDisease[],
  groupsMeta: unknown,
  generalAdvice: string[] | null,
  disclaimerRow: unknown
): CmsContent["diseases"] {
  const metaGroups = Array.isArray(groupsMeta) ? (groupsMeta as Record<string, unknown>[]) : [];
  const list = rows ?? [];

  const groups: AnimalDiseases[] = metaGroups
    .filter((g) => typeof g.key === "string")
    .map((g) => {
      const key = g.key as AnimalDiseases["key"];
      const diseases: Disease[] = list
        .filter((d) => d.animal_type === key)
        .map((d) => ({
          name: d.name,
          symptoms: d.symptoms,
          care: d.care,
          category: (d.category === "chronic" ? "chronic" : "infectious") as DiseaseCategory,
        }));
      return {
        key,
        label: (g.label as string) ?? key,
        accent: (g.accent as AnimalDiseases["accent"]) ?? key,
        image: (g.image as string) ?? "",
        alt: (g.alt as string) ?? "",
        diseases,
      };
    })
    .filter((g) => ["dog", "cat", "bird", "exotic", "other"].includes(g.key));

  const d = disclaimerRow as Record<string, unknown> | null;
  return {
    groups,
    generalAdvice: generalAdvice ?? [],
    disclaimer: {
      title: (d?.title as string) ?? "",
      text: (d?.text as string) ?? "",
    },
  };
}

function toTestimonials(rows: DbTestimonial[], sectionRow: unknown): CmsContent["testimonials"] {
  const items: TestimonialItem[] = (rows ?? [])
    .filter((r) => r.name && r.quote)
    .map((r, i) => ({
      id: i + 1,
      name: r.name!,
      pet: r.pet_note ?? "",
      content: r.quote!,
      species: (r.animal_type === "cat" ? "cat" : "dog") as "dog" | "cat",
    }));
  return { ...sectionMin(sectionRow), items };
}

async function loadContent(): Promise<CmsContent> {
  const [siteRes, servicesRes, doctorsRes, diseasesRes, testimonialsRes] =
    await Promise.all([
      supabaseAdmin.from("site_content").select("key,data"),
      supabaseAdmin
        .from("services")
        .select(
          "key,name,description,tagline,title,image,alt,accent,numeral,href,display_order"
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
      supabaseAdmin
        .from("doctors")
        .select(
          "key,name,role,image,alt,slug,education,experience,bio,focus_areas,clinic_role,display_order"
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
      supabaseAdmin
        .from("diseases")
        .select("animal_type,category,name,symptoms,care,display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
      supabaseAdmin
        .from("testimonials")
        .select("name,quote,pet_note,animal_type,display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
    ]);

  // Handle errors gracefully to avoid crashing the app
  if (siteRes.error) {
    console.warn("CMS site_content error:", siteRes.error);
  }
  const siteRows = siteRes.error ? [] : (siteRes.data ?? []);
  const rows = siteRows as unknown as SiteContentRow[];
  const clinicRow = pick(rows, "clinic");
  const clinic = { ...fallbackClinic(), ...(clinicRow ?? {}) } as CmsContent["clinic"];

  const aboutRow = pick(rows, "about");
  const whyRow = pick(rows, "why");
  const animalsRow = pick(rows, "animals");
  const marqueeRow = pick(rows, "marquee");
  const facilitiesRow = pick(rows, "facilities");
  const emergencyRow = pick(rows, "emergency");
  const appointmentRow = pick(rows, "appointment");
  const contactRow = pick(rows, "contact");

  const about = aboutRow
    ? { ...aboutRow, image: (aboutRow.image as { src?: string; alt?: string; [k: string]: unknown } | null) ?? { src: "", alt: "" } } as CmsContent["about"]
    : { eyebrow: "", statement: [], body: "", signature: "", image: { src: "", alt: "" } };

  const why = whyRow
    ? { ...whyRow, steps: Array.isArray(whyRow.steps) ? whyRow.steps : [], image: (whyRow.image as { src?: string; alt?: string } | null) ?? { src: "", alt: "" } } as CmsContent["why"]
    : { eyebrow: "", headline: [], intro: "", steps: [], image: { src: "", alt: "" } };

  const animals = {
    ...sectionMin(animalsRow),
    categories: Array.isArray(animalsRow?.categories) ? (animalsRow.categories as CmsContent["animals"]["categories"]) : [],
  };

  const marquee =
    marqueeRow && typeof marqueeRow.label === "string"
      ? ({ label: marqueeRow.label, items: Array.isArray(marqueeRow.items) ? marqueeRow.items : [] } as CmsContent["marquee"])
      : { label: "", items: [] };

  const facilities = {
    ...sectionMin(facilitiesRow),
    items: Array.isArray(facilitiesRow?.items) ? (facilitiesRow.items as CmsContent["facilities"]["items"]) : [],
  };

  const emergency = emergencyRow
  ? { ...emergencyRow }
  : ({
      eyebrow: "",
      headline: [],
      intro: "",
      phone: "",
      mobile1: "",
      mobile2: "",
      hours: [],
      hoursNote: "",
      phoneHref: "",
      mobile1Href: "",
      mobile1WhatsApp: "",
      mobile2Href: "",
      mobile2WhatsApp: "",
    } as CmsContent["emergency"]);

  const appointment = {
    ...sectionMin(appointmentRow),
    note: typeof appointmentRow?.note === "string" ? appointmentRow.note : "",
    steps: Array.isArray(appointmentRow?.steps) ? appointmentRow.steps : [],
    timeSlots: Array.isArray(appointmentRow?.timeSlots) ? appointmentRow.timeSlots : [],
  } as CmsContent["appointment"];

  const contact = contactRow
  ? { ...contactRow }
  : ({
      eyebrow: "",
      headline: [],
      intro: "",
      phones: [],
      socials: [],
      address: "",
      hours: [],
      hoursNote: "",
      finalMessage: "",
    } as CmsContent["contact"]);

  // Handle errors for other queries
  const servicesData = servicesRes.error ? [] : (servicesRes.data ?? []);
  const doctorsData = doctorsRes.error ? [] : (doctorsRes.data ?? []);
  const diseasesData = diseasesRes.error ? [] : (diseasesRes.data ?? []);
  const testimonialsData = testimonialsRes.error ? [] : (testimonialsRes.data ?? []);

let services = toServices(
     servicesData as unknown as DbService[],
     pick(rows, "services_section")
   );
   let doctors = toDoctors(doctorsData as unknown as DbDoctor[], pick(rows, "doctors_section"));
   let testimonials = toTestimonials(
     testimonialsData as unknown as DbTestimonial[],
     pick(rows, "testimonials_section")
   );
   const diseases = toDiseases(
     diseasesData as unknown as DbDisease[],
     pick(rows, "diseases_groups"),
     (pick(rows, "general_advice") as unknown as string[]) ?? null,
     pick(rows, "disclaimer")
   );

   // Provide fallback items if arrays are empty to prevent UI errors
   if (services.items.length === 0) {
     services = {
       ...services,
       items: [
         {
           key: "fallback-service",
           numeral: "01",
           name: "Fallback Service",
           tagline: "Professional veterinary care",
           title: "Fallback Service",
           text: "We provide comprehensive veterinary services for your pets.",
           image: "/fallback-service.jpg",
           alt: "Fallback service",
           accent: "purple" as ServiceAccent,
           href: "/services",
         },
       ],
     };
   }

   if (doctors.items.length === 0) {
     doctors = {
       ...doctors,
       items: [
         {
           key: "fallback-doctor",
           name: "Dr. Fallback",
           role: "Veterinarian",
           image: "/fallback-doctor.jpg",
           alt: "Fallback doctor",
           slug: "fallback-doctor",
           education: ["DVM"],
           experience: "10 years",
           bio: "Experienced veterinarian passionate about animal care.",
           focusAreas: ["Surgery", "Medicine"],
           clinicRole: "Owner",
         },
       ],
     };
   }

   if (testimonials.items.length === 0) {
     testimonials = {
       ...testimonials,
       items: [
         {
           id: 1,
           name: "Happy Client",
           pet: "Golden Retriever",
           content: "Excellent service and caring staff!",
           species: "dog",
         },
       ],
     };
   }

  return {
    clinic,
    about,
    why,
    animals,
    marquee,
    services,
    facilities,
    doctors,
    emergency,
    testimonials,
appointment,
     contact,
     diseases,
   };
 }
// Trigger rebuild after fix

export const getCmsData = unstable_cache(loadContent, ["cms-snapshot"], {
  revalidate: 300,
  tags: ALL_CMS_TAGS,
});