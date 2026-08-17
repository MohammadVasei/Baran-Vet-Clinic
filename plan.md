# BARAN VET CLINIC — Step-by-Step Agent Implementation Plan

## Confirmed decisions
- **Scope:** Homepage only, exceptional quality; other routes scaffold-ready.
- **Content:** Realistic Persian placeholders, marked `// TODO: real data`; nothing fabricated.
- **Images:** Curated license-cleared editorial stock → `public/images/`, via `next/image`.
- **Styling:** Tailwind v4 utilities + CSS custom-property tokens + custom editorial CSS.
- **Theming:** **Light + dark mode, following system** (`prefers-color-scheme`), no manual toggle, pure CSS tokens, `color-scheme: light dark`, zero hydration flash.
- **Motion:** GSAP + `@gsap/react` + ScrollTrigger + SplitText (all in `gsap` package).
- **Hero subject:** dog + cat (brand emphasizes both).

---

## WORKFLOW PROTOCOL (applies to every step)

The implementing agent MUST follow this cycle for each step and each phase:

1. **TODO list** — Before starting, create a todolist (via `todowrite`) with all tasks for that step, marking the first task `in_progress`.
2. **Execute** — Perform each task; update `in_progress`/`completed` in real time as work proceeds.
3. **Verify** — Run the step's verification gate (commands/checks listed below). Fix failures; re-verify until green. Never mark a todo `completed` on intent — only after verification passes.
4. **Log** — Append a dated entry to `IMPLEMENTATION_LOG.md` at the project root: step number, what was done, files created/changed, verification results, any deviations/decisions, and open issues.
5. **Confirm** — Report the step's summary + verification results to the user and **stop**, asking explicit confirmation before starting the next step or phase. Do NOT continue automatically.

`IMPLEMENTATION_LOG.md` is created in Step 0 with a header and a table of contents; each step appends a section. The plan below lists each step's required todolist items and its verification gate.

---

## STEP 0 — Skill loads, re-verify, log setup
- **Todolist:** load 9 skills (`gsap-react`, `gsap-scrolltrigger`, `gsap-core`, `gsap-timeline`, `gsap-plugins`, `gsap-performance`, `ui-ux-pro-max`, `design-system`, `ui-styling`); confirm empty app dir; create `IMPLEMENTATION_LOG.md`.
- **Verify:** each skill loads without error; `IMPLEMENTATION_LOG.md` exists with header + ToC.
- **Log + STOP → confirm before Step 1.**

## STEP 1 — Scaffold Next.js project
- **Todolist:** `create-next-app` (TS, App Router, Tailwind v4, `src/`, ESLint) in project root; `npm install gsap @gsap/react`; `git init`; log.
- **Verify:** `npm run dev` renders default page; `npm run build` passes; `.opencode/` untouched.
- **Log + STOP → confirm before Step 2.**

## STEP 2 — Design authority via UI/UX Pro Max
- **Todolist:** run `--design-system --persist -p "Baran Vet Clinic" --motion 7`; run `--domain ux "dark mode contrast"`, `--stack nextjs`, `--domain gsap "scroll reveal stagger"`; capture outputs into `design-system/MASTER.md`.
- **Verify:** `design-system/MASTER.md` exists and contains color/typography/gsap recommendations; scripts exit 0.
- **Log + STOP → confirm before Step 3.**

## STEP 3 — Design system & dual-mode tokens
- **Todolist:** primitive → semantic → component color tokens (light `:root` + `@media (prefers-color-scheme: dark)` block, same semantic names); typography tokens; spacing; radius; `color-scheme: light dark`; run `validate-tokens.cjs`.
- **Verify:** `npm run build` passes; tokens validated (no hardcoded hex in components); both theme blocks present.
- **Log + STOP → confirm before Step 4.**

## STEP 4 — Fonts (self-hosted)
- **Todolist:** Vazirmatn + Estedad via `next/font/google` in `layout.tsx`; wire CSS variables; type scale applied.
- **Verify:** no external font stylesheet in network tab; Persian glyphs render; build passes.
- **Log + STOP → confirm before Step 5.**

## STEP 5 — App shell (RTL, theming, preloader, header, footer, emergency)
- **Todolist:** `layout.tsx` (`lang="fa" dir="rtl"`, metadata, `color-scheme`); `globals.css` base + focus rings + reduced-motion base; `Preloader`; `Header`; `MobileMenu`; `Footer`; `EmergencyBar`; placeholder content marked.
- **Verify:** build passes; `<html dir="rtl">` verified; preloader <0.9s; menu keyboard/ESC/`aria-expanded` work; header/footer correct in both light+dark; no console/hydration errors.
- **Log + STOP → confirm before Step 6.**

## STEP 6 — Shared motion system (`lib/`, hooks)
- **Todolist:** `lib/gsap.ts` register plugins; `lib/motion.ts` helpers (`revealUp`, `splitLines`, `fadeMask`, scroll defaults); `Reveal` component; `useReducedMotion` hook.
- **Verify:** GSAP only runs client-side (no SSR calls); `useGSAP` used with `scope`; cleanup on unmount; reduced-motion → duration 0; animations reference CSS vars (no hex in JS).
- **Log + STOP → confirm before Step 7.**

## STEP 7 — Homepage sections (build sequentially, each as its own step sub-cycle)
**Create one todolist per section; verify; log; and request confirmation after EVERY section (sub-step) — or batch 2–3 per confirmation only if the user approves batching.**

