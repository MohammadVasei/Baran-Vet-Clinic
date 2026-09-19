# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guest-buyer.spec.ts >> Guest buyer end-to-end smoke
- Location: smoke-tests/guest-buyer.spec.ts:111:5

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
  17  | // Real products from the live DB (active, in stock). We buy 3 distinct ones.
  18  | // Names must EXACTLY match the DB (Persian zero-width/space-sensitive).
  19  | const PRODUCTS = [
  20  |   { id: "0cd3748b-d3c5-4e97-ae37-9015f66c4785", name: "غذایRoyal Canin گربه بزرگسال", price: 2500000 },
  21  |   { id: "55cbb27a-0410-4c3e-a286-59d494b27600", name: "قلاده ضد بله و کنه سولانو", price: 850000 },
  22  |   { id: "b5971745-384f-4162-8b7a-7fbc83b13eb1", name: "شامپو ضد عفونت مدی‌داک", price: 4500000 },
  23  | ];
  24  | 
  25  | // FIXED smoke credentials. The account is created ONCE via the UI register flow;
  26  | // later runs re-use it (Supabase GoTrue flood-protection rate-limits repeated
  27  | // signups from the same IP — "email rate limit exceeded").
  28  | const EMAIL = "guest-smoke@baran-clinic.test.app";
  29  | const PASSWORD = "SmokeTest#123456";
  30  | const FULL_NAME = "مشتری تست";
  31  | const PHONE = "091212345678"; // 0 + 11 digits = 12 chars (max allowed by schema)
  32  | const ADDRESS = "مشهد، احمدآباد، بلوار بعثت، پلاک ۹۴، واحد ۳";
  33  | 
  34  | // The dev server (Next + Turbopack HMR + a Spline 3D viewer on the home page)
  35  | // can abort the document `load` event, causing page.goto / waitForLoadState to
  36  | // throw net::ERR_ABORTED even though the DOM committed and rendered fine. We
  37  | // treat that as tolerable: navigate to `commit`, settle, and let each assertion
  38  | // wait on real content via locators instead of on the load event.
  39  | async function goto(page: Page, url: string) {
  40  |   try {
> 41  |     await page.goto(url, { waitUntil: "commit" });
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  42  |   } catch (e) {
  43  |     const msg = String(e);
  44  |     if (!msg.includes("ERR_ABORTED")) throw e;
  45  |   }
  46  |   await page.waitForTimeout(800);
  47  | }
  48  | 
  49  | const results: Record<string, unknown> = {};
  50  | const log = (msg: string, data?: unknown) => {
  51  |   console.log(`[SMOKE] ${msg}${data !== undefined ? " => " + JSON.stringify(data) : ""}`);
  52  | };
  53  | 
  54  | test.describe.configure({ mode: "serial" });
  55  | 
  56  | // Resolve the smoke-test account: registered via the real UI on first run,
  57  | // re-used on later runs. Confirms the email admin-side either way.
  58  | // NOTE: Supabase GoTrue rate-limits public signups per-IP ("email rate limit
  59  | // exceeded"); when that strikes, fall back to the service-role creation path
  60  | // (which bypasses it) — mirroring exactly what the UI register form submits.
  61  | async function resolveSmokeUser(page: Page): Promise<string> {
  62  |   const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  63  |   const existing = listData?.users.find((u) => u.email === EMAIL);
  64  | 
  65  |   if (existing) {
  66  |     results["registerViaUi"] = false; // user already existed from a previous run
  67  |     log("smoke user already exists, reusing", { userId: existing.id });
  68  |     return existing.id;
  69  |   }
  70  | 
  71  |   // First run: go through the real "create account" UI.
  72  |   await goto(page, `${BASE}/auth/register`);
  73  |   await page.getByLabel(/نام و نام خانوادگی/).fill(FULL_NAME);
  74  |   await page.getByLabel(/ایمیل/).fill(EMAIL);
  75  |   await page.getByLabel(/رمز عبور/).first().fill(PASSWORD);
  76  |   await page.getByLabel(/تکرار رمز/).fill(PASSWORD);
  77  |   await page.getByRole("button", { name: /ثبت‌نام/ }).click();
  78  | 
  79  |   const success = page.getByText(/حساب کاربری با موفقیت ایجاد شد/);
  80  |   try {
  81  |     await success.waitFor({ state: "visible", timeout: 8000 });
  82  |     results["registerViaUi"] = true;
  83  |     log("registered through the UI register form");
  84  |   } catch {
  85  |     const rateLimited = await page.getByText(/rate limit/i).isVisible().catch(() => false);
  86  |     expect(rateLimited, "register UI should succeed or be rate-limited, not hang").toBe(true);
  87  |     results["registerViaUi"] = "blocked (GoTrue email rate limit)";
  88  |     log("UI register rate-limited; falling back to service-role creation");
  89  |   }
  90  | 
  91  |   // Ensure the user exists (created by the UI, or via fallback), email confirmed.
  92  |   const { data: after } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  93  |   let found = after?.users.find((u) => u.email === EMAIL);
  94  |   if (!found) {
  95  |     const { data, error } = await admin.auth.admin.createUser({
  96  |       email: EMAIL,
  97  |       password: PASSWORD,
  98  |       email_confirm: true,
  99  |       user_metadata: { full_name: FULL_NAME },
  100 |     });
  101 |     expect(error, error?.message).toBeNull();
  102 |     found = data?.user ?? undefined;
  103 |   } else {
  104 |     await admin.auth.admin.updateUserById(found.id, { email_confirm: true });
  105 |   }
  106 |   expect(found, "smoke user should exist after creation").toBeTruthy();
  107 |   log("account ready", { userId: found!.id, EMAIL });
  108 |   return found!.id;
  109 | }
  110 | 
  111 | test("Guest buyer end-to-end smoke", async ({ page }) => {
  112 |   page.on("dialog", (d) => d.accept());
  113 | 
  114 |   // 1. Home page loads
  115 |   await goto(page, BASE);
  116 |   await expect(page).toHaveTitle(/باران/);
  117 |   log("home page loaded", { url: page.url() });
  118 | 
  119 |   // 2. Pet shop catalog loads with products
  120 |   await goto(page, `${BASE}/services/petshop`);
  121 |   const cards = page.locator('article[role="listitem"]');
  122 |   await cards.first().waitFor({ timeout: 15_000 });
  123 |   const cardCount = await cards.count();
  124 |   expect(cardCount).toBeGreaterThanOrEqual(3);
  125 |   log("catalog loaded", { cardCount });
  126 | 
  127 |   // 3. Add-to-cart via the real UI (in-memory add works)
  128 |   await page.waitForTimeout(1500); // let entrance animations settle
  129 |   {
  130 |     const addBtn = page
  131 |       .locator('article[role="listitem"]', { hasText: PRODUCTS[0].name })
  132 |       .getByRole("button", { name: /به سبد خرید/ })
  133 |       .first();
  134 |     await addBtn.click({ timeout: 20_000 });
  135 |     const drawer = page.getByRole("dialog", { name: "سبد خرید" });
  136 |     await drawer.waitFor({ state: "visible", timeout: 10_000 });
  137 |     const hasItem = await drawer.getByText(PRODUCTS[0].name).isVisible().catch(() => false);
  138 |     results["uiAddToCartWorks"] = hasItem;
  139 |     log("ui add-to-cart works (item in drawer)", hasItem);
  140 | 
  141 |     // Finding: drawer X (close) is intercepted by the sticky header on desktop.
```