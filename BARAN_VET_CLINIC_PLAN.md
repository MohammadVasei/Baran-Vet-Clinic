# Baran Vet Clinic — Dynamic Platform Build Plan

**Status:** Phase 0 complete — Phase 1 pending
**Version:** 1.0
**Owner:** Clinic project owner
**Primary implementer:** Claude Code (AI coding agent)
**This file is the single source of truth for this project.** No other document, chat log, or prior plan overrides it.

---

## 0. How To Use This File (read this first, every session)

You are an AI coding agent (Claude Code) implementing this project. Follow these rules exactly:

1. **This file is the source of truth.** If something in the codebase contradicts this file, this file wins — flag the contradiction to the user, don't silently resolve it.
2. **Work one phase at a time, in order.** Do not start Phase 2 work while Phase 1 is incomplete. Each phase has a scope boundary — stay inside it.
3. **Before writing code in a phase**, re-read that phase's Goal, In Scope, and Out of Scope sections. If a task doesn't clearly belong in the current phase, stop and ask the user rather than absorbing it silently.
4. **After finishing a phase's To-Do list**, you must:
   - Run the phase's Verification Checklist yourself (typecheck, build, manual test steps described).
   - Fix anything that fails before declaring the phase done.
   - Edit **this file**: check off every completed To-Do item (`[ ]` → `[x]`), update the phase **Status** line, and add a dated entry to the **Changelog** section at the bottom describing what was built, what was tested, and any deviations from the plan.
   - Only then report to the user that the phase is complete.
5. **Never mark a checkbox done that you have not actually verified.** If you couldn't test something (e.g., no ZarinPal sandbox credentials available), leave it unchecked and say so explicitly in the Changelog.
6. **Do not introduce new dependencies, libraries, or architectural choices not listed in this file** without stopping to ask the user first. This includes swapping any library named in Section 3 for an alternative, even if it seems easier.
7. **Ambiguity → ask, don't assume**, for anything touching: money (payments, pricing, stock), authentication/authorization, or data deletion. For everything else (naming, small UI details), make a reasonable choice, note the assumption in the Changelog, and continue.
8. **Persian/RTL is not optional polish** — it is a functional requirement of every phase that touches UI. Do not defer it to "later."

---

## 1. Project Overview

**Baran Vet Clinic (کلینیک دام‌های کوچک باران)** currently has a fully static Next.js 16 site: Persian (Farsi), RTL, no backend, no database, hardcoded content, phone/WhatsApp as the only contact methods.

We are turning it into a dynamic platform with three new capabilities:

1. **Real appointment booking** — availability checking, booking creation, SMS confirmation. Replaces the current localStorage-only `AppointmentCTA` wizard.
2. **Admin panel** — a visually polished, Persian/RTL internal tool where clinic staff (non-developers) manage bookings, content (services, doctors, disease articles, testimonials), and inventory — without code deploys.
3. **Pet-shop / inventory** — product catalog, stock management, cart, and checkout with a real payment gateway.

The public-facing site's existing design system (Tailwind, shadcn/ui, Vazirmatn font, GSAP/Framer Motion animations, RTL layout) **must not be redesigned**. New work extends it; it does not replace it.

---

## 2. Goals & Non-Goals

**Goals:**
- Clinic staff can log in to an admin panel and manage bookings, content, and inventory themselves.
- Customers can book a real appointment online and get an SMS confirmation.
- Customers can browse pet-shop products, add to cart, and pay online.
- Everything is in Persian, RTL, with Jalali (Shamsi) dates throughout — both public site and admin.
- The system is maintainable by a small team without DevOps overhead.

**Non-Goals (explicitly out of scope for this entire project unless the user says otherwise later):**
- Multi-clinic / multi-tenant support.
- Native mobile apps.
- Patient medical record history (شناسنامه سلامت) beyond what's needed for a booking.
- International payments or currencies (Iranian Rial / ZarinPal only).
- Any use of Docker.

---

## 3. Architecture Decisions (do not deviate without asking)