- **7.1 Hero (WOW 01):** type split-lines reveal, image clip-path reveal, drift, metadata, CTA, scroll indicator; cinematic easing. Verify: sequence plays, RTL-correct, both themes, reduced-motion OK, build passes. **Log + STOP → confirm.**
- **7.2 Marquee strip:** RTL (right-to-left) motion, both-theme borders. **Log + STOP → confirm.**
- **7.3 Who we are:** split-text reveal + parallax image. **Log + STOP → confirm.**
- **7.4 Why Baran:** medical credibility story (process of care). **Log + STOP → confirm.**
- **7.5 Animal experience (WOW 02):** سگ/گربه/پرندگان/اگزوتیک/سایر explorer; category cross-fade + accent swap. **Log + STOP → confirm.**
- **7.6 Services (WOW 03):** viewport-filling interactive list, hover/select swaps image+description+accent; data-driven from `lib/content.ts`. **Log + STOP → confirm.**
- **7.7 Facilities cinematic (WOW 04):** pinned ScrollTrigger + scrub + clip-path reveals. **Log + STOP → confirm.**
- **7.8 Doctors editorial:** portraits, hover metadata, link to future slug route; roles only. **Log + STOP → confirm.**
- **7.9 Emergency section:** calm/urgent, high contrast, direct actions. **Log + STOP → confirm.**
- **7.10 Trust / social proof:** restrained, marked. **Log + STOP → confirm.**
- **7.11 AppointmentCTA (WOW 05):** single-screen flow (service → animal → date → contact → confirmation); booking-API-ready; a11y states in both themes. **Log + STOP → confirm.**

## STEP 8 — Mobile-specific pass
- **Todolist:** mobile type scale/spacing/crops (375/390/430/768); hover → tap/reveal; touch targets ≥44px; mobile WOW moments retained.
- **Verify:** layout correct at 375/390/430/768/1024/1280/1440/1728/1920; no overflow; build passes.
- **Log + STOP → confirm before Step 9.**

## STEP 9 — Micro-interactions & page transitions
- **Todolist:** `MagneticButton` (desktop-only); link underline/arrow reveals (RTL-flipped); card/image hover; layered blue/white page transition (400–600ms) wired for future routes.
- **Verify:** interactions don't break touch devices; transitions don't slow navigation; both themes; build passes.
- **Log + STOP → confirm before Step 10.**

## STEP 10 — Performance
- **Todolist:** `next/image` (hero priority, `fetchPriority`, correct sizes, lazy elsewhere); bundle audit (client islands at leaves); GSAP perf (transforms/opacity, no thrash, cleanup); `contain`/`content-visibility` where safe.
- **Verify:** `npm run build` clean; no console/hydration errors; Lighthouse/CWV check on local; no layout shift on load; fonts/images optimized.
- **Log + STOP → confirm before Step 11.**

## STEP 11 — SEO (Persian)
- **Todolist:** layout metadata + title template + `metadataBase`; homepage description/OG/canonical; `sitemap.ts`; `robots.ts`; `VeterinaryCare`/`MedicalClinic` JSON-LD (true fields only); natural Persian keywords.
- **Verify:** `npm run build` passes; generated `sitemap.xml`/`robots.txt` at `/`; meta tags present in HTML; no keyword stuffing.
- **Log + STOP → confirm before Step 12.**

## STEP 12 — Accessibility + RTL QA
- **Todolist:** keyboard nav end-to-end; focus rings both themes; skip-link; contrast ≥4.5:1 (light+dark independently); semantic headings/alt/labels; `aria-expanded`; RTL audit (icons/arrows/marquee/reveals/transforms/forms/carousels); reduced-motion verified.
- **Verify:** axe/DevTools audit clean (or documented exceptions); RTL checklist all green; build passes.
- **Log + STOP → confirm before Step 13.**

## STEP 13 — Self-critique loop (mandatory, iterate twice)
- **Todolist:** capture desktop+mobile screenshots in light+dark; evaluate against the 10 critique questions (world-class? template-like? typography? art direction? credibility? playful-not-childish? purposeful motion? whitespace? works without photography? too generic?); redesign weakest 20%; re-verify.
- **Verify:** `npm run build` + dev run green after redesign; screenshots re-captured.
- **Log + STOP → confirm before Step 14.**

## STEP 14 — Final verification
- **Todolist:** full checklist (build, no type/console/hydration errors, no broken links/images, both themes from system setting without flash, RTL/motion/a11y/performance/UX passes, placeholders marked, architecture ready for real data + future routes).
- **Verify:** all checklist items; `IMPLEMENTATION_LOG.md` complete with final summary.
- **Log + final report + STOP → request final confirmation.**

---

## Logging rules (agent MUST)
- Every step appends to `IMPLEMENTATION_LOG.md`: date/time, step, todos status, files changed, verification output, decisions/deviations, open issues.
- Any unexpected behavior or failure is logged verbatim with the error, plus the fix applied.
- No step may begin until the previous step's log exists and the user has given explicit confirmation.

## State at plan end
- Homepage complete in both themes, RTL, accessible, performant, SEO-ready.
- `IMPLEMENTATION_LOG.md` documents the full build.
- Placeholder content clearly marked; architecture ready for real clinic data and future routes.
