import type { AnimalCategory } from "@/lib/content";
import type { Service } from "@/lib/content";

/**
 * Per-category / per-service accent classes (home.md §7.5 / §7.6).
 * Literal class strings so Tailwind emits them. Shared between the desktop
 * and mobile variants of the sections so both speak the same color language.
 */

export type AccentClasses = { chip: string; dot: string; bar: string; fg: string };

export const ANIMAL_ACCENTS: Record<AnimalCategory["key"], AccentClasses> = {
  dog: {
    chip: "bg-accent-purple-soft text-accent-purple-fg",
    dot: "bg-accent-purple",
    bar: "bg-accent-purple",
    fg: "text-accent-purple",
  },
  cat: {
    chip: "bg-accent-orange-soft text-accent-orange-fg",
    dot: "bg-accent-orange",
    bar: "bg-accent-orange",
    fg: "text-accent-orange",
  },
  bird: {
    chip: "bg-accent-lime-soft text-accent-lime-fg",
    dot: "bg-accent-lime",
    bar: "bg-accent-lime",
    fg: "text-accent-lime",
  },
  exotic: {
    chip: "bg-accent-magenta-soft text-accent-magenta-fg",
    dot: "bg-accent-magenta",
    bar: "bg-accent-magenta",
    fg: "text-accent-magenta",
  },
  other: {
    chip: "bg-accent-soft text-accent-soft-fg",
    dot: "bg-accent",
    bar: "bg-accent",
    fg: "text-accent",
  },
};

export type ServiceAccentClasses = AccentClasses & {
  edge: string;
  fg: string;
};

export const SERVICE_ACCENTS: Record<Service["accent"], ServiceAccentClasses> = {
  purple: {
    chip: "bg-accent-purple-soft text-accent-purple-fg",
    dot: "bg-accent-purple",
    bar: "bg-accent-purple",
    edge: "border-accent-purple",
    fg: "text-accent-purple",
  },
  orange: {
    chip: "bg-accent-orange-soft text-accent-orange-fg",
    dot: "bg-accent-orange",
    bar: "bg-accent-orange",
    edge: "border-accent-orange",
    fg: "text-accent-orange",
  },
  lime: {
    chip: "bg-accent-lime-soft text-accent-lime-fg",
    dot: "bg-accent-lime",
    bar: "bg-accent-lime",
    edge: "border-accent-lime",
    fg: "text-accent-lime",
  },
  magenta: {
    chip: "bg-accent-magenta-soft text-accent-magenta-fg",
    dot: "bg-accent-magenta",
    bar: "bg-accent-magenta",
    edge: "border-accent-magenta",
    fg: "text-accent-magenta",
  },
};

export type FacilityAccentKey = "surgery" | "icu" | "lab" | "xray";

export const FACILITY_ACCENTS: Record<FacilityAccentKey, AccentClasses> = {
  surgery: {
    chip: "bg-accent-purple-soft text-accent-purple-fg",
    dot: "bg-accent-purple",
    bar: "bg-accent-purple",
    fg: "text-accent-purple",
  },
  icu: {
    chip: "bg-accent-magenta-soft text-accent-magenta-fg",
    dot: "bg-accent-magenta",
    bar: "bg-accent-magenta",
    fg: "text-accent-magenta",
  },
  lab: {
    chip: "bg-accent-lime-soft text-accent-lime-fg",
    dot: "bg-accent-lime",
    bar: "bg-accent-lime",
    fg: "text-accent-lime",
  },
  xray: {
    chip: "bg-accent-orange-soft text-accent-orange-fg",
    dot: "bg-accent-orange",
    bar: "bg-accent-orange",
    fg: "text-accent-orange",
  },
};

export const WHY_STEP_ACCENTS: Record<number, AccentClasses> = {
  0: {
    chip: "bg-accent-purple-soft text-accent-purple-fg",
    dot: "bg-accent-purple",
    bar: "bg-accent-purple",
    fg: "text-accent-purple",
  },
  1: {
    chip: "bg-accent-orange-soft text-accent-orange-fg",
    dot: "bg-accent-orange",
    bar: "bg-accent-orange",
    fg: "text-accent-orange",
  },
  2: {
    chip: "bg-accent-lime-soft text-accent-lime-fg",
    dot: "bg-accent-lime",
    bar: "bg-accent-lime",
    fg: "text-accent-lime",
  },
  3: {
    chip: "bg-accent-magenta-soft text-accent-magenta-fg",
    dot: "bg-accent-magenta",
    bar: "bg-accent-magenta",
    fg: "text-accent-magenta",
  },
};

export const ABOUT_CARD_ACCENTS: Record<number, AccentClasses> = {
  0: {
    chip: "bg-accent-purple-soft text-accent-purple-fg",
    dot: "bg-accent-purple",
    bar: "bg-accent-purple",
    fg: "text-accent-purple",
  },
  1: {
    chip: "bg-accent-orange-soft text-accent-orange-fg",
    dot: "bg-accent-orange",
    bar: "bg-accent-orange",
    fg: "text-accent-orange",
  },
  2: {
    chip: "bg-accent-lime-soft text-accent-lime-fg",
    dot: "bg-accent-lime",
    bar: "bg-accent-lime",
    fg: "text-accent-lime",
  },
};