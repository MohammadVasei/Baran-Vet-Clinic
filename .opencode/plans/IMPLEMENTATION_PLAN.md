# Baran Vet Clinic — Booking Platform Implementation Plan (NestJS + Next.js + Nx)

## Executive Summary

Transform the existing Persian veterinary clinic marketing website into a complete booking platform with:
- **Frontend**: Next.js 16 (marketing site + customer booking + Refine admin)
- **Backend**: NestJS + Prisma + PostgreSQL (API, business logic, auth)
- **Monorepo**: Nx Workspace with shared libraries
- **Payments**: Iranian gateways (ZarinPal/IdPay)
- **Auth**: NestJS owns auth, Next.js validates JWT via middleware

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NX MONOREPO                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  apps/                                                                      │
│  ├── frontend/                    # Next.js 16                              │
│  │   ├── src/app/                 # App Router                              │
│  │   │   ├── (marketing)/         # Existing marketing site                 │
│  │   │   ├── (booking)/           # Customer booking flow                   │
│  │   │   ├── (dashboard)/         # Customer dashboard                      │
│  │   │   └── admin/               # Refine admin panel                      │
│  │   └── src/lib/api-client.ts    # Generated from NestJS OpenAPI           │
│  │                                                                │
│  └── backend/                     # NestJS                                  │
│      ├── src/                                                          │
│      │   ├── auth/                # JWT, Guards, RBAC                     │
│      │   ├── customers/           # Customer & Pet management             │
│      │   ├── services/            # Services, Vets, Rooms                 │
│      │   ├── availability/        # Scheduling engine                     │
│      │   ├── bookings/            # Booking CRUD + state machine          │
│      │   ├── payments/            # ZarinPal/IdPay integration            │
│      │   ├── notifications/       # Email/SMS/Push                        │
│      │   ├── cms/                 # Pages, Blog, Media                    │
│      │   ├── media/               # File upload (S3-compatible)           │
│      │   ├── audit/               # Audit logging                         │
│      │   └── common/              # Guards, Interceptors, Pipes, DTOs     │
│      └── prisma/                  # Prisma schema + migrations            │
│                                                                             │
│  libs/                                                                      │
│  ├── shared/                      # Shared types, constants, utilities    │
│  │   ├── types/                   # Domain types (Booking, Service, etc.) │
│  │   ├── constants/               # Enums, config constants               │
│  │   └── validators/              # Zod schemas (shared validation)       │
│  ├── prisma/                      # Prisma Client singleton (shared)      │
│  └── ui/                          # Shared UI components (optional)       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOYMENT                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Frontend (Vercel)              Backend (Railway/Render/Fly.io)           │
│  ├── Marketing Site (Static)    ├── NestJS API                             │
│  ├── Booking Flow (SSR)         ├── Prisma + PostgreSQL (Neon/Supabase)   │
│  ├── Dashboard (SSR)            ├── Redis (Upstash) - Sessions/Queue      │
│  └── Refine Admin (SSR)         └── S3 Storage (Cloudflare R2)            │
│                                                                             │
│  Shared: Environment variables, Database, Redis, S3                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase Breakdown

### Phase 0: Nx Workspace Setup & Foundation (Week 1)
**Goal**: Establish monorepo structure without breaking existing marketing site

| Task | Description | Verification |
|------|-------------|--------------|
| 0.1 | Create Nx workspace: `npx create-nx-workspace@latest baran-vet --preset=apps` | Workspace builds |
| 0.2 | Add Next.js app: `nx g @nx/next:app frontend --directory=apps/frontend --style=tailwind --linter=eslint` | `nx serve frontend` works |
| 0.3 | Migrate existing Next.js code to `apps/frontend` | Marketing site renders identically |
| 0.4 | Add NestJS app: `nx g @nx/nest:app backend --directory=apps/backend` | `nx serve backend` works |
| 0.5 | Add shared libraries: `shared-types`, `shared-prisma`, `shared-validators` | Imports work across apps |
| 0.6 | Configure Prisma in `libs/shared-prisma` with singleton client | No multiple client warnings |
| 0.7 | Set up PostgreSQL (Neon/Supabase) + run initial migration | `nx migrate backend` works |
| 0.8 | Configure environment variables (`.env.example` at root + per-app) | All vars documented |
| 0.9 | Set up OpenAPI/Swagger in NestJS + Orval in Next.js for type-safe API client | Generated client works |

