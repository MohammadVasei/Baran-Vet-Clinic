# Homepage — Design Override (overrides MASTER.md)

Homepage-specific art direction for Baran Vet Clinic. Rules here replace the
Master file for this page only.

## Composition

- **Editorial hero (WOW 01):** full-bleed, asymmetric. Persian headline split
  into display lines; large dog image with clip-path curtain reveal; floating
  cat card; metadata row (hours / emergency / location); CTA pair; scroll
  indicator. Subject: **dog + cat** (brand embraces both).
- **Marquee strip (7.2):** RTL-first horizontal drift, token borders, strong
  top/bottom hairlines.
- **Who we are (7.3):** split-text statement + parallax editorial image.
- **Why Baran (7.4):** the process of care — calm, medical, numbered steps
  with a supporting image (no card-grid fatigue).
- **Animal experience (WOW 02, 7.5):** category explorer (سگ، گربه،
  پرندگان، اگزوتیک، سایر). One image + one accent color swap per category;
  cross-fade on change.
- **Services (WOW 03, 7.6):** viewport-filling interactive list. Hover/select
  swaps a large panel image + description + accent. Data from `lib/content.ts`.
- **Facilities cinematic (WOW 04, 7.7):** pinned ScrollTrigger + scrub with
  clip-path reveals across full-bleed facility images.
- **Doctors (7.8):** editorial portraits, hover metadata, role-only labels,
  links to future `/doctors/[slug]`.
- **Emergency (7.9):** calm urgency — high contrast, direct actions, phone
  emphasis (destructive tokens).
- **Trust / social proof (7.10):** restrained, no fabricated claims; clearly
  placeholder.
- **AppointmentCTA (WOW 05, 7.11):** single-screen flow
  (service → animal → date → contact → confirmation), booking-API-ready,
  a11y states in both themes.

## Section order (as above)

Keyed to header anchors: `#top`, `#about`, `#services`, `#patients`,
`#doctors`, `#appointment`, `#contact`.

## Category accents (consumed in 7.5 / 7.6)

| Category | Accent |
|----------|--------|
| سگ | `--accent-yellow` |
| گربه | `--accent-coral` |
| پرندگان | `--accent-green` |
| اگزوتیک | `--accent-lavender` |
| سایر | `--accent` (green) |

## Notes

- No emojis as icons; all SVG (Heroicons-style) from `src/components/icons.tsx`.
- Every "big" WOW moment keeps a reduced-motion path (animation skipped,
  content stays visible).
- Numerals via Estedad (`font-label`); display via Vazirmatn (`font-display`).