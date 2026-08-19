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
    chip: "bg-accent-yellow-soft text-accent-yellow-fg",
    dot: "bg-accent-yellow",
    bar: "bg-accent-yellow",
    fg: "text-accent-yellow",
  },
  cat: {
    chip: "bg-accent-coral-soft text-accent-coral-fg",
    dot: "bg-accent-coral",
    bar: "bg-accent-coral",
    fg: "text-accent-coral",
  },
  bird: {
    chip: "bg-accent-green-soft text-accent-green-fg",
    dot: "bg-accent-green",
    bar: "bg-accent-green",
    fg: "text-accent-green",
  },
  exotic: {
    chip: "bg-accent-lavender-soft text-accent-lavender-fg",
    dot: "bg-accent-lavender",
    bar: "bg-accent-lavender",
    fg: "text-accent-lavender",
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
  yellow: {
    chip: "bg-accent-yellow-soft text-accent-yellow-fg",
    dot: "bg-accent-yellow",
    bar: "bg-accent-yellow",
    edge: "border-accent-yellow",
    fg: "text-accent-yellow",
  },
  coral: {
    chip: "bg-accent-coral-soft text-accent-coral-fg",
    dot: "bg-accent-coral",
    bar: "bg-accent-coral",
    edge: "border-accent-coral",
    fg: "text-accent-coral",
  },
  green: {
    chip: "bg-accent-green-soft text-accent-green-fg",
    dot: "bg-accent-green",
    bar: "bg-accent-green",
    edge: "border-accent-green",
    fg: "text-accent-green",
  },
  lavender: {
    chip: "bg-accent-lavender-soft text-accent-lavender-fg",
    dot: "bg-accent-lavender",
    bar: "bg-accent-lavender",
    edge: "border-accent-lavender",
    fg: "text-accent-lavender",
  },
};

export type FacilityAccentKey = "surgery" | "icu" | "lab" | "xray";

export const FACILITY_ACCENTS: Record<FacilityAccentKey, AccentClasses> = {
  surgery: {
    chip: "bg-accent-lavender-soft text-accent-lavender-fg",
    dot: "bg-accent-lavender",
    bar: "bg-accent-lavender",
    fg: "text-accent-lavender",
  },
  icu: {
    chip: "bg-accent-coral-soft text-accent-coral-fg",
    dot: "bg-accent-coral",
    bar: "bg-accent-coral",
    fg: "text-accent-coral",
  },
  lab: {
    chip: "bg-accent-green-soft text-accent-green-fg",
    dot: "bg-accent-green",
    bar: "bg-accent-green",
    fg: "text-accent-green",
  },
  xray: {
    chip: "bg-accent-yellow-soft text-accent-yellow-fg",
    dot: "bg-accent-yellow",
    bar: "bg-accent-yellow",
    fg: "text-accent-yellow",
  },
};

export const WHY_STEP_ACCENTS: Record<number, AccentClasses> = {
  0: {
    chip: "bg-accent-yellow-soft text-accent-yellow-fg",
    dot: "bg-accent-yellow",
    bar: "bg-accent-yellow",
    fg: "text-accent-yellow",
  },
  1: {
    chip: "bg-accent-coral-soft text-accent-coral-fg",
    dot: "bg-accent-coral",
    bar: "bg-accent-coral",
    fg: "text-accent-coral",
  },
  2: {
    chip: "bg-accent-green-soft text-accent-green-fg",
    dot: "bg-accent-green",
    bar: "bg-accent-green",
    fg: "text-accent-green",
  },
  3: {
    chip: "bg-accent-lavender-soft text-accent-lavender-fg",
    dot: "bg-accent-lavender",
    bar: "bg-accent-lavender",
    fg: "text-accent-lavender",
  },
};

export const ABOUT_CARD_ACCENTS: Record<number, AccentClasses> = {
  0: {
    chip: "bg-accent-yellow-soft text-accent-yellow-fg",
    dot: "bg-accent-yellow",
    bar: "bg-accent-yellow",
    fg: "text-accent-yellow",
  },
  1: {
    chip: "bg-accent-coral-soft text-accent-coral-fg",
    dot: "bg-accent-coral",
    bar: "bg-accent-coral",
    fg: "text-accent-coral",
  },
  2: {
    chip: "bg-accent-green-soft text-accent-green-fg",
    dot: "bg-accent-green",
    bar: "bg-accent-green",
    fg: "text-accent-green",
  },
};