**Key Decisions:**
- **Nx** for monorepo management (best NestJS + Next.js integration)
- **Shared Prisma** in `libs/shared-prisma` - single source of truth for DB
- **OpenAPI + Orval** for type-safe API client in Next.js
- **NestJS owns auth** - issues JWT, Next.js middleware validates
- **Refine stays in Next.js** at `/admin` calling NestJS API

---

### Phase 1: Database Schema & Domain Models (Week 1-2)
**Goal**: Complete Prisma schema in `libs/shared-prisma/prisma/schema.prisma`

```prisma
// Core models (same as before, in shared Prisma)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  name          String?
  role          Role      @default(CUSTOMER)
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  customer      Customer?
  staff         Staff?
  auditLogs     AuditLog[]
}

model Customer {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  phone     String
  address   String?
  pets      Pet[]
  bookings  Booking[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Pet {
  id          String   @id @default(cuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  name        String
  species     Species
  breed       String?
  sex         Sex
  birthDate   DateTime?
  microchip   String?
  notes       String?
  bookings    Booking[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Service {
  id            String   @id @default(cuid())
  key           String   @unique
  name          String
  description   String
  duration      Int
  price         Int
  depositAmount Int?
  paymentMode   PaymentMode @default(PAY_AT_CLINIC)
  isActive      Boolean  @default(true)
  veterinarians VeterinarianService[]
  bookings      Booking[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Veterinarian {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  name          String
  specialty     String?
  bio           String?
  image         String?
  isActive      Boolean  @default(true)
  services      VeterinarianService[]
  workingHours  WorkingHours[]
  bookings      Booking[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Room {
  id        String   @id @default(cuid())
  name      String
  description String?
  isActive  Boolean  @default(true)
  bookings  Booking[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model WorkingHours {
  id              String   @id @default(cuid())
  veterinarianId  String
  veterinarian    Veterinarian @relation(fields: [veterinarianId], references: [id])
  dayOfWeek       Int
  startTime       String
  endTime         String
  breakStart      String?
  breakEnd        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model BlockedPeriod {
  id             String   @id @default(cuid())
  veterinarianId String?
  roomId         String?
  startDateTime  DateTime
  endDateTime    DateTime
  reason         String?
  createdAt      DateTime @default(now())
}

model Booking {
  id              String       @id @default(cuid())
  customerId      String
  customer        Customer     @relation(fields: [customerId], references: [id])
  petId           String
  pet             Pet          @relation(fields: [petId], references: [id])
  serviceId       String
  service         Service      @relation(fields: [serviceId], references: [id])
  veterinarianId  String?
  veterinarian    Veterinarian? @relation(fields: [veterinarianId], references: [id])
  roomId          String?
  room            Room?        @relation(fields: [roomId], references: [id])
  startDateTime   DateTime
  endDateTime     DateTime
  status          BookingStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  customerNotes   String?
  clinicNotes     String?
  confirmedAt     DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?
  cancellationReason String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  payments        Payment[]
  auditLogs       AuditLog[]
}

model Payment {
  id            String       @id @default(cuid())
  bookingId     String
  booking       Booking      @relation(fields: [bookingId], references: [id])
  amount        Int
  currency      String       @default("IRR")
  provider      PaymentProvider
  providerRef   String?
  status        PaymentStatus @default(PENDING)
  paidAt        DateTime?
  refundedAt    DateTime?
  refundAmount  Int?
  webhookData   Json?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id])
  type      NotificationType
  title     String
  message   String
  data      Json?
  isRead    Boolean          @default(false)
  sentAt    DateTime?
  createdAt DateTime         @default(now())
}

model CmsPage {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  content     String
  excerpt     String?
  seoTitle    String?
  seoDesc     String?
  status      PageStatus @default(DRAFT)
  publishedAt DateTime?
  media       Media[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Media {
  id        String   @id @default(cuid())
  filename  String
  url       String
  mimeType  String
  size      Int
  alt       String?
  pageId    String?
  page      CmsPage? @relation(fields: [pageId], references: [id])
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  action    String
  entity    String
  entityId  String
  metadata  Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}

// Enums
enum Role { CUSTOMER, VETERINARIAN, RECEPTIONIST, MANAGER, ADMIN }
enum Species { DOG, CAT, BIRD, EXOTIC, OTHER }
enum Sex { MALE, FEMALE, UNKNOWN }
enum PaymentMode { PAY_AT_CLINIC, DEPOSIT, FULL_PAYMENT }
enum PaymentProvider { ZARINPAL, IDPAY, WALLET, CASH }
enum PaymentStatus { UNPAID, PENDING, PAID, FAILED, REFUNDED, PARTIAL_REFUND }
enum BookingStatus { PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW }
enum NotificationType { BOOKING_CREATED, BOOKING_CONFIRMED, BOOKING_CANCELLED, BOOKING_REMINDER, PAYMENT_SUCCESS, PAYMENT_FAILED, APPOINTMENT_CHECKED_IN, APPOINTMENT_COMPLETED }
enum PageStatus { DRAFT, PUBLISHED, ARCHIVED }

// Indexes
@@index([customerId, startDateTime])
@@index([veterinarianId, startDateTime])
@@index([status, startDateTime])
@@index([userId, isRead])
@@index([entity, entityId])
```

