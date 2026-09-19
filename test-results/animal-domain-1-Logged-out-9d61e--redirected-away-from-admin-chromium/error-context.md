# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: animal-domain.spec.ts >> 1. Logged-out visitors are redirected away from /admin
- Location: smoke-tests/animal-domain.spec.ts:112:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/admin/animals
Call log:
  - navigating to "http://localhost:3000/admin/animals", waiting until "commit"

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
  10  | const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  11  | 
  12  | const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  13  |   auth: { persistSession: false, autoRefreshToken: false },
  14  | });
  15  | 
  16  | const BASE = "http://localhost:3000";
  17  | 
  18  | // Same fixed staff smoke account the CMS suite uses (idempotently provisioned
  19  | // below), so the two suites share one staff identity.
  20  | const STAFF_EMAIL = "staff-smoke@baran-clinic.test.app";
  21  | const STAFF_PASSWORD = "SmokeTest#123456";
  22  | const STAFF_FULL_NAME = "پرسنل تست اسموک";
  23  | 
  24  | // Probe values — created, verified, and removed by this suite. The animals
  25  | // probe is removed via the service-role client afterwards because animals are
  26  | // intentionally not deletable from the UI (immutable medical history).
  27  | const PROBE_SPECIES = "گونه تست اسموک";
  28  | const PROBE_SPECIES_CODE = "smoke-probe-species";
  29  | const PROBE_BREED = "نژاد تست اسموک";
  30  | const PROBE_VACCINE = "واکسن تست اسموک";
  31  | const PROBE_TREATMENT = "درمان تست اسموک";
  32  | const PROBE_ANIMAL = "میلو تست اسموک";
  33  | const PROBE_PHONE = "091212345678";
  34  | const PROBE_MICROCHIP_DISPLAY = "123-456 789";
  35  | const PROBE_MICROCHIP_NORMALIZED = "123456789";
  36  | 
  37  | // Seeded catalogs (migration 025) rendered through the admin UI.
  38  | const SEEDED_SPECIES = "سگ";
  39  | const SEEDED_BREED_DOG = "مخلوط / نامشخص"; // dog breeds
  40  | const SEEDED_BREED_CAT_ONLY = "پرشین"; // must NOT appear for a dog
  41  | 
  42  | async function goto(page: Page, url: string) {
  43  |   try {
> 44  |     await page.goto(url, { waitUntil: "commit" });
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/admin/animals
  45  |   } catch (e) {
  46  |     const msg = String(e);
  47  |     if (!msg.includes("ERR_ABORTED")) throw e;
  48  |   }
  49  |   await page.waitForTimeout(800);
  50  | }
  51  | 
  52  | async function staffLogin(page: Page) {
  53  |   await goto(page, `${BASE}/admin/login`);
  54  |   await page.getByLabel(/ایمیل/).fill(STAFF_EMAIL);
  55  |   await page.getByLabel(/رمز عبور/).fill(STAFF_PASSWORD);
  56  |   await page.getByLabel(/رمز عبور/).press("Enter");
  57  |   // Wait for an actual post-login admin page (NOT /admin/login itself).
  58  |   await page.waitForURL(
  59  |     (url) => {
  60  |       const p = url.pathname;
  61  |       return p.startsWith("/admin/") && p !== "/admin/login";
  62  |     },
  63  |     { timeout: 45_000 }
  64  |   );
  65  | }
  66  | 
  67  | // Radix Select: open the trigger whose current text matches `trigger`, then
  68  | // pick the option. Options render in a portal (role="option"). Closed Radix
  69  | // dropdowns keep hidden <option> nodes in the DOM, so match visible text only.
  70  | async function pickOption(page: Page, trigger: string, option: string) {
  71  |   await page.locator("form").getByText(trigger, { exact: true }).locator("visible=true").first().click();
  72  |   await page.getByRole("option", { name: option }).click();
  73  | }
  74  | 
  75  | const results: Record<string, unknown> = {};
  76  | const log = (msg: string, data?: unknown) => {
  77  |   console.log(`[ANIMAL-SMOKE] ${msg}${data !== undefined ? " => " + JSON.stringify(data) : ""}`);
  78  | };
  79  | 
  80  | test.describe.configure({ mode: "serial" });
  81  | 
  82  | test.beforeAll(async () => {
  83  |    // Provision the shared staff account (idempotent; reuse if present).
  84  | const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  85  |     let user = (listData as any)?.users?.find((u: { email?: string }) => u.email === STAFF_EMAIL);
  86  |    if (!user) {
  87  |     const { data, error } = await admin.auth.admin.createUser({
  88  |       email: STAFF_EMAIL,
  89  |       password: STAFF_PASSWORD,
  90  |       email_confirm: true,
  91  |       user_metadata: { full_name: STAFF_FULL_NAME },
  92  |     });
  93  |     expect(error, error?.message).toBeNull();
  94  |     user = data?.user ?? undefined;
  95  |   }
  96  |   expect(user, "staff user must exist after provisioning").toBeTruthy();
  97  |   const { error: upsertError } = await admin
  98  |     .from("staff_users")
  99  |     .upsert({ id: user!.id, role: "staff", full_name: STAFF_FULL_NAME }, { onConflict: "id" });
  100 |   expect(upsertError).toBeNull();
  101 |   log("staff account ready", { userId: user!.id });
  102 | 
  103 |   // Clean any probe leftovers from an interrupted previous run.
  104 |   await admin.from("animals").delete().eq("name", PROBE_ANIMAL);
  105 |   await admin.from("breeds").delete().eq("name", PROBE_BREED);
  106 |   await admin.from("species").delete().eq("code", PROBE_SPECIES_CODE);
  107 |   await admin.from("vaccines").delete().eq("name", PROBE_VACCINE);
  108 |   await admin.from("treatment_types").delete().eq("name", PROBE_TREATMENT);
  109 |   log("probe leftovers cleaned");
  110 | });
  111 | 
  112 | test("1. Logged-out visitors are redirected away from /admin", async ({ page }) => {
  113 |   page.on("dialog", (d) => d.accept());
  114 |   await goto(page, `${BASE}/admin/animals`);
  115 |   await page.waitForURL(/\/admin\/login/, { timeout: 15_000 });
  116 |   results["loggedOutRedirectsToLogin"] = true;
  117 |   log("anonymous /admin/animals redirected to login");
  118 | 
  119 |   await goto(page, `${BASE}/admin/species`);
  120 |   await page.waitForURL(/\/admin\/login/, { timeout: 15_000 });
  121 |   results["speciesRedirectsToLogin"] = true;
  122 |   log("anonymous /admin/species redirected to login");
  123 | });
  124 | 
  125 | test("2. Species admin: seed catalog renders + probe CRUD", async ({ page }) => {
  126 |   page.on("dialog", (d) => d.accept());
  127 |   await staffLogin(page);
  128 | 
  129 |   // Seeds from migration 025 show through the admin list.
  130 |   await goto(page, `${BASE}/admin/species`);
  131 |   await expect(page.getByRole("heading", { name: "مدیریت گونه‌ها" })).toBeVisible({ timeout: 20_000 });
  132 |   await expect(page.getByRole("row").filter({ hasText: SEEDED_SPECIES }).first()).toBeVisible();
  133 |   results["seededSpeciesVisibleInAdmin"] = true;
  134 |   log("seeded species list visible");
  135 | 
  136 |   // Create.
  137 |   await page.getByRole("button", { name: "افزودن گونه" }).click();
  138 |   await page.waitForURL("**/admin/species/create", { timeout: 15_000 });
  139 |   await page.getByLabel("نام گونه").fill(PROBE_SPECIES);
  140 |   await page.getByLabel("کد یکتا").fill(PROBE_SPECIES_CODE);
  141 |   await page.getByRole("button", { name: "افزودن گونه" }).click();
  142 |   await page.waitForURL("**/admin/species", { timeout: 15_000 });
  143 | 
  144 |   await page.getByLabel("جستجو در جدول").fill(PROBE_SPECIES);
```