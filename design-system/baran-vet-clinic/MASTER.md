# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Baran Vet Clinic
**Generated:** 2026-08-16 12:10:37
**Category:** Healthcare App
**Design Dials:** Motion 7/10 (Standard)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#0891B2` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#22D3EE` | `--color-secondary` |
| Accent/CTA | `#059669` | `--color-accent` |
| Background | `#ECFEFF` | `--color-background` |
| Foreground | `#164E63` | `--color-foreground` |
| Muted | `#E8F1F6` | `--color-muted` |
| Border | `#A5F3FC` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#0891B2` | `--color-ring` |

**Color Notes:** Calm cyan + health green

### Typography

- **Heading Font:** Lexend
- **Body Font:** Source Sans 3
- **Mood:** corporate, trustworthy, accessible, readable, professional, clean
- **Google Fonts:** [Lexend + Source Sans 3](https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #059669;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #0891B2;
  border: 2px solid #0891B2;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #ECFEFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #0891B2;
  outline: none;
  box-shadow: 0 0 0 3px #0891B220;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Accessible & Ethical

**Keywords:** High contrast, large text (16px+), keyboard navigation, screen reader friendly, WCAG compliant, focus state, semantic

**Best For:** Government, healthcare, education, inclusive products, large audience, legal compliance, public

**Key Effects:** Clear focus rings (3-4px), ARIA labels, skip links, responsive design, reduced motion, 44x44px touch targets

### Page Pattern

**Pattern Name:** Enterprise Gateway

- **Conversion Strategy:** Path selection (I am a...). Mega menu navigation. Trust signals prominent.
- **CTA Placement:** Contact Sales (Primary) + Login (Secondary)
- **Section Order:** 1. Hero (Video/Mission), 2. Solutions by Industry, 3. Solutions by Role, 4. Client Logos, 5. Contact Sales

---

## Motion

**Stagger List** (Standard) — Trigger: load or scroll | Duration: 300-450ms | Easing: `back.out(1.4)`

```js
gsap.from('.grid-item', { opacity: 0, scale: 0.92, y: 16, duration: 0.4, stagger: { each: 0.06, from: 'start', grid: 'auto' }, ease: 'back.out(1.4)' });
```

**Framework notes:** grid: 'auto' lets GSAP infer rows/columns from a CSS grid layout for a natural wave stagger

- ✅ Combine with from: 'center' for a bento-grid layout to draw the eye inward first
- ❌ Don't use back.out on dense data tables; the overshoot reads as sloppy on informational UI
- ⚡ Group DOM writes; avoid interleaving layout reads (getBoundingClientRect) between staggered tweens

---

## Anti-Patterns (Do NOT Use)

- ❌ Bright neon colors
- ❌ Motion-heavy animations
- ❌ AI purple/pink gradients

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile

---

## Appendix A — Supplementary Searches (Step 2, UI/UX Pro Max)

Captured as design authority inputs. These refine rather than replace the Master file.

### A1. UX: dark mode contrast & accessibility (`--domain ux`)

| Issue | Rule (Do) | Avoid (Don't) |
|-------|-----------|---------------|
| Color Contrast | Min **4.5:1** for normal text | Low-contrast text (e.g. `#999` on white = 2.8:1) |
| Contrast Readability | Darker text on light backgrounds (e.g. `gray-900` on white) | Gray text on gray background |
| Alt Text | Descriptive alt for meaningful images | Missing/empty alt on content images |

Dark-mode specific (from skill rules): primary text ≥4.5:1 and secondary ≥3:1 on dark surfaces; dividers/borders and interaction states distinguishable in both themes; test dark mode contrast independently — never assume light-mode values carry over.

### A2. Stack: Next.js performance (`--stack nextjs`)

| Guideline | Do | Don't |
|-----------|----|-------|
| Avoid layout shifts | Reserve space for dynamic content (skeleton loaders, aspect ratios) | Content popping in |
| Bundle size | Use `@next/bundle-analyzer` in dev | Ship large bundles blindly |
| Code splitting | `next/dynamic()` for heavy components | Static import of everything |

### A3. GSAP motion patterns (`--domain gsap`)

**Scroll Reveal (Subtle)** — trigger: viewport enter | duration 300–400ms | ease `power1.out`
```js
gsap.from(el, { opacity: 0, y: 12, duration: 0.35, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' } });
```
- ✅ Keep y offset small (8–16px) so it reads as a fade, not a slide.
- ❌ Don't reveal below-the-fold content needed for SEO/crawlers as invisible-by-default without a no-JS fallback.
- ⚡ `toggleActions: 'play none none reverse'` avoids re-triggering on every direction change.

**Stagger List (Subtle)** — duration 250–350ms | ease `power1.out`
```js
gsap.from('.list-item', { opacity: 0, y: 8, duration: 0.3, stagger: 0.03 });
```
- ✅ Select items with stable class/data-attribute (not index) so React re-renders don't break targeting.
- ❌ Don't stagger > 0.1s per item on long lists.

**Char Split Reveal (Complex — for hero headlines only)** — duration 400–700ms | ease `expo.out`
```js
const split = new SplitText(headline, { type: 'chars' });
gsap.from(split.chars, { opacity: 0, y: 20, rotateX: -40, duration: 0.6, stagger: 0.015, ease: 'expo.out' });
```
- ✅ SplitText ships in the public `gsap` package (free since Webflow acquisition) — no license concern.
- ✅ Revert SplitText on unmount (`split.revert()`) to restore original text nodes for a11y.
- ❌ Don't split long paragraphs; reserve for short headlines (~8 words max). Splitting creates one element per char — keep to headline length only.

---

## Appendix B — Baran-Specific Evolution Direction (to apply in Step 3)

The generated palette/typography above is the *authority baseline*; the following Baran constraints refine it (recorded here so Steps 3–7 stay consistent). This is a **deliberate evolution**, not a replacement of the UI/UX Pro Max output:

1. **Brand is White + Gold** — the generated cyan/green scheme is re-tuned to a **warm anchor gold** primary (`#EFAE4B`), deeper gold text tones, and pale-gold surfaces on a warm-white canvas. Green/cyan energy is retained only as a controlled accent role.
2. **Accents are controlled moments** — soft yellow, warm coral, fresh green, lavender appear sparingly (animal categories, playful details), never as the primary visual language.
3. **Persian-first typography** — the recommended Latin fonts (Lexend/Source Sans 3) are **not used**. Instead: **Vazirmatn** (variable, body + display) and **Estedad** (numerals/labels), both via `next/font/google`. UI/UX Pro Max's DB has no Persian font data, so this is a documented supplement.
4. **Radius is intentional, not universal** — sharp (0) / subtle (4–6px) / high (999) per component purpose; no rounding-everything.
5. **Editorial grid over card grids** — asymmetric columns, large whitespace, full-bleed imagery; avoid repetitive 3-column card sections.
6. **Accessibility standard above** — the Accessible & Ethical style (WCAG AAA-leaning), 4.5:1 contrast, focus rings, reduced motion, 44px touch targets all carry forward.
7. **Explore/override flow:** `design-system/baran-vet-clinic/pages/[page].md` overrides MASTER.md when present; homepage will get a `home.md` override in Step 7.