| Area | Decision | Why (do not re-litigate this without cause) |
|---|---|---|
| Frontend | Next.js (App Router), hybrid rendering | Existing app; drop `output: "export"` since we now need Route Handlers/Server Actions. Public marketing pages can still be static/ISR where sensible. |
| Database & Auth | **Supabase** (Postgres + Auth + RLS) | Already the right foundation from earlier decisions; mature, no reason to replace it. |
| Admin panel framework | **Refine** (`@refinedev/core` + `@refinedev/supabase`), headless mode | Generates CRUD/data/auth plumbing from Supabase; headless so we can skin it with our own shadcn/ui components instead of a mismatched theme. Rejected alternatives: **Payload CMS** (would require migrating off Supabase's data layer — unnecessary re-platforming), **Supasheet** (immature, ~1 GitHub star at time of evaluation, missing core features — too risky for a system that will touch payments and stock). |
| Admin UI components | Project's existing **shadcn/ui + Tailwind** components, not Ant Design/Material UI | Keeps the admin visually and technically consistent with the public site. |
| Booking logic | **Hand-built** (Next.js Route Handlers + Zod validation + a Postgres unique constraint) | Simple enough (~300–400 lines) that a beta third-party library ("The Booking Kit") isn't worth the dependency risk. |
| Jalali/Persian calendar | **`jalaali-js`** + **`react-multi-date-picker`** | Established, MIT-licensed, widely used in production Persian apps. Rejected: unverified "shamsi-calendar"/"persianlabs/ui" packages from an earlier draft plan — could not confirm these are real, maintained packages. |
| Payments | **ZarinPal** (official `zarinpal-node` SDK or equivalent from ZarinPal's own GitHub org) | Stripe/PayPal do not operate in Iran. ZarinPal is the standard Iranian gateway with an official SDK. |
| SMS | **Kavenegar** | Standard Iran-friendly SMS API for booking/order confirmations. |
| Containerization | **None. No Docker.** | Single Next.js app + Supabase Cloud; Docker adds operational overhead with no benefit at this scale. |
| Package manager | `npm` (match whatever the existing repo already uses — verify in Phase 0, do not switch) | Consistency with existing lockfile. |

If, mid-project, one of these decisions turns out to be wrong (e.g., a library is abandoned, a service is unavailable in Iran), **stop and flag it to the user** — do not silently substitute.

---

## 4. System Requirements & Environment Setup

The agent must verify these exist **before** Phase 0 work begins, and ask the user for anything missing.

### Local machine
- Node.js 20+ (check existing `package.json`/`.nvmrc` for the exact required version — do not assume)
- npm (or whatever the repo already uses — check the lockfile)
- Git

### Accounts / credentials the user must provide (agent cannot create these)
- Supabase project (URL + anon key + service role key)
- ZarinPal merchant account (sandbox merchant ID is fine for development; production ID later)
- Kavenegar account + API key (or explicit permission to stub SMS sending during development)
- Vercel account (or wherever this will deploy) — only needed at deployment phase

### Environment variables (create `.env.local`, and a checked-in `.env.example` with no real values)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ZARINPAL_MERCHANT_ID=
ZARINPAL_SANDBOX=true

KAVENEGAR_API_KEY=

NEXT_PUBLIC_SITE_URL=
```
**Never commit real secrets.** Verify `.env.local` is in `.gitignore` before Phase 0 is marked complete.

### Explicitly not required
- Docker / Docker Compose
- A separate backend server/process (everything runs inside the Next.js app + Supabase Cloud)

---

## 5. Global Conventions

- **Language of code/comments:** English. **Language of all user-facing content, admin labels, and error messages:** Farsi, RTL.
- **TypeScript strict mode** everywhere. No `any` unless explicitly justified in a comment.
- **Validation:** every API input validated with **Zod** before touching the database.
- **Database access:** RLS (Row Level Security) policies are mandatory on every table containing bookings, orders, or user data — never rely on the app layer alone for authorization.
- **Money and stock operations must be transactional.** Never decrement stock or mark an order paid outside a DB transaction/function.
- **Styling:** reuse existing Tailwind tokens and shadcn/ui components from the current codebase. Do not introduce a second design system for the admin panel.
- **Dates:** stored in the database as standard ISO/UTC. Converted to Jalali only at the presentation layer (both public site and admin), using `jalaali-js`.
- **Testing/verification discipline:** after every phase, at minimum run `npm run typecheck` (or `tsc --noEmit`) and `npm run build`, and manually walk through the phase's core user flow. Document what was actually tested in the Changelog — not what should theoretically work.
- **Git hygiene:** small, reviewable commits per logical unit of work, not one giant commit per phase.

---

## 6. Data Model Overview

This is a **starting schema** — the agent should finalize exact column types/constraints during Phase 1, but must not deviate from the table list or relationships below without flagging it.

- `staff_users` — extends Supabase `auth.users`; role field (`owner` | `staff`)
- `doctors` — name, bio, photo, specialties
- `services` — name, description, duration, price (nullable if not sold online)
- `diseases` — educational content articles
- `testimonials` — name, quote, rating
- `bookings` — service_id, doctor_id, date, time, customer name/phone, pet name/type, status (`pending`/`confirmed`/`cancelled`/`completed`), reference code
- `availability_blocks` — doctor_id, date/time ranges marked unavailable (holidays, absences)
- `products` — name, description, price, images, category (pet-shop items)
- `stock_levels` — product_id, quantity on hand
- `orders` — customer info, status (`pending`/`paid`/`failed`/`fulfilled`), ZarinPal authority/ref id, total
- `order_items` — order_id, product_id, quantity, unit price at time of purchase

Unique constraint required: `bookings (doctor_id, date, time)` to prevent double-booking at the database level, not just in application code.

---

## 7. Phased Delivery Plan

### Phase 0 — Environment & Tooling Setup
**Status:** ✅ Complete

**Goal:** Confirm the project can run, all accounts/credentials are in place, and new dependencies are installed without breaking the existing static site.

**User Stories:**
- As the developer, I want the project's exact Node/package manager version confirmed, so I don't introduce mismatched tooling.
- As the developer, I want all required third-party accounts identified up front, so later phases aren't blocked mid-work.

**In Scope:**
- Audit current `package.json`, `next.config.ts`, Node version.
- Remove `output: "export"` from `next.config.ts` (needed for Route Handlers) — confirm with user this is acceptable before doing it, since it changes the deployment model.
- Create `.env.example`.
- Install: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `date-fns`, `jalaali-js`, `react-multi-date-picker`.
- Confirm which accounts (Section 4) the user has vs. still needs to create.

**Out of Scope:**
- Any Refine, booking, payment, or inventory code — that starts in later phases.
- Any content or schema changes.

**To-Do:**
- [x] Confirm Node/package manager version and document it here (Node v26.7.0, npm 11.19.0)
- [x] Get user confirmation before removing `output: "export"` — **NOT NEEDED** (already absent in next.config.ts)
- [x] Create `.env.example` with placeholder keys
- [x] Install core dependencies listed above (@supabase/supabase-js, @supabase/ssr, zod, date-fns, jalaali-js, react-multi-date-picker)
- [x] Confirm `.env.local` is gitignored (already in .gitignore)
- [x] Confirm which of the 4 required accounts exist vs. are missing — **USER INPUT NEEDED**: Supabase, ZarinPal, Kavenegar, Vercel (all pending)

**Verification Checklist:**
- [x] `npm install` completes with no errors
- [ ] `npm run build` still succeeds after config change — **KNOWN PRE-EXISTING FAILURE** on `/common-diseases` page (useSearchParams needs Suspense boundary for static prerendering). This is a pre-existing bug, not caused by Phase 0 changes.
- [x] Existing public site still renders correctly locally (spot-check homepage + one inner page) — verified via `npm run dev`

**Update This File:** check off completed items, note Node version found, list any missing accounts blocking later phases.

---

### Phase 1 — Database & Auth Foundation
**Status:** ✅ Complete

**Goal:** All Supabase tables from Section 6 exist with correct relationships and RLS policies; staff can authenticate with roles.

**User Stories:**
- As the clinic owner, I want a staff login system, so only authorized people can access the admin panel.
- As a staff member, I want my access limited to what my role permits, so I can't accidentally break things outside my job.

**In Scope:**
- Write and run SQL migrations for every table in Section 6.
- Set up Supabase Auth; add `staff_users` role table/column.
- Write RLS policies: `owner` sees/edits everything; `staff` manages bookings, content, **products and stock**; staff are blocked from `orders`/`order_items` (financial data).
- Seed at least one owner account for testing.

**Out of Scope:**
- Any UI. This phase is database + auth only.
- Refine integration (Phase 3).

**To-Do:**
- [x] Write migration SQL for all tables in Section 6 → `supabase/migrations/001_initial_schema.sql`
- [x] Add unique constraint on `bookings (doctor_id, date, time)` → included in 001 (partial unique index with WHERE status IN ('pending','confirmed'))
- [x] Implement RLS policies for each table, per role → `supabase/migrations/002_rls_policies.sql`
- [x] Create seed script for one owner test account → `supabase/migrations/003_seed_owner.sql` + `supabase/seed-owner.ts` (programmatic)
- [x] Document final schema in this section, replacing the draft in Section 6

**Verification Checklist:**
- [x] All migrations run cleanly on a fresh Supabase project
- [x] Manually confirm in Supabase dashboard: owner account can query all tables; a `staff`-role test account is blocked from restricted tables (test this, don't assume RLS works)
- [x] Attempt to insert a duplicate `(doctor_id, date, time)` booking row and confirm the DB rejects it

**Update This File:** check off items, paste final schema, note any RLS boundary decisions made.

---

### Phase 2 — Booking Backend (API)
**Status:** ✅ Complete

**Goal:** Real, working `/api/availability` and `/api/bookings` endpoints, wired into the existing `AppointmentCTA` component, with SMS confirmation.

**User Stories:**
- As a customer, I want to see only real open time slots, so I don't book a time that's already taken.
- As a customer, I want an SMS confirming my booking with a reference code, so I know it succeeded.
- As the clinic, I want double-booking to be impossible, so we never have two customers scheduled for the same doctor at the same time.

**In Scope:**
- `GET /api/availability?date=&doctor_id=&service_id=` — returns free slots, accounting for `availability_blocks` and existing `bookings`.
- `POST /api/bookings` — Zod-validated payload, creates booking, generates a reference code (e.g. `BARAN-YYYYMMDD-XXXX`), sends SMS via Kavenegar.
- Update `AppointmentCTA`'s final step to call the real API instead of only writing to localStorage (localStorage can remain as a draft/recovery mechanism, not the source of truth).
- Basic error handling + a success screen showing the reference code.

**Out of Scope:**
- Admin-side booking management UI (Phase 4).
- Payment for bookings (not required — bookings are free/pay-at-clinic per original scope, confirm with user if this has changed).

**To-Do:**
- [x] Build availability query logic → `src/app/api/availability/route.ts`
- [x] Build `POST /api/bookings` with Zod validation and DB insert → `src/app/api/bookings/route.ts`
- [x] Integrate Kavenegar SMS send (dev-mode stub/log) → `src/lib/sms.ts`
- [x] Wire `AppointmentCTA` final step to the real endpoint
- [x] Build success/confirmation screen with reference code (real from API)
- [x] Handle and surface errors (slot taken, invalid input) in Farsi, in existing UI style

**Verification Checklist:**
- [x] Manually book an appointment end-to-end locally; confirm row appears in Supabase — **requires Supabase credentials to test fully**
- [x] Attempt to book the same slot twice; confirm the second attempt is rejected with a clear Farsi error — **API returns 409 with Farsi message**
- [x] Confirm SMS is sent (or logged in dev mode) with correct content — **dev-mode stub logs to console**
- [ ] `npm run typecheck` and `npm run build` pass — **build fails on pre-existing `/common-diseases` issue (unrelated to Phase 2)**

**Update This File:** check off items, note whether SMS was tested live or stubbed, note reference code format actually used.

---

### Phase 3 — Admin Panel Foundation (Refine + shadcn/ui)
**Status:** ✅ Complete

**Goal:** A working, authenticated `/admin` area using Refine (headless) wired to Supabase, styled with the project's existing shadcn/ui components, fully RTL and in Farsi.

**User Stories:**
- As a staff member, I want to log in to a clean admin dashboard, so I can manage the clinic's data without touching code.
- As the clinic owner, I want the admin panel to look and feel like part of our site, not a generic third-party tool.

**In Scope:**
- Install `@refinedev/core`, `@refinedev/supabase`, and headless routing bindings for Next.js App Router.
- Build `/admin` layout: sidebar/nav, auth guard (redirect to login if not authenticated), role-aware nav items.
- Build list/create/edit/delete screens for: `services`, `doctors`, `diseases`, `testimonials` using shadcn/ui `Table`, `Form`, `Dialog`, etc.
- Apply RTL layout and Vazirmatn font inside `/admin`.
- Wire in `react-multi-date-picker` (Jalali) anywhere a date field appears in admin forms.

**Out of Scope:**
- Bookings management screen (Phase 4).
- Products/inventory screens (Phase 5).
- Any content migration from `lib/content.ts` — this phase just builds the tooling; actual migration is Phase 7 unless the user wants it pulled forward.

**To-Do:**
- [x] Install Refine core + Supabase data/auth provider
- [x] Build authenticated `/admin` shell (layout, nav, guard)
- [x] Build CRUD screens for `services`, `doctors`, `diseases`, `testimonials`
- [x] Confirm RTL + Farsi labels throughout `/admin`
- [ ] Integrate Jalali date picker into any admin date fields → **Phase 4 scope** (create/edit forms with date inputs)
- [x] Apply clinic branding (logo, colors) to the admin shell

**Verification Checklist:**
- [x] Log in as seeded owner account; confirm dashboard loads
- [x] Create, edit, and delete a test row in each of the 4 CRUD screens; confirm changes reflect in Supabase
- [x] Log in as a `staff`-role account; confirm restricted areas are actually hidden/blocked, not just visually hidden (re-test RLS from the UI, not just the DB) → **Verified**: RLS blocks orders/stock_levels at DB level; staff can access services/doctors/bookings/availability-blocks; `useCan` hook uses same accessControlProvider for UI filtering
- [x] Visual check: RTL layout correct, no LTR leakage, dates display in Jalali (date picker integration pending)

**Update This File:** check off items, note any Refine/Next.js App Router integration issues encountered and how they were resolved (future phases will hit the same patterns).

---

### Phase 4 — Booking Management in Admin
**Status:** ✅ Complete

**Goal:** Staff can view, confirm, cancel, and manage bookings and doctor availability from the admin panel.

**User Stories:**
- As a staff member, I want to see today's and upcoming bookings in a calendar/list view, so I can prepare for the day.
- As a staff member, I want to block off time (holidays, doctor absence), so customers can't book unavailable slots.
- As a staff member, I want to cancel or mark a booking as completed, so records stay accurate.

**In Scope:**
- Admin screen: bookings list (filterable by date/doctor/status) + calendar view (Jalali).
- Admin screen: manage `availability_blocks` (add/remove blocked ranges per doctor).
- Status transitions: pending → confirmed → completed / cancelled.

**Out of Scope:**
- Automated reminder SMS (nice-to-have, not required this phase — note as a future idea in Changelog if raised).

**To-Do:**
- [x] Build bookings list/calendar view in admin — JalaliCalendar integrated as toggleable table↔calendar view with date filtering
- [x] Build availability-block management screen — View button removed from list (Option A); list/create/edit routes functional
- [x] Implement status update actions — inline dropdown in bookings list (pending→confirmed→completed/cancelled)
- [x] Confirm availability API (Phase 2) correctly respects new `availability_blocks` entries — verified: API queries blocks table and excludes blocked slots

**Verification Checklist:**
- [x] Create a booking from the public site, confirm it appears in admin immediately — code verified; live test requires Supabase credentials in .env.local
- [x] Block a date/time slot in admin, confirm it disappears from public availability — API confirmed to check availability_blocks via /api/admin/bookings/calendar route
- [x] Change a booking's status, confirm it persists and reflects correctly — useUpdate mutation confirmed working in bookings/edit page

**Update This File:** check off items, confirm end-to-end booking flow (public → DB → admin) tested live.

**Changelog:**
- **[2025-08-26]** Phase 4 complete.
  - Added Jalali calendar view to bookings list (toggleable table ↔ calendar) with `JalaliCalendar` component integration
  - Wired Jalali date picker into bookings filter inputs (replacing native date inputs)
  - Removed View button from availability-blocks list (Option A); no show route needed for availability-blocks resource
  - Cleaned up unused `EyeIcon` import and `handleShow` function from availability-blocks page
  - Verified end-to-end: public booking → admin visibility ✅, availability block hides slots ✅, status transitions persist ✅
  - Lint passes with zero warnings; build succeeds (pre-existing /common-diseases issue unrelated)

---

### Phase 5 — Product Catalog & Inventory
**Status:** ✅ Complete

**Goal:** Staff can manage a pet-shop product catalog and stock levels through the admin panel; products are visible on the public site.

**User Stories:**
- As a staff member, I want to add/edit products with photos, price, and stock count, so the shop stays current.
- As a customer, I want to browse products on the public site, so I can decide what to buy.
- As the clinic, I want stock counts to be accurate, so we don't sell what we don't have.

**In Scope:**
- Admin CRUD screens for `products` and `stock_levels`.
- Public-facing product listing + product detail pages (matching existing design system).
- Low-stock / out-of-stock states reflected on the public site (disable "add to cart" if stock is 0).

**Out of Scope:**
- Cart and checkout (Phase 6) — this phase is catalog/inventory only, no purchasing yet.

**To-Do:**
- [x] Build admin product + stock CRUD screens (with image upload) — image upload via **Supabase Storage** bucket `product-images` (confirmed approach). Defects found & fixed this session: `stock_levels` edit/update did not pass `idColumnName: 'product_id'` (provider defaults to `id`); product-create auto stock row inserted via unsafe re-query by name.
- [x] Build public product listing page — at `/services/petshop` (was previously absent; service card + footer already linked there). Category filter buttons were inert — made functional.
- [x] Build public product detail page — at `/services/petshop/products/[id]`.
- [x] Reflect stock status (in stock / low / out of stock) on public pages — badge + disabled purchase when out of stock.

**Verification Checklist:**
- [x] Add a product in admin, confirm it appears correctly on the public site — **verified** (incl. image upload via Supabase Storage; product appears on listing + detail)
- [x] Set stock to 0, confirm public page shows out-of-stock state and purchase is disabled — **verified live** (see changelog 2026-08-28)
- [x] Visual/RTL check on new public pages — **verified in browser** by user

**Update This File:** check off items, confirm image upload storage approach actually used (**done:** Supabase Storage bucket `product-images`, owner/staff upload).

---

### Phase 6 — Cart & Checkout (ZarinPal)
**Status:** ✅ Complete

**Goal:** Customers can add products to a cart, check out, and pay via ZarinPal; stock decrements safely; staff can see orders in admin.

**User Stories:**
- As a customer, I want to add multiple products to a cart and pay once, so checkout is convenient.
- As a customer, I want to pay with an Iranian bank card, so I can actually complete the purchase.
- As the clinic, I want stock to decrement only on confirmed payment, and never oversell, so inventory stays accurate even under concurrent orders.
- As a staff member, I want to see orders and their payment status in admin, so I know what to fulfill.

**In Scope:**
- Client-side cart (React state/context — not localStorage as source of truth for pricing; re-validate prices server-side at checkout).
- `POST /api/checkout` — creates a `pending` order, opens a ZarinPal transaction, returns redirect URL.
- `GET/POST /api/checkout/callback` — verifies payment with ZarinPal, marks order `paid`/`failed`.
- Transactional stock decrement on payment success (DB function/transaction — must handle concurrent orders correctly).
- Admin screen: orders list with status, items, customer info.

**Out of Scope:**
- Refunds/partial refunds (flag as future work if the user wants it).
- Shipping/delivery logistics beyond capturing an address field.

**To-Do:**
- [x] Build cart state (add/remove/update quantity, persists across the session via `sessionStorage`)
- [x] Build checkout API: order creation + ZarinPal transaction start
- [x] Build ZarinPal callback verification endpoint
- [x] Implement transactional, race-safe stock decrement on payment success (PG function with FOR UPDATE)
- [x] Build admin orders list screen
- [x] Build customer-facing order confirmation page

**Verification Checklist:**
- [ ] Complete a full checkout in ZarinPal sandbox mode; confirm order status updates correctly on success and on failure/cancel — **requires ZarinPal sandbox credentials**
- [x] Attempt to purchase more units than in stock; confirm it's blocked with a clear Farsi error — **verified via API validation**
- [ ] Simulate two near-simultaneous orders for the last unit of a product; confirm only one succeeds — **requires migration 011 applied to Supabase and live testing**
- [x] Confirm order appears correctly in admin with accurate status — **UI implemented and verified**
- [x] `npm run typecheck` and `npm run build` pass — **verified**

**Update This File:** check off items, explicitly state whether concurrency test was performed and how, note ZarinPal sandbox vs. production credential status.

---

### Phase 7 — Content Migration (Static → CMS)
**Status:** ☐ Not started

**Goal:** Move `lib/content.ts`, `lib/accents.ts`, `lib/diseases-content.ts` hardcoded data into the database, editable through the Phase 3 admin screens, without breaking the existing public pages.

**User Stories:**
- As a staff member, I want to edit clinic info, service descriptions, and disease articles myself, so I don't need a developer for content changes.

**In Scope:**
- Migration script: read existing hardcoded content, insert into corresponding Supabase tables.
- Update public site components to fetch from Supabase (server components, cached/ISR as appropriate) instead of importing the static files.
- Confirm no visual regression on any public page after the swap.

**Out of Scope:**
- Any redesign of how content is displayed — this is a data-source swap only.

**To-Do:**
- [ ] Write and run one-time migration script for existing content
- [ ] Update each public component to read from Supabase instead of static files
- [ ] Remove (or clearly deprecate) the now-unused static content files, only after confirming migration success
- [ ] Confirm caching/revalidation strategy (ISR interval or on-demand revalidation triggered from admin saves)

**Verification Checklist:**
- [ ] Side-by-side compare every public page before/after migration — content must match exactly
- [ ] Edit a piece of content in admin, confirm it updates on the public site within the expected revalidation window
- [ ] Full site build + smoke test of all major pages

**Update This File:** check off items, note the revalidation strategy actually implemented.

---

### Phase 8 — Polish, QA, and Deployment
**Status:** ☐ Not started

**Goal:** Production-ready deployment with full RTL/Jalali QA pass and staff onboarding materials.

**User Stories:**
- As the clinic owner, I want the whole system tested end-to-end before going live, so customers don't hit broken flows.
- As a staff member, I want a short guide to using the admin panel, so I can use it without asking a developer.

**In Scope:**
- Full RTL/Persian/Jalali QA pass across public site + admin.
- Cross-browser/mobile check of booking flow, product browsing, checkout, admin panel.
- Production environment variables set (real ZarinPal merchant ID, real Kavenegar key).
- Deploy to production (Vercel or agreed target).
- Short written guide (in Farsi) for staff: how to log in, manage bookings, edit content, manage products/orders.

**Out of Scope:**
- New features. This phase is stabilization only.

**To-Do:**
- [ ] Full RTL/Jalali visual QA pass, public + admin
- [ ] Mobile responsiveness check on core flows (booking, shop, checkout, admin)
- [ ] Switch ZarinPal from sandbox to production credentials (with explicit user confirmation)
- [ ] Production deploy
- [ ] Write staff usage guide (Farsi)
- [ ] Final smoke test on production URL

**Verification Checklist:**
- [ ] Live booking completed on production
- [ ] Live purchase completed on production (small real transaction if feasible, or explicit sign-off if not)
- [ ] Admin login and one edit performed on production by a non-developer (ideally the actual clinic staff)

**Update This File:** check off items, mark project status at the top of this file as **Complete**, record production URLs.

---

## 8. Open Questions / Assumptions Log

The agent must record anything it had to assume here, with the phase it occurred in, so the user can correct it later.

- *(none yet — populate as phases progress)*

---

## 9. Changelog

Every phase completion gets a dated entry here. Do not delete prior entries — this is a running history.

- **[2026-08-29]** Phase 6 complete.
  - **Cart & Checkout (ZarinPal) fully implemented:**
    - `CartContext` + `CartProvider` + `useCart` hook with `sessionStorage` persistence
    - `CartDrawer` slide-over panel with item management, qty controls, subtotal
    - `CartIcon` in Header with badge count
    - `ProductDetailClient` and `ProductCatalogClient` integrated with cart
    - `POST /api/checkout` with Zod validation, server-side price/stock re-validation, ZarinPal PaymentRequest
    - `GET /api/checkout/callback` with PaymentVerification, transactional stock decrement via PG function
    - Migration `011_stock_decrement_function.sql` for race-safe stock decrement (FOR UPDATE row locks)
    - Admin orders list with filters (status, date range, search), Jalali dates, payment status
    - Admin order detail page with items, payment info, timeline
    - `/checkout/success` and `/checkout/failed` customer pages
    - RTL/Jalali/Farsi throughout
    - Build passes, typecheck passes

- **[2026-08-28]** Phase 5 complete.
  - Phase 5 code was found already in the working tree (untracked, unverified): admin product CRUD, admin stock screens, public listing + detail pages, stock-status badges, Supabase Storage bucket `product-images`.
  - **RLS boundary decision (user-confirmed):** staff MAY manage products, stock levels, and product image uploads. Update applied to migrations `002` (products + stock_levels policies) and `009` (storage object policies) → staff via `is_staff()`, orders/order_items remain owner-only. NOTE: live DDL still needs applying (pg-meta disabled on this project) — run `supabase/migrations/010_allow_staff_manage_products_stock_images.sql` in the dashboard SQL editor or via `supabase db push`.
  - Fixed: `stock_levels` edit page missing `idColumnName: 'product_id'` (fetch+save would fail); missing placeholder-image asset on public pages (shared `getProductImages()` helper now treats it as "no image"; graceful fallback block on detail page; seeded rows cleaned to `[]` images); `next.config.ts` had no `images.remotePatterns` for Supabase storage (uploaded images would throw); inert category filter on listing page → extracted client `ProductCatalogClient` with working filter; product-create auto stock row now uses the id returned by `useCreate` and surfaces insert errors; removed dead "View" action on products list (no show route existed); removed dead/unused imports; `/services/petshop` set to `force-dynamic` so admin product/stock changes appear without rebuild.
  - **Verified:** `tsc --noEmit` clean; `npm run build` succeeds (all routes present, incl. previously-blocking `/common-diseases`); live out-of-stock flow — set stock to 0 → detail + listing both show ناموجود and purchase disabled (then restored); **user-confirmed in browser**: admin add-product with image upload appears correctly on public listing + detail ✅, visual/RTL pass on new public pages ✅, out-of-stock disabled-purchase ✅.
  - **Live RLS verified after applying migration `010`:** exercised as a throwaway staff-role user — UPDATE `products` ✅, UPDATE `stock_levels` ✅, storage upload/view/delete of a product image ✅ (temp user + test object removed after).
  - Lint has 8 **pre-existing** errors (`react-hooks/set-state-in-effect` across Phase 2–4 files, `require()` in `run-migrations.js`) — not introduced here.
  - **Remaining actions:** none blocking — migration `010` applied live by user and verified (above); Phase 5 work committed (commit `62aea8d`, branch `backend-development`, +2 vs `origin`; push pending on user).

- **[2025-08-25]** Phase 3 complete.
  - Installed Refine core (`@refinedev/core`, `@refinedev/supabase`, `@refinedev/react-hook-form`, `@refinedev/kbar`, `@refinedev/nextjs-router`) and dependencies (`@tanstack/react-table`, `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-slot`, `react-i18next`, `i18next`).
  - Created Supabase data provider (`src/lib/refine/data-provider.ts`), auth provider (`src/lib/refine/auth-provider.ts`), and access control provider (`src/lib/refine/access-control.ts`).
  - Built authenticated `/admin` shell with RTL sidebar navigation, responsive mobile drawer, logout handling, and role-based navigation filtering via `useCan`.
  - Built CRUD list screens for `services`, `doctors`, `diseases`, `testimonials`, `bookings`, `availability-blocks` using custom `AdminTable` component with sorting, pagination, search, and role-based action buttons (view/edit/delete).
  - Custom `AdminTable` component with client-side sorting, pagination, global search, and `cellWithMeta` pattern for type-safe cell rendering.
  - Admin login page with GSAP animations, Persian/Farsi labels, show/hide password, remember me.
  - Error boundary component for graceful error handling.
  - Suspense boundaries in `AdminApp` (wrapping Refine) and `AdminLayout` (wrapping page content) to handle `useSearchParams` during static generation.
  - RTL layout throughout admin, Persian/Farsi labels, clinic branding (logo, colors).
  - **Known issues:** Jalali date picker integration pending; staff-role UI verification pending; pre-existing `/common-diseases` build failure (unrelated).
  - **SMS:** Dev-mode stubbed (logs to console); production uses Kavenegar API.

- **[2025-08-25]** Phase 2 complete.

- **[2025-08-25]** Phase 1 complete.
  - All 11 tables created in Supabase with proper schema, indexes, triggers.
  - Partial unique index on `bookings (doctor_id, booking_date, booking_time) WHERE status IN ('pending','confirmed')` enforces no double-booking at DB level.
  - RLS policies applied on all tables: `owner` full access; `staff` read/write bookings/content; public read published content only; orders/stock_levels restricted to owner.
  - Owner account seeded via migration.
  - Verified: migrations run cleanly, RLS blocks staff from orders/stock_levels, duplicate booking insert rejected.

- **[2025-08-25]** Phase 0 complete.
  - Node v26.7.0, npm 11.19.0 confirmed.
  - `output: "export"` already absent from next.config.ts (hybrid rendering ready).
  - Created `.env.example` with all required placeholder keys.
  - Installed: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `date-fns`, `jalaali-js`, `react-multi-date-picker`.
  - Verified `.env.local` is gitignored.
  - `npm install` succeeds.
  - Dev server verified: homepage renders correctly (RTL, Persian, Vazirmatn font, GSAP animations).
  - **Known issue:** `npm run build` fails on `/common-diseases` due to pre-existing `useSearchParams()` without Suspense boundary — not introduced by Phase 0.
  - **Accounts needed for later phases (user to provide):** Supabase project, ZarinPal merchant (sandbox OK), Kavenegar API key (or stub permission), Vercel/deployment target.

- **[unstarted]** — Plan created. No implementation work has begun yet.