---

### Phase 2: NestJS Backend Core (Week 2)
**Goal**: NestJS modules, auth, guards, and API foundation

**Module Structure:**
```
apps/backend/src/
├── app.module.ts
├── main.ts
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── permissions.guard.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── permissions.decorator.ts
│   ├── interceptors/
│   │   ├── audit.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── pipes/
│   │   └── zod-validation.pipe.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── prisma/
│       └── prisma.service.ts
├── config/
│   └── configuration.ts
└── modules/
    ├── auth/
    ├── customers/
    ├── pets/
    ├── services/
    ├── veterinarians/
    ├── rooms/
    ├── working-hours/
    ├── blocked-periods/
    ├── availability/
    ├── bookings/
    ├── payments/
    ├── notifications/
    ├── cms/
    ├── media/
    └── audit/
```

**Auth Module (NestJS):**
- JWT strategy with access (15min) + refresh (7d) tokens
- HttpOnly cookie for refresh token
- Roles: CUSTOMER, VETERINARIAN, RECEPTIONIST, MANAGER, ADMIN
- Permissions system: `can(user, action, resource)`
- Password hashing with bcrypt (12 rounds)

**OpenAPI Config:**
```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Baran Vet Clinic API')
  .setVersion('1.0')
  .addBearerAuth()
  .addCookieAuth('refreshToken')
  .build();
```

---

### Phase 3: Resource Management APIs (Week 2-3)
**Goal**: CRUD for all bookable resources with RBAC

**NestJS Controllers (all with Swagger decorators):**

| Module | Endpoints | Guards |
|--------|-----------|--------|
| Services | GET/POST/PATCH/DELETE `/services` | Admin/Manager |
| Veterinarians | GET/POST/PATCH/DELETE `/veterinarians` | Admin/Manager |
| Rooms | GET/POST/PATCH/DELETE `/rooms` | Admin/Manager |
| Working Hours | GET/POST/DELETE `/veterinarians/:id/working-hours` | Vet/Admin/Manager |
| Blocked Periods | GET/POST/DELETE `/blocked-periods` | Vet/Admin/Manager |

**DTOs with Zod Validation (shared in `libs/shared-validators`):**
```typescript
// shared-validators/src/services/dto.ts
export const createServiceSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  duration: z.number().int().positive(),
  price: z.number().int().nonnegative(),
  depositAmount: z.number().int().nonnegative().optional(),
  paymentMode: z.enum(['PAY_AT_CLINIC', 'DEPOSIT', 'FULL_PAYMENT']),
});
```

---

### Phase 4: Availability Engine (Week 3)
**Goal**: Core scheduling logic in NestJS

**Service: `AvailabilityService`**
```typescript
// modules/availability/availability.service.ts
@Injectable()
export class AvailabilityService {
  async getAvailableSlots(dto: GetAvailabilityDto): Promise<TimeSlot[]> {
    // 1. Get service duration
    // 2. Get veterinarian working hours for date (Jalali → Gregorian)
    // 3. Get blocked periods for vet/room
    // 4. Get existing bookings for vet/room
    // 5. Generate 30-min slots
    // 6. Filter: fits in working hours, no overlap with blocks/bookings
    // 7. Return slots with vet/room assignment
  }
}
```

