import { test, expect, Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BASE = "http://localhost:3000";

const STAFF_EMAIL = "staff-smoke@baran-clinic.test.app";
const STAFF_PASSWORD = "SmokeTest#123456";
const STAFF_FULL_NAME = "پرسنل تست اسموک";

async function goto(page: Page, url: string) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
  } catch (e) {
    const msg = String(e);
    if (!msg.includes("ERR_ABORTED")) throw e;
  }
  await page.waitForTimeout(1500);
}

async function staffLogin(page: Page) {
  await goto(page, `${BASE}/admin/login`);
  await page.getByLabel(/ایمیل/).fill(STAFF_EMAIL);
  await page.getByLabel(/رمز عبور/).fill(STAFF_PASSWORD);
  await page.getByLabel(/رمز عبور/).press("Enter");
  await page.waitForURL("**/admin", { timeout: 20_000 });
  await expect(page.getByText("هشدارهای مهم").first()).toBeVisible({ timeout: 15_000 });
}

// Routes without params: pageId -> path
const STATIC_ROUTES: Record<string, string> = {
  dashboard: "/admin",
  "services-list": "/admin/services",
  "service-categories-list": "/admin/service-categories",
  "doctors-list": "/admin/doctors",
  "bookings-list": "/admin/bookings",
  "availability-blocks-list": "/admin/availability-blocks",
  "products-list": "/admin/products",
  "stock-levels-list": "/admin/stock-levels",
  "orders-list": "/admin/orders",
  "diseases-list": "/admin/diseases",
  "testimonials-list": "/admin/testimonials",
  "site-content-list": "/admin/site-content",
  "animals-list": "/admin/animals",
  "breeds-list": "/admin/breeds",
  "vaccines-list": "/admin/vaccines",
  "treatments-list": "/admin/treatments",
  "reminders-list": "/admin/reminders",
  "medical-items-list": "/admin/medical-items",
  "custom-charts-list": "/admin/custom-charts",
  "species-and-breeds-list": "/admin/species-and-breeds",
  "services-create": "/admin/services/create",
  "service-categories-create": "/admin/service-categories/create",
  "doctors-create": "/admin/doctors/create",
  "availability-blocks-create": "/admin/availability-blocks/create",
  "products-create": "/admin/products/create",
  "diseases-create": "/admin/diseases/create",
  "testimonials-create": "/admin/testimonials/create",
  "animals-create": "/admin/animals/create",
  "species-create": "/admin/species/create",
  "breeds-create": "/admin/breeds/create",
  "vaccines-create": "/admin/vaccines/create",
  "treatments-create": "/admin/treatments/create",
};

// Param routes: pageId -> { template, table, keyOrId: "id" | "key" }
const PARAM_ROUTES: Record<string, { template: string; table: string; keyOrId: "id" | "key" }> = {
  "services-edit": { template: "/admin/services/edit/{id}", table: "services", keyOrId: "id" },
  "service-categories-edit": { template: "/admin/service-categories/edit/{id}", table: "service_categories", keyOrId: "id" },
  "doctors-edit": { template: "/admin/doctors/edit/{id}", table: "doctors", keyOrId: "id" },
  "availability-blocks-edit": { template: "/admin/availability-blocks/edit/{id}", table: "availability_blocks", keyOrId: "id" },
  "products-edit": { template: "/admin/products/edit/{id}", table: "products", keyOrId: "id" },
  "stock-levels-edit": { template: "/admin/stock-levels/edit/{id}", table: "products", keyOrId: "id" },
  "diseases-edit": { template: "/admin/diseases/edit/{id}", table: "diseases", keyOrId: "id" },
  "testimonials-edit": { template: "/admin/testimonials/edit/{id}", table: "testimonials", keyOrId: "id" },
  "site-content-edit": { template: "/admin/site-content/edit/{key}", table: "site_content", keyOrId: "key" },
  "animals-edit": { template: "/admin/animals/edit/{id}", table: "animals", keyOrId: "id" },
  "species-edit": { template: "/admin/species/edit/{id}", table: "species", keyOrId: "id" },
  "breeds-edit": { template: "/admin/breeds/edit/{id}", table: "breeds", keyOrId: "id" },
  "vaccines-edit": { template: "/admin/vaccines/edit/{id}", table: "vaccines", keyOrId: "id" },
  "treatments-edit": { template: "/admin/treatments/edit/{id}", table: "treatments", keyOrId: "id" },
  "bookings-edit": { template: "/admin/bookings/edit/{id}", table: "bookings", keyOrId: "id" },
  "services-show": { template: "/admin/services/show/{id}", table: "services", keyOrId: "id" },
  "orders-show": { template: "/admin/orders/show/{id}", table: "orders", keyOrId: "id" },
  "animals-show": { template: "/admin/animals/show/{id}", table: "animals", keyOrId: "id" },
  "animals-record-treatment": { template: "/admin/animals/record-treatment/{id}", table: "animals", keyOrId: "id" },
};

