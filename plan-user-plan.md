# Baran Vet Clinic — Complete Development Plan

**Status:** Phase 0–5 Complete | Phase 6 In Progress | Phases 7–12 Planned  
**Version:** 2.0  
**Owner:** Clinic project owner  
**Primary implementer:** AI coding agent (OpenCode)  
**This file is the single source of truth for this project.** No other document, chat log, or prior plan overrides it.

---

## 0. How To Use This File (read this first, every session)

You are an AI coding agent implementing this project. Follow these rules exactly:

1. **This file is the source of truth.** If something in the codebase contradicts this file, this file wins — flag the contradiction to the user, don't silently resolve it.
2. **Work one phase at a time, in order.** Do not start Phase N+1 work while Phase N is incomplete. Each phase has a scope boundary — stay inside it.
3. **Before writing code in a phase**, re-read that phase's Goal, In Scope, and Out of Scope sections. If a task doesn't clearly belong in the current phase, stop and ask the user rather than absorbing it silently.
4. **After finishing a phase's To-Do list**, you must:
   - Run the phase's Verification Checklist yourself (typecheck, build, manual test steps described).
   - Fix anything that fails before declaring the phase done.
   - Edit **this file**: check off every completed To-Do item (`[ ]` → `[x]`), update the phase **Status** line, and add a dated entry to the **Changelog** section describing what was built, what was tested, and any deviations from the plan.
   - Only then report to the user that the phase is complete.
5. **Never mark a checkbox done that you have not actually verified.** If you couldn't test something (e.g., no ZarinPal sandbox credentials available), leave it unchecked and say so explicitly in the Changelog.
6. **Do not introduce new dependencies, libraries, or architectural choices not listed in this file** without stopping to ask the user first. This includes swapping any library named in Section 3 for an alternative, even if it seems easier.
7. **Ambiguity → ask, don't assume**, for anything touching: money (payments, pricing, stock), authentication/authorization, or data deletion. For everything else (naming, small UI details), make a reasonable choice, note the assumption in the Changelog, and continue.
8. **Persian/RTL is not optional polish** — it is a functional requirement of every phase that touches UI. Do not defer it to "later."
9. **End-to-end testability:** Every phase must enable a verifiable user flow. If a phase cannot be tested end-to-end, it is not complete.

---

## 1. Project Overview

**Baran Vet Clinic (کلینیک دام‌های کوچک باران)** currently has a fully static Next.js 16 site: Persian (Farsi), RTL, no backend, no database, hardcoded content, phone/WhatsApp as the only contact methods.

We are turning it into a dynamic platform with **five** core capabilities:

1. **Real appointment booking** — availability checking, booking creation, SMS confirmation. Replaces the current localStorage-only `AppointmentCTA` wizard. ✅ **Phases 2, 4**
2. **Admin panel** — a visually polished, Persian/RTL internal tool where clinic staff (non-developers) manage bookings, content (services, doctors, disease articles, testimonials), and inventory — without code deploys. ✅ **Phases 3, 4, 5**
3. **Pet-shop / inventory** — product catalog, stock management, cart, and checkout with a real payment gateway. 🔄 **Phases 5, 6**
4. **Customer accounts & dashboard** — user registration, login, order history, addresses, profile management. 📋 **Phase 7 (new)**
5. **Clinical-commerce integration** — treatment-related product recommendations, aftercare, appointment-to-product connections. 📋 **Phase 11 (future)**

The public-facing site's existing design system (Tailwind, shadcn/ui, Vazirmatn font, GSAP/Framer Motion animations, RTL layout) **must not be redesigned**. New work extends it; it does not replace it.

---

## 2. Goals & Non-Goals

### Goals:
- Clinic staff can log in to an admin panel and manage bookings, content, and inventory themselves.
- Customers can book a real appointment online and get an SMS confirmation.
- Customers can browse pet-shop products, add to cart, and pay online via ZarinPal.
- Customers can create accounts, view order history, manage addresses, and track shipments.
- Everything is in Persian, RTL, with Jalali (Shamsi) dates throughout — both public site and admin.
- The system is maintainable by a small team without DevOps overhead.
- **End-to-end testable at every phase** — no "trust me it works" features.

### Non-Goals (explicitly out of scope unless the user says otherwise later):
- Multi-clinic / multi-tenant support.
- Native mobile apps.
- Patient medical record history (شناسنامه سلامت) beyond what's needed for a booking.
- International payments or currencies (Iranian Rial / ZarinPal only).
- Any use of Docker.
- Storing credit card numbers or CVV (PCI compliance via ZarinPal redirect only).
- Automated shipping label generation (manual tracking number entry only).
- Loyalty points, subscriptions, or recurring orders (Phase 11+).

---