**Concurrency Protection:**
- DB unique constraints: `(veterinarianId, startDateTime)`, `(roomId, startDateTime)`
- `SELECT FOR UPDATE` in booking creation transaction
- Optimistic locking with `version` field on Booking

**API:** `GET /availability?serviceId=&veterinarianId=&date=1403-05-15`

---

### Phase 5: Booking System (Week 3-4)
**Goal**: Complete booking CRUD + state machine

**Booking Module:**
- State machine: PENDING → CONFIRMED → CHECKED_IN → COMPLETED
- Transitions: CANCELLED, NO_SHOW from any state
- Validation: Only valid transitions allowed
- Audit logging on every state change

**Endpoints:**
```
POST   /bookings                    # Create (customer + staff)
GET    /bookings                    # List (filtered by role)
GET    /bookings/:id                # Get one
PATCH  /bookings/:id                # Update (reschedule, notes)
POST   /bookings/:id/confirm        # Staff confirms
POST   /bookings/:id/check-in       # Check in
POST   /bookings/:id/complete       # Complete
POST   /bookings/:id/cancel         # Cancel (with reason)
POST   /bookings/:id/no-show        # Mark no-show
```

**Customer Booking Flow (Next.js):**
```
/booking → Service → Pet → Schedule → Details → Payment → Confirmation
```
- Multi-step form with `react-hook-form` + Zod (shared validators)
- `localStorage` persistence
- Real-time availability polling

---

### Phase 6: Payment Integration (Week 4)
**Goal**: ZarinPal + IdPay with server-side verification

**NestJS Payment Module:**
```typescript
// modules/payments/zarinpal.service.ts
@Injectable()
export class ZarinpalService {
  async createPayment(bookingId: string, amount: number): Promise<{ authority: string; url: string }>
  async verifyPayment(authority: string, amount: number): Promise<{ refId: string; success: boolean }>
}

// modules/payments/idpay.service.ts (similar)
```

**Webhook Endpoints (idempotent):**
```
POST /payments/zarinpal/callback  → Verify → Update Booking + Payment
POST /payments/idpay/callback     → Verify → Update Booking + Payment
```

**Critical Rules:**
- NEVER trust frontend payment success
- ALWAYS verify via server-to-server webhook
- Idempotent: check `providerRef` exists before processing
- Payment status drives booking: PAID → CONFIRMED

---

### Phase 7: Refine Admin Panel (Week 4-5)
**Goal**: Refine in Next.js `/admin` consuming NestJS API

**Refine Resources (Next.js):**
```typescript
// apps/frontend/src/admin/resources/bookings.tsx
import { HttpError } from '@refinedev/core';
import { dataProvider } from '@/lib/api-client'; // Orval-generated

export const bookingResource: Resource = {
  name: 'bookings',
  list: () => <BookingList />,
  create: () => <BookingCreate />,
  edit: () => <BookingEdit />,
  show: () => <BookingShow />,
  meta: { canDelete: true },
};
```

**Data Provider:** Orval-generated from NestJS OpenAPI spec
- Auto-generated types, hooks, mutations
- Handles auth headers, error mapping

**Admin Features:**
- Calendar view (FullCalendar) + Table view
- Drag-to-reschedule (re-checks availability)
- Filters: date, status, vet, service, customer
- Bulk actions

---

### Phase 8: Notifications (Week 5)
**Goal**: Multi-channel notifications with background jobs

**NestJS Module:**
- **BullMQ + Upstash Redis** for job queue
- **Email**: Nodemailer + SendGrid/Mailgun
- **SMS**: Kavenegar/Melipayamak
- **In-app**: Notification table + real-time (Socket.io or polling)

**Job Processing:**
```typescript
// processors/notification.processor.ts
@Processor('notifications')
export class NotificationProcessor {
  @Process('send')
  async handleSend(job: Job<NotificationJob>) { ... }
  
  @Process('reminder-24h')
  async handleReminder24h(job: Job<ReminderJob>) { ... }
  
  @Process('reminder-2h')
  async handleReminder2h(job: Job<ReminderJob>) { ... }
}
```

**Triggers:** Same as before (booking created, confirmed, payment, reminders, etc.)