const results: Record<string, unknown> = {};
const log = (msg: string, data?: unknown) => {
  console.log(`[PAGEHELP-SWEEP] ${msg}${data !== undefined ? " => " + JSON.stringify(data) : ""}`);
};

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  let user = listData?.users.find((u) => u.email === STAFF_EMAIL);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: STAFF_EMAIL,
      password: STAFF_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: STAFF_FULL_NAME },
    });
    expect(error, error?.message).toBeNull();
    user = data?.user ?? undefined;
  }
  expect(user, "staff user must exist after provisioning").toBeTruthy();
  const { error: upsertError } = await admin
    .from("staff_users")
    .upsert({ id: user!.id, role: "staff", full_name: STAFF_FULL_NAME }, { onConflict: "id" });
  expect(upsertError).toBeNull();
});

test("Every admin route shows an info icon that opens a populated help dialog", async ({ page }) => {
  test.setTimeout(600_000);
  await staffLogin(page);
  log("logged in, starting sweep");

  // Resolve one param value per table via typed queries (empty tables skipped).
  async function firstParam(table: string): Promise<string | undefined> {
    if (table === "site_content") {
      const { data } = await admin.from("site_content").select("key").limit(1).maybeSingle();
      return (data as { key: string } | null)?.key ?? undefined;
    }
    switch (table) {
      case "services": return (await admin.from("services").select("id").limit(1).maybeSingle()).data?.id;
      case "service_categories": return (await admin.from("service_categories").select("id").limit(1).maybeSingle()).data?.id;
      case "doctors": return (await admin.from("doctors").select("id").limit(1).maybeSingle()).data?.id;
      case "availability_blocks": return (await admin.from("availability_blocks").select("id").limit(1).maybeSingle()).data?.id;
      case "products": return (await admin.from("products").select("id").limit(1).maybeSingle()).data?.id;
      case "diseases": return (await admin.from("diseases").select("id").limit(1).maybeSingle()).data?.id;
      case "testimonials": return (await admin.from("testimonials").select("id").limit(1).maybeSingle()).data?.id;
      case "animals": return (await admin.from("animals").select("id").limit(1).maybeSingle()).data?.id;
      case "species": return (await admin.from("species").select("id").limit(1).maybeSingle()).data?.id;
      case "breeds": return (await admin.from("breeds").select("id").limit(1).maybeSingle()).data?.id;
      case "vaccines": return (await admin.from("vaccines").select("id").limit(1).maybeSingle()).data?.id;
      case "treatments": return (await admin.from("treatments").select("id").limit(1).maybeSingle()).data?.id;
      case "bookings": return (await admin.from("bookings").select("id").limit(1).maybeSingle()).data?.id;
      case "orders": return (await admin.from("orders").select("id").limit(1).maybeSingle()).data?.id;
      default: return undefined;
    }
  }
  const paramValues: Record<string, string> = {};
  for (const def of Object.values(PARAM_ROUTES)) {
    if (paramValues[def.table]) continue;
    const v = await firstParam(def.table);
    if (v) paramValues[def.table] = v;
  }
  log("resolved param values", paramValues);

  const routes: Array<[string, string]> = [
    ...Object.entries(STATIC_ROUTES),
    ...Object.entries(PARAM_ROUTES).flatMap(([pid, def]) => {
      const v = paramValues[def.table];
      if (!v) {
        log(`skipping ${pid}: empty table ${def.table}`);
        return [] as Array<[string, string]>;
      }
      return [[pid, def.template.replace("{id}", v).replace("{key}", v)]] as Array<[string, string]>;
    }),
  ];
  results["totalRoutes"] = routes.length;

  const helpButton = page.getByRole("button", { name: /راهنمای این صفحه/ });

  for (const [pid, pathname] of routes) {
    await goto(page, `${BASE}${pathname}`);

    // The page must actually render its heading (guard against error/redirect).
    const heading = page.getByRole("heading", { level: 1 }).first();
    await heading.waitFor({ state: "visible", timeout: 20_000 });

    // Page-level nav/navigation patterns render more than one button in some pages?— accept the first.
    const btn = helpButton.first();
    await btn.waitFor({ state: "visible", timeout: 10_000 });
    await btn.click();

    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 10_000 });
    const title = dialog.getByRole("heading").first();
    await expect(title).toBeVisible({ timeout: 5_000 });

    // Dialog content must contain the actual explanation text (non-empty).
    const bodyText = await dialog.innerText();
    expect(bodyText.length, `help content for ${pid} should be non-empty`).toBeGreaterThan(60);

    await dialog.getByText("متوجه شدم").click();
    await expect(dialog).toHaveCount(0);
    results[pid] = true;
    log(`✓ ${pid} (${pathname})`);
  }

  console.log("\n\n========== PAGEHELP SWEEP SUMMARY ==========");
  const failures = routes.filter(([pid]) => !results[pid]);
  console.log(JSON.stringify({ total: routes.length, failures }, null, 2));
  expect(failures.length, `all routes must have working help dialogs, failed: ${failures.map((f) => f[0]).join(", ")}`).toBe(0);
});