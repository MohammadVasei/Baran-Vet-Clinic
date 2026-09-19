# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cms-admin.spec.ts >> 1. Public pages render CMS content from the database
- Location: smoke-tests/cms-admin.spec.ts:110:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "commit"

```

# Test source

```ts
  1   | import { test, expect, Page } from "@playwright/test";
  2   | import { createClient } from "@supabase/supabase-js";
  3   | import * as dotenv from "dotenv";
  4   | import * as path from "path";
  5   | 
  6   | dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
  7   | 
  8   | const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  9   | const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  10  | 
  11  | const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  12  |   auth: { persistSession: false, autoRefreshToken: false },
  13  | });
  14  | 
  15  | const BASE = "http://localhost:3000";
  16  | 
  17  | // FIXED staff smoke credentials. Provisioned idempotently (auth user +
  18  | // staff_users row) via the service-role API before the suite runs; later runs
  19  | // reuse the same account so GoTrue signup rate-limits never hit us.
  20  | const STAFF_EMAIL = "staff-smoke@baran-clinic.test.app";
  21  | const STAFF_PASSWORD = "SmokeTest#123456";
  22  | const STAFF_FULL_NAME = "پرسنل تست اسموک";
  23  | 
  24  | // Stable strings from the LIVE DB (seeded by scripts/migrate-content.ts).
  25  | const CLINIC_PHONE = "۰۵۱-۳۸۴۷-۵۳۷۷";
  26  | const SERVICE_GROOMING = "شستشو و اصلاح";
  27  | const DOCTOR_TAZIK = /تازیک/;
  28  | const DISEASE_PARVO = "پاروویروس سگ";
  29  | const CONTACT_ADDRESS = "مشهد، احمدآباد، بلوار بعثت";
  30  | const CONTACT_HOURS = "لطفاً قبل از مراجعه تماس بگیرید";
  31  | 
  32  | // Probe values — created, verified, and removed by this suite.
  33  | const PROBE_DISEASE = "بیماری تست اسموک فاز هفت";
  34  | const PROBE_QUOTE = "بازخورد تست اسموک فاز هفت؛ مراقبت عالی از حیوان خانگی‌ام";
  35  | const PROBE_HOURS = "تست اسموک: ساعات کاری تغییر کرد و هم‌اکنون بروزرسانی شده";
  36  | 
  37  | // The dev server (Next + Turbopack HMR + a Spline 3D viewer on the home page)
  38  | // can abort the document `load` event, causing page.goto / waitForLoadState to
  39  | // throw net::ERR_ABORTED even though the DOM committed and rendered fine. We
  40  | // treat that as tolerable: navigate to `commit`, settle, and let each assertion
  41  | // wait on real content via locators instead of on the load event.
  42  | async function goto(page: Page, url: string) {
  43  |   try {
> 44  |     await page.goto(url, { waitUntil: "commit" });
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  45  |   } catch (e) {
  46  |     const msg = String(e);
  47  |     if (!msg.includes("ERR_ABORTED")) throw e;
  48  |   }
  49  |   await page.waitForTimeout(800);
  50  | }
  51  | 
  52  | // Public sections use GSAP revealUp (autoAlpha: 0 -> visible on scroll), so
  53  | // elements below the fold register as "hidden" until scrolled into view.
  54  | async function expectInView(page: Page, locator: ReturnType<Page["getByText"]>) {
  55  |   await locator.first().scrollIntoViewIfNeeded().catch(() => {});
  56  |   await expect(locator.first()).toBeVisible();
  57  | }
  58  | 
  59  | async function staffLogin(page: Page) {
  60  |   await goto(page, `${BASE}/admin/login`);
  61  |   await page.getByLabel(/ایمیل/).fill(STAFF_EMAIL);
  62  |   await page.getByLabel(/رمز عبور/).fill(STAFF_PASSWORD);
  63  |   // NOTE: the submit button sits at visibility:hidden (GSAP revealUp on
  64  |   // .login-submit never fires), so submit via Enter on the password field.
  65  |   await page.getByLabel(/رمز عبور/).press("Enter");
  66  |   await page.waitForURL("**/admin/services", { timeout: 20_000 });
  67  |   await expect(page.getByText("خدمات").first()).toBeVisible({ timeout: 15_000 });
  68  | }
  69  | 
  70  | const results: Record<string, unknown> = {};
  71  | const log = (msg: string, data?: unknown) => {
  72  |   console.log(`[CMS-SMOKE] ${msg}${data !== undefined ? " => " + JSON.stringify(data) : ""}`);
  73  | };
  74  | 
  75  | test.describe.configure({ mode: "serial" });
  76  | 
  77  | // Provision the staff smoke account (auth user + staff_users row) and clear any
  78  | // probe leftovers from a previously interrupted run.
  79  | test.beforeAll(async () => {
  80  |   const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  81  |   let user = listData?.users.find((u) => u.email === STAFF_EMAIL);
  82  | 
  83  |   if (!user) {
  84  |     const { data, error } = await admin.auth.admin.createUser({
  85  |       email: STAFF_EMAIL,
  86  |       password: STAFF_PASSWORD,
  87  |       email_confirm: true,
  88  |       user_metadata: { full_name: STAFF_FULL_NAME },
  89  |     });
  90  |     expect(error, error?.message).toBeNull();
  91  |     user = data?.user ?? undefined;
  92  |   }
  93  |   expect(user, "staff user must exist after provisioning").toBeTruthy();
  94  | 
  95  |   const { error: upsertError } = await admin
  96  |     .from("staff_users")
  97  |     .upsert(
  98  |       { id: user!.id, role: "staff", full_name: STAFF_FULL_NAME },
  99  |       { onConflict: "id" }
  100 |     );
  101 |   expect(upsertError).toBeNull();
  102 |   log("staff account ready", { userId: user!.id, email: STAFF_EMAIL });
  103 | 
  104 |   // Idempotent cleanup of probe rows from any interrupted previous run.
  105 |   await admin.from("diseases").delete().eq("animal_type", "dog").eq("name", PROBE_DISEASE);
  106 |   await admin.from("testimonials").delete().eq("quote", PROBE_QUOTE);
  107 |   log("probe leftovers cleaned");
  108 | });
  109 | 
  110 | test("1. Public pages render CMS content from the database", async ({ page }) => {
  111 |   page.on("dialog", (d) => d.accept());
  112 | 
  113 |   // Home — clinic/emergency/doctors/services all come from site_content + tables.
  114 |   await goto(page, BASE);
  115 |   await expect(page).toHaveTitle(/باران/);
  116 |   await expect(page.getByText(CLINIC_PHONE).first()).toBeVisible({ timeout: 20_000 });
  117 |   await expect(
  118 |     page.locator('aside[aria-label="تماس مستقیم با کلینیک"]').getByText(CLINIC_PHONE).first()
  119 |   ).toBeVisible();
  120 |   await expect(page.getByText(SERVICE_GROOMING).first()).toBeVisible();
  121 |   await expect(page.getByText(DOCTOR_TAZIK).first()).toBeVisible();
  122 |   results["homeHasCmsContent"] = true;
  123 |   log("home renders clinic/services/doctors from CMS");
  124 | 
  125 |   // Services page
  126 |   await goto(page, `${BASE}/services`);
  127 |   await expect(page.getByText(SERVICE_GROOMING).first()).toBeVisible({ timeout: 20_000 });
  128 |   await expect(page.getByText("درمان").first()).toBeVisible();
  129 |   results["servicesPageHasCmsContent"] = true;
  130 |   log("services page renders CMS services");
  131 | 
  132 |   // Doctors page
  133 |   await goto(page, `${BASE}/doctors`);
  134 |   await expect(page.getByText(DOCTOR_TAZIK).first()).toBeVisible({ timeout: 20_000 });
  135 |   results["doctorsPageHasCmsContent"] = true;
  136 |   log("doctors page renders CMS doctors");
  137 | 
  138 |   // Common diseases encyclopedia
  139 |   await goto(page, `${BASE}/common-diseases`);
  140 |   await expectInView(page, page.getByText(DISEASE_PARVO));
  141 |   results["diseasesPageHasCmsContent"] = true;
  142 |   log("common-diseases renders CMS diseases");
  143 | 
  144 |   // Contact page
```