---

### Phase 9: CMS & Media (Week 5-6)
**Goal**: Content management with S3-compatible storage

**NestJS Modules:**
- **CMS**: Pages, Blog, Navigation (Draft/Published workflow)
- **Media**: Upload to Cloudflare R2, signed URLs, metadata

**Next.js Integration:**
- Marketing site reads from CMS API (ISR with `revalidate: 60`)
- Preview mode for drafts
- `lib/content.ts` becomes fallback only

---

### Phase 10: Customer Dashboard (Week 6)
**Goal**: Self-service portal in Next.js `(dashboard)` route group

**Pages:**
```
/dashboard              → Overview
/dashboard/appointments → List + filters
/dashboard/appointments/[id] → Detail + cancel/reschedule
/dashboard/pets         → Pet profiles
/dashboard/payments     → History + invoices
/dashboard/notifications→ Notification center
/dashboard/profile      → Settings
```

---

### Phase 11: Audit Logging & Security (Week 6)
**Goal**: Production-grade security

**Audit Interceptor:** Automatically logs mutations
- Login/Logout, Booking CRUD, Payment events, Role changes, CMS changes

**Security:**
- Rate limiting (`@nestjs/throttler`)
- CORS configured for frontend domain
- Helmet.js headers
- File upload validation (type, size, malware scan)
- Secrets in Vault/1Password, never in code

---

### Phase 12: Testing (Week 6-7)
**Goal**: Comprehensive test coverage

| Type | Tools | Scope |
|------|-------|-------|
| Unit | Vitest (frontend) / Jest (backend) | Services, validators, utils |
| Integration | Testcontainers (PostgreSQL) | All NestJS modules |
| E2E | Playwright | Booking, payment, admin flows |
| Contract | Pact or OpenAPI validation | API compatibility |

**Critical Tests:**
- Double booking prevention (concurrent)
- Payment webhook idempotency
- Availability edge cases
- RBAC enforcement
- RTL layout + reduced motion

---

### Phase 13: Production Readiness (Week 7)
**Goal**: Deploy and monitor

**Frontend (Vercel):**
- Static export for marketing
- SSR for booking/dashboard/admin
- ISR for CMS pages

**Backend (Railway/Render/Fly.io):**
- NestJS standalone
- Prisma migrations on deploy
- Health checks

**Infrastructure:**
- PostgreSQL: Neon/Supabase
- Redis: Upstash
- Storage: Cloudflare R2
- Email: SendGrid
- SMS: Kavenegar
- Monitoring: Sentry + Vercel Analytics

---

## Shared Types Strategy (Recommended)

**`libs/shared-types`** - Single source of truth:
```
libs/shared-types/src/
├── enums.ts           # All enums (Role, Species, BookingStatus, etc.)
├── booking.ts         # Booking, TimeSlot, Availability DTOs
├── service.ts         # Service, Veterinarian, Room DTOs
├── customer.ts        # Customer, Pet DTOs
├── payment.ts         # Payment, ZarinPal/IdPay DTOs
├── cms.ts             # CmsPage, Media DTOs
├── auth.ts            # User, JwtPayload, Permissions
└── api.ts             # PaginatedResponse, ApiError, etc.
```

**Usage:**
- NestJS: `import { CreateBookingDto } from '@baran/shared-types'`
- Next.js: `import { Booking, TimeSlot } from '@baran/shared-types'`
- Orval generates API client using these types

---

## Auth Strategy (Recommended)

**NestJS Owns Auth:**
1. `POST /auth/login` → Returns `{ accessToken, user }`, sets `refreshToken` HttpOnly cookie
2. `POST /auth/refresh` → Reads cookie, returns new `accessToken`
3. `POST /auth/logout` → Clears cookie
4. JWT payload: `{ sub, email, role, permissions }`

**Next.js Middleware:**
```typescript
// apps/frontend/src/middleware.ts
export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  
  if (!accessToken && !refreshToken) {
    // Redirect to login or allow public routes
  }
  
  // Verify JWT (jose) or call NestJS /auth/me
  // Add user to request headers for Server Components
}
```

**Server Components:** Read user from headers (set by middleware)
**Client Components:** Use `useAuth()` hook calling `/auth/me`

---

## File Structure (Nx Monorepo)