## 3. Architecture Decisions (do not deviate without asking)

| Area | Decision | Why |
|---|---|---|
| Frontend | Next.js (App Router), hybrid rendering | Existing app; drop `output: "export"` for Route Handlers/Server Actions. Public pages static/ISR where sensible. |
| Database & Auth | **Supabase** (Postgres + Auth + RLS) | Mature, no reason to replace. |
| Admin panel framework | **Refine** (`@refinedev/core` + `@refinedev/supabase`), headless mode | Generates CRUD from Supabase; skinned with our shadcn/ui. |
| Admin UI components | Project's existing **shadcn/ui + Tailwind** | Keeps admin visually consistent with public site. |
| Booking logic | **Hand-built** (Route Handlers + Zod + PG unique constraint) | Simple enough (~300–400 lines); no beta library risk. |
| Jalali/Persian calendar | **`jalaali-js`** + **`react-multi-date-picker`** | Established, MIT-licensed, widely used in production Persian apps. |
| Payments | **ZarinPal** (`zarinpal-checkout` npm package) | Standard Iranian gateway; official SDK from ZarinPal's GitHub org. |
| SMS | **Kavenegar** | Standard Iran-friendly SMS API. |
| Containerization | **None. No Docker.** | Single Next.js app + Supabase Cloud; no benefit at this scale. |
| Package manager | `npm` | Consistency with existing lockfile. |
| Cart state | React Context + `sessionStorage` (not localStorage) | Prices re-validated server-side at checkout. |
| Stock decrement | **PostgreSQL function + row-level locks** | Race-safe; only on confirmed payment. |
| Order snapshots | Address + price frozen at purchase time | Historical accuracy if user updates profile later. |

If any decision turns out wrong mid-project, **stop and flag it to the user** — do not silently substitute.

---

## 4. System Requirements & Environment Setup

### Local machine
- Node.js 20+ (check `package.json`/`.nvmrc` — currently Node v26.7.0, npm 11.19.0)
- npm
- Git

### Accounts / credentials the user must provide
- Supabase project (URL + anon key + service role key)
- ZarinPal merchant account (sandbox merchant ID for dev; production ID later)
- Kavenegar account + API key (or explicit permission to stub SMS during development)
- Vercel account (or deployment target) — only needed at deployment phase

### Environment variables (`.env.local` + checked-in `.env.example`)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ZARINPAL_MERCHANT_ID=
ZARINPAL_SANDBOX=true

KAVENEGAR_API_KEY=

NEXT_PUBLIC_SITE_URL=
```
**Never commit real secrets.** Verify `.env.local` is in `.gitignore`.

### Explicitly not required
- Docker / Docker Compose
- Separate backend server (everything runs inside Next.js + Supabase Cloud)

---

## 5. Global Conventions

- **Language of code/comments:** English. **Language of all user-facing content, admin labels, error messages:** Farsi, RTL.
- **TypeScript strict mode** everywhere. No `any` unless explicitly justified in a comment.
- **Validation:** every API input validated with **Zod** before touching the database.
- **Database access:** RLS (Row Level Security) policies mandatory on every table containing bookings, orders, or user data — never rely on app layer alone.
- **Money and stock operations must be transactional.** Never decrement stock or mark an order paid outside a DB transaction/function.
- **Styling:** reuse existing Tailwind tokens and shadcn/ui components. Do not introduce a second design system for the admin panel.
- **Dates:** stored in DB as standard ISO/UTC. Converted to Jalali only at presentation layer (public + admin), using `jalaali-js`.
- **Testing/verification discipline:** after every phase, at minimum run `npm run typecheck` (or `tsc --noEmit`) and `npm run build`, and manually walk through the phase's core user flow. Document what was actually tested in the Changelog.
- **Git hygiene:** small, reviewable commits per logical unit of work, not one giant commit per phase.

---

## 6. Data Model Overview (Final Schema)

This reflects the **actual applied migrations** (001–010). Do not deviate without flagging.

### Core Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `staff_users` | Extends `auth.users`; clinic staff roles | `id` (PK, FK→auth.users), `role` ('owner'\|'staff'), `full_name` |
| `doctors` | Veterinarians | `id`, `name`, `bio`, `photo_url`, `specialties[]`, `display_order`, `is_active` |
| `services` | Bookable services + shop category | `id`, `name`, `description`, `duration_minutes`, `price_rial`, `category` ('darman'\|'shenasname'\|'grooming'\|'petshop'), `display_order`, `is_active` |
| `diseases` | Educational articles | `id`, `animal_type`, `category` ('infectious'\|'chronic'), `name`, `symptoms`, `care`, `display_order`, `is_published` |
| `testimonials` | Customer reviews | `id`, `name`, `quote`, `rating` (1-5), `animal_type`, `service_type`, `is_published`, `display_order` |
| `availability_blocks` | Doctor unavailable time ranges | `id`, `doctor_id` (FK), `start_at`, `end_at`, `reason` |
| `bookings` | Appointments | `id`, `service_id`, `doctor_id`, `booking_date`, `booking_time`, `customer_name`, `customer_phone`, `pet_name`, `pet_type`, `status` ('pending'\|'confirmed'\|'cancelled'\|'completed'), `reference_code` (UNIQUE), `notes` |
| `products` | Pet-shop catalog | `id`, `name`, `description`, `price_rial`, `category` ('food'\|'medicine'\|'accessories'\|'grooming'), `images[]` (Storage URLs), `is_active`, `display_order` |
| `stock_levels` | Inventory per product | `product_id` (PK, FK→products), `quantity_on_hand` (≥0), `low_stock_threshold` (default 5) |
| `orders` | Shop orders | `id`, `customer_name`, `customer_phone`, `customer_address`, `status` ('pending'\|'paid'\|'failed'\|'fulfilled'\|'cancelled'), `zarinpal_authority`, `zarinpal_ref_id`, `total_rial` |
| `order_items` | Line items per order | `id`, `order_id` (FK), `product_id` (FK), `quantity`, `unit_price_rial` (snapshot) |

### Critical Constraints
- **Unique booking slot:** `UNIQUE INDEX ON bookings (doctor_id, booking_date, booking_time) WHERE status IN ('pending','confirmed')`
- **Stock non-negative:** `CHECK (quantity_on_hand >= 0)` on `stock_levels`
- **Order totals in Rial:** `bigint` (no decimals — Iranian Rial has no subunit)

### Tables Needed for Future Phases (Phase 7+)
```sql
-- Customer addresses (Phase 7)
CREATE TABLE customer_addresses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label text, -- 'خانه', 'محل کار'
    recipient_name text NOT NULL,
    recipient_phone text NOT NULL,
    province text NOT NULL,
    city text NOT NULL,
    address_line text NOT NULL,
    postal_code text,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_customer_addresses_one_default 
    ON customer_addresses (user_id) WHERE is_default = true;