```
baran-vet-clinic/
├── apps/
│   ├── frontend/                    # Next.js 16
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (marketing)/     # Existing pages
│   │   │   │   ├── (booking)/       # /booking/*
│   │   │   │   ├── (dashboard)/     # /dashboard/*
│   │   │   │   └── admin/           # Refine at /admin
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts    # Orval-generated
│   │   │   │   └── auth.ts
│   │   │   ├── hooks/
│   │   │   └── middleware.ts
│   │   ├── orval.config.ts
│   │   └── package.json
│   │
│   └── backend/                     # NestJS
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/
│       │   ├── config/
│       │   └── modules/
│       │       ├── auth/
│       │       ├── customers/
│       │       ├── pets/
│       │       ├── services/
│       │       ├── veterinarians/
│       │       ├── rooms/
│       │       ├── working-hours/
│       │       ├── blocked-periods/
│       │       ├── availability/
│       │       ├── bookings/
│       │       ├── payments/
│       │       ├── notifications/
│       │       ├── cms/
│       │       ├── media/
│       │       └── audit/
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── libs/
│   ├── shared-types/                # Shared TypeScript types
│   ├── shared-prisma/               # Prisma Client singleton
│   │   ├── src/
│   │   │   └── index.ts             # export { prisma }
│   │   └── prisma/
│   │       └── schema.prisma
│   └── shared-validators/           # Zod schemas
│       └── src/
│           ├── booking/
│           ├── service/
│           ├── customer/
│           └── payment/
│
├── tools/                           # Nx generators, scripts
├── nx.json
├── package.json
├── tsconfig.base.json
└── .env.example
```

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Nx learning curve | Team familiar? Consider simpler Turborepo |
| Type sync between apps | Shared Prisma + OpenAPI + Orval = single source |
| Auth cookie domain issues | Same root domain (baranvet.ir) or subdomain config |
| Deployment complexity | Separate CI/CD pipelines, shared env vars |
| Refine + NestJS integration | Orval data provider handles it |
| Iranian payment testing | Sandbox environments for both gateways |

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 0: Nx + Foundation | 1 week | 1 week |
| 1: Database Schema | 1 week | 2 weeks |
| 2: NestJS Core + Auth | 1 week | 3 weeks |
| 3: Resource APIs | 1.5 weeks | 4.5 weeks |
| 4: Availability Engine | 1 week | 5.5 weeks |
| 5: Booking System | 1.5 weeks | 7 weeks |
| 6: Payments | 1 week | 8 weeks |
| 7: Refine Admin | 1.5 weeks | 9.5 weeks |
| 8: Notifications | 1 week | 10.5 weeks |
| 9: CMS & Media | 1.5 weeks | 12 weeks |
| 10: Customer Dashboard | 1 week | 13 weeks |
| 11: Audit & Security | 1 week | 14 weeks |
| 12: Testing | 1.5 weeks | 15.5 weeks |
| 13: Production | 1 week | 16.5 weeks |

**Total: ~16-17 weeks**

---

## Immediate Next Steps (This Week)

1. **Create Nx workspace** with Next.js + NestJS apps
2. **Migrate existing marketing site** to `apps/frontend`
3. **Set up shared Prisma** in `libs/shared-prisma`
4. **Configure PostgreSQL** (Neon/Supabase) + run first migration
5. **Set up OpenAPI + Orval** for type-safe API client
6. **Implement NestJS Auth module** with JWT
7. **Configure Next.js middleware** for JWT validation

---

## Required Credentials/Decisions Before Starting

- [ ] PostgreSQL provider: **Neon** / Supabase / Railway / Local Docker
- [ ] Redis provider: **Upstash** (recommended for Vercel/serverless)
- [ ] File storage: **Cloudflare R2** / AWS S3 / MinIO
- [ ] Email provider: **SendGrid** / Mailgun / Iranian provider
- [ ] SMS provider: **Kavenegar** / Melipayamak / FarazSMS
- [ ] ZarinPal sandbox merchant ID
- [ ] IdPay sandbox credentials
- [ ] Domain strategy: Same domain (`baranvet.ir`) or subdomain (`api.baranvet.ir` / `admin.baranvet.ir`)

---

*Plan ready for implementation. Awaiting confirmation on infrastructure choices to begin Phase 0.*