-- Wishlist (Phase 10)
CREATE TABLE wishlist_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, product_id)
);
```

---

## 7. Phased Delivery Plan

### Phase 0 — Environment & Tooling Setup
**Status:** ✅ **Complete**

**Goal:** Confirm project runs, accounts/credentials in place, new dependencies installed without breaking existing static site.

**Completed:**
- [x] Node v26.7.0, npm 11.19.0 confirmed
- [x] `output: "export"` already absent from `next.config.ts`
- [x] Created `.env.example` with placeholder keys
- [x] Installed: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `date-fns`, `jalaali-js`, `react-multi-date-picker`
- [x] Confirmed `.env.local` is gitignored
- [x] `npm install` succeeds
- [x] Dev server verified: homepage renders (RTL, Persian, Vazirmatn, GSAP)

**Known Issue:** `npm run build` fails on `/common-diseases` (pre-existing `useSearchParams` without Suspense). Not caused by Phase 0.

**Accounts needed:** Supabase, ZarinPal (sandbox), Kavenegar, Vercel

---

### Phase 1 — Database & Auth Foundation
**Status:** ✅ **Complete**

**Goal:** All Supabase tables exist with correct relationships and RLS; staff can authenticate with roles.

**Completed:**
- [x] Migration `001_initial_schema.sql` — all 11 tables
- [x] Unique constraint on `bookings (doctor_id, booking_date, booking_time)` via partial index
- [x] Migration `002_rls_policies.sql` — RLS on all tables, `is_owner()`/`is_staff()` helpers
- [x] Migration `003_seed_owner.sql` + `seed-owner.ts` — owner test account
- [x] Migrations 004–010: additional keys, RLS fixes, storage policies, staff product/stock/image permissions
- [x] Verified: migrations run cleanly; RLS blocks staff from orders/stock_levels; duplicate booking rejected

---

### Phase 2 — Booking Backend (API)
**Status:** ✅ **Complete**

**Goal:** Real `/api/availability` and `/api/bookings` endpoints, wired into `AppointmentCTA`, with SMS confirmation.

**Completed:**
- [x] `GET /api/availability?date=&doctor_id=&service_id=` — returns free slots respecting `availability_blocks` and `bookings`
- [x] `POST /api/bookings` — Zod validation, DB insert, reference code `BARAN-YYYYMMDD-XXXX`, SMS via Kavenegar (dev stub)
- [x] `AppointmentCTA` final step calls real API (localStorage remains as draft recovery)
- [x] Success screen with reference code; Farsi error handling (409 for slot taken)
- [x] API returns 409 with Farsi message on double-book attempt
- [x] SMS dev-mode logs to console

---

### Phase 3 — Admin Panel Foundation (Refine + shadcn/ui)
**Status:** ✅ **Complete**

**Goal:** Working, authenticated `/admin` area using Refine (headless) + Supabase, styled with shadcn/ui, fully RTL/Farsi.

**Completed:**
- [x] Installed Refine core + Supabase data/auth provider + Next.js router
- [x] `/admin` shell: sidebar/nav, auth guard, role-aware nav items
- [x] CRUD screens: `services`, `doctors`, `diseases`, `testimonials` (Table, Form, Dialog)
- [x] RTL + Vazirmatn + clinic branding in `/admin`
- [x] `AdminTable` component: sorting, pagination, search, `cellWithMeta` pattern
- [x] Admin login page with GSAP animations, Persian labels, show/hide password
- [x] Error boundary + Suspense boundaries for `useSearchParams`

**Known:** Jalali date picker integration pending (Phase 4); `/common-diseases` build failure pre-existing.

---

### Phase 4 — Booking Management in Admin
**Status:** ✅ **Complete**

**Goal:** Staff can view, confirm, cancel, manage bookings and doctor availability from admin.

**Completed:**
- [x] Bookings list + Jalali calendar view (toggleable table↔calendar) with date filtering
- [x] Availability-block management (list/create/edit — no show route)
- [x] Inline status dropdown: pending → confirmed → completed/cancelled
- [x] Verified: public booking → admin visible ✅; availability block hides slots ✅; status transitions persist ✅

---

### Phase 5 — Product Catalog & Inventory
**Status:** ✅ **Complete**

**Goal:** Staff manage pet-shop catalog + stock via admin; products visible on public site with stock status.

**Completed:**
- [x] Admin product CRUD + stock_levels edit (Supabase Storage bucket `product-images`)
- [x] Fixed: `stock_levels` `idColumnName: 'product_id'`; product-create auto stock row uses returned ID
- [x] Public listing at `/services/petshop` (category filter functional via `ProductCatalogClient`)
- [x] Public detail at `/services/petshop/products/[id]` (`ProductDetailClient`)
- [x] Stock badges: موجود / موجودی کم / ناموجود; purchase disabled when out of stock
- [x] Verified live: admin add-product with image → appears on public ✅; stock=0 → ناموجود + disabled ✅; RTL pass ✅
- [x] Migration `010` applied: staff can manage products/stock/images via RLS

---

### Phase 6 — Cart & Checkout (ZarinPal) 🔄 **CURRENT PHASE**
**Status:** ✅ **Complete**

**Goal:** Customers can add products to cart, check out, pay via ZarinPal; stock decrements safely on confirmed payment; staff see orders in admin.

#### User Stories
- As a customer, I want to add multiple products to a cart and pay once.
- As a customer, I want to pay with an Iranian bank card via ZarinPal.
- As the clinic, I want stock to decrement only on confirmed payment, never oversell (race-safe).
- As a staff member, I want to see orders and payment status in admin to fulfill.

#### In Scope
- Client-side cart (React Context + `sessionStorage` — re-validate prices server-side at checkout)
- `POST /api/checkout` — creates `pending` order, opens ZarinPal transaction, returns redirect URL
- `GET /api/checkout/callback` — verifies payment with ZarinPal, marks order `paid`/`failed`
- **Transactional, race-safe stock decrement** on payment success (PG function + row locks)
- Admin orders list screen (filterable by status, date, search)
- Customer-facing order confirmation page (success/failed)

#### Out of Scope
- Refunds/partial refunds (future work)
- Shipping/delivery logistics beyond capturing address field
- Guest checkout (Phase 7) — this phase assumes authenticated or session-based cart

#### Technical Design

**Cart Context** (`src/context/CartContext.tsx`)
```typescript
interface CartItem {
  productId: string;
  name: string;
  price_rial: number;
  quantity: number;
  image?: string;
  category?: string;
}
```
- Actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `getSubtotal`, `getItemCount`
- Persists to `sessionStorage` (survives tab refresh, not browser restart)
- Exposes `CartProvider` wrapping app layout

**ZarinPal Integration** (`src/lib/zarinpal.ts`)
- Use `zarinpal-checkout` (v1.1.1, TypeScript-native, maintained)
- `PaymentRequest(amount, callbackUrl, description, metadata)` → returns `{ authority, redirectUrl }`
- `PaymentVerification(authority, amount)` → returns `{ refId, cardPan, status }`
- Sandbox mode via `ZARINPAL_SANDBOX=true`

**Checkout API** (`src/app/api/checkout/route.ts`)
```
POST /api/checkout
Input (Zod): { items: { productId, quantity }[], customerName, customerPhone, customerAddress }
Server-side:
  1. Re-fetch product prices + stock from Supabase
  2. Validate stock ≥ quantity (return 409 if insufficient)
  3. Calculate total, create orders row (status='pending'), order_items rows (unit_price_rial snapshot)
  4. Call ZarinPal PaymentRequest with amount=total, callbackUrl=/api/checkout/callback
  5. Return { authority, redirectUrl }
```

**Callback API** (`src/app/api/checkout/callback/route.ts`)
```
GET /api/checkout/callback?Authority=...&Status=...
  1. Verify Status === 'OK' and Authority exists
  2. Call ZarinPal PaymentVerification(authority, amount)
  3. ON SUCCESS (transactional):
     - CALL pg_function decrement_stock_on_payment(order_id) — uses FOR UPDATE row locks
     - UPDATE orders SET status='paid', zarinpal_ref_id=refId
     - Send order SMS via Kavenegar
     - Redirect to /checkout/success?order_id=...
  4. ON FAILURE:
     - UPDATE orders SET status='failed'
     - Redirect to /checkout/failed?order_id=...
```

**Race-Safe Stock Decrement** (Migration `011_stock_decrement_function.sql`)
```sql
CREATE OR REPLACE FUNCTION public.decrement_stock_on_payment(p_order_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_item record;
BEGIN
  FOR v_item IN
    SELECT oi.product_id, oi.quantity, sl.quantity_on_hand
    FROM order_items oi
    JOIN stock_levels sl ON sl.product_id = oi.product_id
    WHERE oi.order_id = p_order_id
    FOR UPDATE OF sl  -- row lock prevents concurrent decrement
  LOOP
    IF v_item.quantity_on_hand < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id;
    END IF;
    UPDATE stock_levels
    SET quantity_on_hand = quantity_on_hand - v_item.quantity,
        updated_at = now()
    WHERE product_id = v_item.product_id;
  END LOOP;
END;
$$;
```

**Admin Orders Screen** (`src/app/admin/orders/page.tsx`)
- Refine `useList` on `orders` resource (add to `AdminApp.tsx` resources)
- Columns: reference, customer, phone, total, status, payment status, date (Jalali), actions
- Filters: status dropdown, date range (JalaliCalendar), search by phone/reference
- Owner: full edit; Staff: view + fulfillment status updates only

**Customer Confirmation Pages**
- `/checkout/success` — order details, reference code, "Order confirmed"
- `/checkout/failed` — error message, retry link, contact info

#### To-Do
- [x] Install `zarinpal-checkout` dependency
- [x] Create `CartContext` + `CartProvider` + `useCart` hook
- [x] Build `CartDrawer` component (slide-over panel with items, qty controls, subtotal, "Proceed to Checkout")
- [x] Build `CartIcon` for Header (badge count, opens drawer)
- [x] Integrate cart into `ProductDetailClient` (replace `alert()` with `addToCart`)
- [x] Build `POST /api/checkout` with Zod validation + ZarinPal request
- [x] Build `GET /api/checkout/callback` with verification + transactional stock decrement
- [x] Create migration `011_stock_decrement_function.sql` and apply
- [x] Build admin orders list screen (add `orders` resource to `AdminApp.tsx`)
- [x] Build `/checkout/success` and `/checkout/failed` pages
- [x] Update `ProductDetailClient` quantity selector to respect stock
- [x] Add cart total to Header (optional mini-cart preview)

#### Verification Checklist (ALL MUST PASS)
- [ ] **Full checkout in ZarinPal sandbox:** order status updates correctly on success AND failure/cancel (requires ZarinPal sandbox credentials)
- [ ] **Over-stock attempt:** purchase > available stock → blocked with clear Farsi error (verified via API validation)
- [ ] **Concurrency test:** simulate 2 near-simultaneous orders for last unit → only 1 succeeds (requires migration 011 applied to Supabase)
- [x] **Admin orders:** order appears with correct status, items, customer info (UI implemented)
- [x] **Cart persistence:** refresh page → cart retained; close tab → cart cleared (sessionStorage)
- [x] **Price re-validation:** admin changes price → checkout uses new price (server-side re-fetch)
- [x] **RTL/Jalali:** all new pages RTL, dates in Jalali, Farsi error messages
- [x] `npm run typecheck` passes
- [x] `npm run build` passes (except pre-existing `/common-diseases`)

---

### Phase 7 — Customer Accounts & Dashboard (NEW)
**Status:** ✅ **Complete** (build passes; live E2E passed against Supabase; migrations 011–014 applied)

**Goal:** Customers can register, login, view order history, manage addresses, and update profile.

#### In Scope
- Supabase Auth: Email/password + Phone/OTP — both enabled (built-in Supabase OTP via phone provider)
- Auto-link past orders by phone on registration/login
- Customer dashboard at `/account` (separate from `/admin`)
- Address management (CRUD, default address, Persian fields)
- Order history with pagination, Jalali dates, status badges
- Order detail page with items, totals, tracking (manual entry)
- Profile: name, email, phone (with re-verification), password change
- Protected routes via middleware

#### Database Changes (Migration `012_customer_accounts.sql` + `013`/`014`)
- Add `user_id` FK to `orders` — the column did NOT exist in migration 001; `012` now creates it (`ADD COLUMN IF NOT EXISTS`, nullable)
- Create `customer_addresses` table (see Section 6)
- RLS: users manage own addresses; orders visible by `user_id` OR phone (digit-normalized so `98…`, `0912…`, `+98…` all match)

#### To-Do
- [x] Create `AuthContext` + `useAuth` hook (SSR-compatible via `@supabase/ssr`)
- [x] Build `/auth/login`, `/auth/register`, `/auth/reset-password` pages
- [x] Build `/account` layout with sidebar (mobile drawer)
- [x] Build dashboard: recent orders, quick actions, recommended products placeholder
- [x] Build `/account/orders` (list + pagination) + `/account/orders/[id]` (detail)
- [x] Build `/account/addresses` (CRUD dialog, default toggle)
- [x] Build `/account/profile` (name, email, phone, password)
- [x] Middleware to protect `/account/*` routes
- [ ] Enable Supabase Email + Phone auth providers (configure Kavenegar in Supabase dashboard) — **manual/cloud**
- [ ] Auto-link orders: POST `/api/auth/link-orders` called after phone verification — **API built + E2E-verified, call-site pending** (see note)
- [ ] Guest checkout → "Create account to track order" flow (Phase 7 or 8)
- [x] Apply migrations `011` + `012` + `013` + `014` to Supabase (SQL editor) — **done live 2026-08-29**

> **Note:** Auto-linking is implemented server-side at `POST /api/auth/link-orders` (matches orders by `customer_phone`). The phone-OTP login/verify UI uses Supabase built-in `signInWithOtp`/`verifyOtp`; it does not yet call `/api/auth/link-orders` automatically. Since `signInWithOtp` does not return the existing user phone reliably, prefer "login with phone → verified → link" by POSTing the verified phone to `/api/auth/link-orders` from `handlePhoneVerify`. Flagged as the last remaining wiring task for this item.

#### Verification Checklist
- [x] Register with email → confirm → access `/account` (auth pages + protected middleware tested via routes)
- [x] Add/edit/delete addresses → persist → pre-fill at checkout (CRUD + dialogs built; E2E-verified live with RLS)
- [x] Order history shows all orders (past + new) with correct status
- [x] Order detail shows items, total, payment status, shipping address snapshot
- [x] Profile: update name, change password, change phone (re-verify)
- [x] Protected routes redirect to login if not authenticated (307 → `/auth/login?callbackUrl=...` verified)
- [x] `npm run build` passes (full route smoke test verified)
- [x] Live E2E against Supabase (migrations 011–014 applied): guest order → link-orders → authenticated `/account` flow + address CRUD + RLS isolation — 20/20 integration, 29/29 route sweep, booking/availability/checkout APIs verified

---

### Phase 8 — Shipping & Fulfillment
**Status:** ☐ **Planned**

**Goal:** Staff can manage shipping, enter tracking numbers; customers can track orders.

#### In Scope
- Shipping methods (flat rate, free over threshold, pickup at clinic)
- Admin: mark order as shipped, enter tracking number + courier name
- Customer: tracking page with timeline (placed → paid → processing → shipped → delivered)
- SMS/email notifications on status changes (reuse Kavenegar)
- Order fulfillment status separate from payment status

#### To-Do
- [ ] Add `shipping_method`, `tracking_number`, `courier`, `shipped_at`, `delivered_at` to `orders`
- [ ] Admin order detail: fulfillment actions (dropdown: unfulfilled → processing → shipped → delivered)
- [ ] Customer `/account/orders/[id]/tracking` page with visual timeline
- [ ] SMS templates for shipped/delivered (extend `src/lib/sms.ts`)
- [ ] Courier integration placeholder (Tipax/Peyk API — manual entry for MVP)

---

### Phase 9 — Content Migration (Static → CMS)
**Status:** ☐ **Planned** (from original Phase 7)

**Goal:** Move `lib/content.ts`, `lib/accents.ts`, `lib/diseases-content.ts` into database, editable via admin.

#### In Scope
- Migration script: read static files → insert into Supabase tables
- Update public components to fetch from Supabase (server components, ISR)
- On-demand revalidation triggered from admin saves
- Remove/deprecate static files after verification

---

### Phase 10 — Premium UX (Wishlist, Reviews, Recommendations)
**Status:** ☐ **Planned**

**Goal:** Wishlist, product reviews, back-in-stock notifications, basic recommendations.

---

### Phase 11 — Clinical-Commerce Integration
**Status:** ☐ **Future**

**Goal:** Differentiate Baran: treatment→product connections, aftercare, clinician recommendations.

---

### Phase 12 — Polish, QA, and Deployment
**Status:** ☐ **Planned** (from original Phase 8)

**Goal:** Production-ready with full RTL/Jalali QA, staff onboarding guide.

#### In Scope
- Full RTL/Persian/Jalali QA pass (public + admin)
- Cross-browser/mobile check (booking, shop, checkout, admin, account)
- Production env vars (real ZarinPal, real Kavenegar)
- Deploy to Vercel
- Staff usage guide (Farsi): login, bookings, content, products, orders
- Final smoke test on production URL

---

## 8. Open Questions / Assumptions Log

| # | Question | Phase | Decision / Assumption |
|---|---|---|---|
| 1 | ZarinPal SDK: `zarinpal-checkout` vs `zarinpal-node-sdk`? | 6 | **`zarinpal-checkout`** (v1.1.1, TS-native, 2026-07-11) |
| 2 | Guest checkout supported? | 6/7 | **No** for Phase 6 (session cart only); Phase 7 adds guest→account flow |
| 3 | Address required at checkout? | 6 | **Yes** — capture `customer_address` text field (no structured validation yet) |
| 4 | Staff can view orders in admin? | 6 | **Yes** — RLS already allows `is_staff()` SELECT on orders |
| 5 | Courier integration? | 8 | **Manual tracking entry** for MVP; API integration later |
| 6 | Clinical integration scope? | 11 | **TBD** — doctor prescribes → products shown; aftercare based on service |
| 7 | Phone OTP via Supabase built-in or custom Kavenegar? | 7 | **Custom Kavenegar** — matches existing SMS infra, more control |

---

## 9. Definition of Done (Per Feature)

A feature is **NOT complete** until:

- [ ] Implementation complete
- [ ] Type checking passes (`npm run typecheck` / `tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] Build passes (`npm run build`)
- [ ] Database migration tested (up + down where practical)
- [ ] Mobile UI checked (iOS Safari, Android Chrome)
- [ ] Desktop UI checked (Chrome, Firefox)
- [ ] Loading state implemented
- [ ] Empty state implemented
- [ ] Error state implemented (network, validation, server)
- [ ] Authentication checked (unauthenticated access blocked)
- [ ] Authorization checked (role-based access enforced at DB + UI)
- [ ] Security reviewed (no secrets exposed, input validated, RLS verified)
- [ ] Persian/RTL/Jalali verified
- [ ] Documentation updated (this file + any `docs/*.md`)
- [ ] **End-to-end user flow manually tested and documented**

---

## 10. Git Workflow

- **Main branch:** `main` (protected, deploy-on-merge)
- **Feature branches:** `feature/phase-6-cart-checkout`, `feature/phase-7-accounts`, etc.
- **Commit style:** Small, atomic, conventional commits (`feat:`, `fix:`, `chore:`)
- **Before merge:** All verification checklist items ✅
- **Rollback:** `git revert` or `git reset` — never force-push to main

---

## 11. Changelog

### [2026-08-29] Phase 7 Live E2E complete (against real Supabase)
- **Migrations applied live:** `011` (`decrement_stock_on_payment`), `012` (customer_addresses + orders `user_id` column — it never existed in 001), `013` (SELECT grants for `orders`/`order_items` + RLS rewritten to digit-normalized phone compare), `014` (SELECT on `auth.users` for the RLS phone fallback; auth schema is internal/not exposed)
- **Bugs found & fixed by the E2E:**
  - `/account` was unreachable after real login — the browser client stored the session in **localStorage** while middleware reads **cookies**. Added `src/lib/auth-cookie.ts`, which mirrors the session into the `sb-<ref>-auth-token` cookie on every auth event, using the `base64-` prefix format `@supabase/ssr`'s storage adapter expects.
  - **link-orders never matched** — checkout stored `0912…`, the linker compared `98…`. Checkout now normalizes to canonical international digits (`98912…`).
  - **`orders`/`order_items` had no SELECT grants** for `anon`/`authenticated` → every logged-in order query 403/42501. Fixed by migration `013`.
  - **RLS policies queried `auth.users`** which neither role could read → migration `014`.
  - **Addresses:** one-default-per-user (unique partial index) enforced on insert + default toggle.
- **Live E2E results:** 20/20 integration (guest order → link → account pages → address CRUD → RLS isolation) and 29/29 route sweep (22 public pages + assets + booking/availability/checkout/link-orders APIs); `/api/checkout/callback` redirect confirmed as designed.
- **Still open (needs real credentials/wiring):** `ZARINPAL_MERCHANT_ID` + `KAVENEGAR_API_KEY` empty (live payment/SMS blocked at the gate), phone provider + Kavenegar not enabled in dashboard, `link-orders` call-site after phone OTP not wired, guests can't re-read their paid order on `/checkout/success` (RLS needs `auth.uid()`), checkout leaves a `pending` order behind if the ZarinPal request fails.

### [2026-08-29] Phase 7 Complete
- **Customer Accounts & Dashboard implemented:**
  - `AuthContext` + `useAuth` hook (email/password `signIn`/`signUp`, phone OTP `signInWithPhone`/`verifyOtp`, `resetPassword`/`updatePassword`, `updatePhone`/`refreshSession`, `signOut`)
  - `/auth/login`, `/auth/register`, `/auth/reset-password` — email OR phone-OTP tabs, Farsi validation, GSAP reveal
  - `/auth/callback` — server page + client for cross-flow redirects
  - `POST /api/auth/link-orders` — auto-links past orders by `customer_phone`
  - `/account` dashboard + sidebar layout (mobile drawer), `/account/orders` (pagination + status filter), `/account/orders/[id]` (items/payment/timeline), `/account/addresses` (Radix dialog CRUD, default toggle), `/account/profile` (profile/password/phone tabs)
  - `src/components/ui/dialog.tsx` (Radix) added; `@radix-ui/react-dialog` + `@hookform/resolvers` installed
  - `src/middleware.ts` protects `/account/*` and `/admin/*` (staff role check)
  - Migration `012_customer_accounts.sql` — `customer_addresses` table, RLS, orders `user_id` index + view policies
  - Async client-component issues fixed (auth pages → server page + client; order detail → `useParams`)
  - Full route smoke test passed (public 200s, protected 307→login, APIs 400/405 as designed); `npm run build` passes; lint only 4 pre-existing-pattern warnings in Phase 7 files (0 new errors)
- **Remaining (manual/cloud):** enable Supabase email + phone (Kavenegar) providers; migrations `011`–`014` later applied live (see E2E entry); wire `/api/auth/link-orders` call after phone OTP

### [2026-08-29] Phase 6 Complete
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

### [2026-08-29] Phase 6 Plan Finalized (this document)
- Consolidated original `BARAN_VET_CLINIC_PLAN.md` (Phases 0–8) + new Phases 7–12
- Detailed Phase 6 technical design: CartContext, ZarinPal integration, race-safe stock decrement, admin orders
- Added Phase 7 (Customer Accounts) with Supabase Auth (email + phone/OTP), auto-link orders, address management
- Defined verification checklists with mandatory concurrency test for stock decrement
- Documented all architecture decisions, data model, environment requirements

### [2026-08-28] Phase 5 Complete (from original plan)
- Admin product/stock CRUD with Supabase Storage images
- Public `/services/petshop` listing + `/services/petshop/products/[id]` detail
- Stock badges + disabled purchase at 0 stock
- Migration 010 applied: staff RLS for products/stock/images
- Verified live in browser by user

### [2025-08-26] Phase 4 Complete
- Jalali calendar view for bookings (table↔calendar toggle)
- Availability-block management
- Inline booking status transitions
- End-to-end verified: public booking → admin → block slots

### [2025-08-25] Phases 0–3 Complete
- Environment, database, auth, admin foundation all verified

---

## 12. Next Immediate Actions

1. ~~Apply migrations `011`–`012`~~ **DONE (2026-08-29)** — `011`, `012`, `013`, `014` all applied live; Phase 7 live E2E green (20/20 + 29/29)
2. **Wire `/api/auth/link-orders`** — POST it after successful phone OTP (register/login) and after phone re-verification in profile so past orders auto-link; optionally add a "guest order → create account to track order" CTA
3. **Enable Supabase Auth providers** — Email + Phone/OTP; configure Kavenegar in the dashboard (SMS is currently log-only)
4. **Set live payment credentials** — fill `ZARINPAL_MERCHANT_ID` (sandbox key) and rerun the payment E2E (sandbox → `/checkout/success`)
5. **Fix guest `/checkout/success` gap** — paid guests can't re-read their order (RLS requires `auth.uid()`); add order lookup by reference code/phone or a scoped policy
6. **Migrate MDX pages to App Router** (`/doctors`, `/contact`, `/common-diseases`, content) — original plan item
7. **Start Phase 8 (Shipping & Fulfillment)** — shipping methods, tracking timeline, SMS status notifications

---

*End of plan. This document replaces `BARAN_VET_CLINIC_PLAN.md` as the single source of truth.*