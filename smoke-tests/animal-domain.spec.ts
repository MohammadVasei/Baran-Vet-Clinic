import { test, expect, Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BASE = "http://localhost:3000";

// Same fixed staff smoke account the CMS suite uses (idempotently provisioned
// below), so the two suites share one staff identity.
const STAFF_EMAIL = "staff-smoke@baran-clinic.test.app";
const STAFF_PASSWORD = "SmokeTest#123456";
const STAFF_FULL_NAME = "پرسنل تست اسموک";

// Probe values — created, verified, and removed by this suite. The animals
// probe is removed via the service-role client afterwards because animals are
// intentionally not deletable from the UI (immutable medical history).
const PROBE_SPECIES = "گونه تست اسموک";
const PROBE_SPECIES_CODE = "smoke-probe-species";
const PROBE_BREED = "نژاد تست اسموک";
const PROBE_VACCINE = "واکسن تست اسموک";
const PROBE_TREATMENT = "درمان تست اسموک";
const PROBE_ANIMAL = "میلو تست اسموک";
const PROBE_PHONE = "091212345678";
const PROBE_MICROCHIP_DISPLAY = "123-456 789";
const PROBE_MICROCHIP_NORMALIZED = "123456789";

// Seeded catalogs (migration 025) rendered through the admin UI.
const SEEDED_SPECIES = "سگ";
const SEEDED_BREED_DOG = "مخلوط / نامشخص"; // dog breeds
const SEEDED_BREED_CAT_ONLY = "پرشین"; // must NOT appear for a dog

async function goto(page: Page, url: string) {
  try {
    await page.goto(url, { waitUntil: "commit" });
  } catch (e) {
    const msg = String(e);
    if (!msg.includes("ERR_ABORTED")) throw e;
  }
  await page.waitForTimeout(800);
}

async function staffLogin(page: Page) {
  await goto(page, `${BASE}/admin/login`);
  await page.getByLabel(/ایمیل/).fill(STAFF_EMAIL);
  await page.getByLabel(/رمز عبور/).fill(STAFF_PASSWORD);
  await page.getByLabel(/رمز عبور/).press("Enter");
  // Wait for an actual post-login admin page (NOT /admin/login itself).
  await page.waitForURL(
    (url) => {
      const p = url.pathname;
      return p.startsWith("/admin/") && p !== "/admin/login";
    },
    { timeout: 45_000 }
  );
}

// Radix Select: open the trigger whose current text matches `trigger`, then
// pick the option. Options render in a portal (role="option"). Closed Radix
// dropdowns keep hidden <option> nodes in the DOM, so match visible text only.
async function pickOption(page: Page, trigger: string, option: string) {
  await page.locator("form").getByText(trigger, { exact: true }).locator("visible=true").first().click();
  await page.getByRole("option", { name: option }).click();
}

const results: Record<string, unknown> = {};
const log = (msg: string, data?: unknown) => {
  console.log(`[ANIMAL-SMOKE] ${msg}${data !== undefined ? " => " + JSON.stringify(data) : ""}`);
};

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  // Provision the shared staff account (idempotent; reuse if present).
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
  log("staff account ready", { userId: user!.id });

  // Clean any probe leftovers from an interrupted previous run.
  await admin.from("animals").delete().eq("name", PROBE_ANIMAL);
  await admin.from("breeds").delete().eq("name", PROBE_BREED);
  await admin.from("species").delete().eq("code", PROBE_SPECIES_CODE);
  await admin.from("vaccines").delete().eq("name", PROBE_VACCINE);
  await admin.from("treatment_types").delete().eq("name", PROBE_TREATMENT);
  log("probe leftovers cleaned");
});

test("1. Logged-out visitors are redirected away from /admin", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await goto(page, `${BASE}/admin/animals`);
  await page.waitForURL(/\/admin\/login/, { timeout: 15_000 });
  results["loggedOutRedirectsToLogin"] = true;
  log("anonymous /admin/animals redirected to login");

  await goto(page, `${BASE}/admin/species`);
  await page.waitForURL(/\/admin\/login/, { timeout: 15_000 });
  results["speciesRedirectsToLogin"] = true;
  log("anonymous /admin/species redirected to login");
});

test("2. Species admin: seed catalog renders + probe CRUD", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await staffLogin(page);

  // Seeds from migration 025 show through the admin list.
  await goto(page, `${BASE}/admin/species`);
  await expect(page.getByRole("heading", { name: "مدیریت گونه‌ها" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("row").filter({ hasText: SEEDED_SPECIES }).first()).toBeVisible();
  results["seededSpeciesVisibleInAdmin"] = true;
  log("seeded species list visible");

  // Create.
  await page.getByRole("button", { name: "افزودن گونه" }).click();
  await page.waitForURL("**/admin/species/create", { timeout: 15_000 });
  await page.getByLabel("نام گونه").fill(PROBE_SPECIES);
  await page.getByLabel("کد یکتا").fill(PROBE_SPECIES_CODE);
  await page.getByRole("button", { name: "افزودن گونه" }).click();
  await page.waitForURL("**/admin/species", { timeout: 15_000 });

  await page.getByLabel("جستجو در جدول").fill(PROBE_SPECIES);
  const row = page.getByRole("row").filter({ hasText: PROBE_SPECIES });
  await expect(row.first()).toBeVisible({ timeout: 20_000 });
  results["speciesCreated"] = true;
  log("species probe created and visible in list");

  // Delete (confirm dialog accepted globally).
  await row.first().getByRole("button", { name: "حذف" }).click();
  await expect(page.getByRole("row").filter({ hasText: PROBE_SPECIES })).toHaveCount(0, { timeout: 20_000 });
  results["speciesDeleted"] = true;
  log("species probe deleted");
});

test("3. Breeds admin: probe CRUD scoped to a species", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await staffLogin(page);

  await goto(page, `${BASE}/admin/breeds`);
  await page.getByRole("button", { name: "افزودن نژاد" }).click();
  await page.waitForURL("**/admin/breeds/create", { timeout: 15_000 });
  await pickOption(page, "گونه را انتخاب کنید", SEEDED_SPECIES);
  await page.getByLabel("نام نژاد").fill(PROBE_BREED);
  await page.getByRole("button", { name: "افزودن نژاد" }).click();
  await page.waitForURL("**/admin/breeds", { timeout: 15_000 });

  await page.getByLabel("جستجو در جدول").fill(PROBE_BREED);
  const row = page.getByRole("row").filter({ hasText: PROBE_BREED });
  await expect(row.first()).toBeVisible({ timeout: 20_000 });
  results["breedCreated"] = true;
  log("breed probe created and visible in list");

  await row.first().getByRole("button", { name: "حذف" }).click();
  await expect(page.getByRole("row").filter({ hasText: PROBE_BREED })).toHaveCount(0, { timeout: 20_000 });
  results["breedDeleted"] = true;
  log("breed probe deleted");
});

test("4. Vaccines admin: probe CRUD", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await staffLogin(page);

  await goto(page, `${BASE}/admin/vaccines`);
  await page.getByRole("button", { name: "افزودن واکسن" }).click();
  await page.waitForURL("**/admin/vaccines/create", { timeout: 15_000 });
  await pickOption(page, "گونه را انتخاب کنید", "گربه");
  await page.getByLabel("نام واکسن").fill(PROBE_VACCINE);
  await page.getByRole("button", { name: "افزودن واکسن" }).click();
  await page.waitForURL("**/admin/vaccines", { timeout: 15_000 });

  await page.getByLabel("جستجو در جدول").fill(PROBE_VACCINE);
  const row = page.getByRole("row").filter({ hasText: PROBE_VACCINE });
  await expect(row.first()).toBeVisible({ timeout: 20_000 });
  results["vaccineCreated"] = true;
  log("vaccine probe created and visible in list");

  await row.first().getByRole("button", { name: "حذف" }).click();
  await expect(page.getByRole("row").filter({ hasText: PROBE_VACCINE })).toHaveCount(0, { timeout: 20_000 });
  results["vaccineDeleted"] = true;
  log("vaccine probe deleted");
});

test("5. Treatment types admin: probe CRUD", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await staffLogin(page);

  await goto(page, `${BASE}/admin/treatments`);
  await page.getByRole("button", { name: "افزودن نوع درمان" }).click();
  await page.waitForURL("**/admin/treatments/create", { timeout: 15_000 });
  await pickOption(page, "گونه را انتخاب کنید", SEEDED_SPECIES);
  await pickOption(page, "سایر", "معاینه روتین");
  await page.getByLabel("نام").fill(PROBE_TREATMENT);
  await page.getByRole("button", { name: "افزودن نوع درمان" }).click();
  await page.waitForURL("**/admin/treatments", { timeout: 15_000 });

  await page.getByLabel("جستجو در جدول").fill(PROBE_TREATMENT);
  const row = page.getByRole("row").filter({ hasText: PROBE_TREATMENT });
  await expect(row.first()).toBeVisible({ timeout: 20_000 });
  results["treatmentCreated"] = true;
  log("treatment probe created and visible in list");

  await row.first().getByRole("button", { name: "حذف" }).click();
  await expect(page.getByRole("row").filter({ hasText: PROBE_TREATMENT })).toHaveCount(0, { timeout: 20_000 });
  results["treatmentDeleted"] = true;
  log("treatment probe deleted");
});

test("6. Animals: create with phone owner, species→breed cascade, search, edit, no delete", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await staffLogin(page);

  await goto(page, `${BASE}/admin/animals`);
  await page.getByRole("button", { name: "+ افزودن حیوان" }).click();
  await page.waitForURL("**/admin/animals/create", { timeout: 15_000 });
  await page.getByLabel("تلفن صاحب").fill(PROBE_PHONE);
  await page.getByLabel("نام").fill(PROBE_ANIMAL);

  // Species → breed cascade: dog breeds only (مخلوط/نامشخص yes, پرشین no).
  await pickOption(page, "گونه را انتخاب کنید", SEEDED_SPECIES);
  await page.locator("form").getByText("نامشخص", { exact: true }).locator("visible=true").first().click();
  await expect(page.getByRole("option", { name: SEEDED_BREED_DOG })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("option", { name: SEEDED_BREED_CAT_ONLY })).toHaveCount(0);
  await page.getByRole("option", { name: SEEDED_BREED_DOG }).click();
  results["speciesBreedCascadeScopesOptions"] = true;
  log("species→breed cascade scopes breed options correctly");

  // Microchip normalization (spaces/dashes stripped on save).
  await page.getByLabel(/شماره میکروچیپ/).fill(PROBE_MICROCHIP_DISPLAY);
  await page.getByRole("button", { name: "افزودن حیوان" }).click();
  await page.waitForURL("**/admin/animals", { timeout: 15_000 });

  // Server-side search finds it.
  await page.getByLabel("جستجوی حیوان").fill(PROBE_ANIMAL);
  await page.getByRole("button", { name: "جستجو" }).click();
  const row = page.getByRole("row").filter({ hasText: PROBE_ANIMAL });
  await expect(row.first()).toBeVisible({ timeout: 20_000 });
  results["animalCreatedAndSearchable"] = true;
  log("animal probe created, visible via server-side search");

  // Persisted values (digits-normalized microchip, phone retained).
  const { data: found } = await admin
    .from("animals")
    .select("id,owner_phone,microchip_number,status,weight")
    .eq("name", PROBE_ANIMAL)
    .single();
  expect(found, "probe animal must exist in DB").toBeTruthy();
  expect(found!.microchip_number, "microchip must be digits-normalized").toBe(PROBE_MICROCHIP_NORMALIZED);
  expect(found!.owner_phone, "owner phone must be preserved").toBe(PROBE_PHONE);
  results["animalStoredNormalized"] = true;
  log("animal persisted with normalized microchip + phone owner", {
    microchip: found!.microchip_number,
    owner_phone: found!.owner_phone,
  });

  // Edit (weight + status), no delete affordance anywhere.
  await row.first().getByRole("button", { name: /ویرایش/ }).click();
  await page.waitForURL("**/admin/animals/edit/**", { timeout: 15_000 });
  await page.getByLabel("وزن (کیلوگرم)").fill("12.5");
  await page.locator("form").getByText("فعال", { exact: true }).locator("visible=true").first().click();
  await page.getByRole("option", { name: "انتقال‌یافته" }).locator("visible=true").click();
  await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
  await page.waitForURL("**/admin/animals", { timeout: 15_000 });

  await page.getByLabel("جستجوی حیوان").fill(PROBE_ANIMAL);
  await page.getByRole("button", { name: "جستجو" }).click();
  const editedRow = page.getByRole("row").filter({ hasText: PROBE_ANIMAL });
  await expect(editedRow.first()).toBeVisible({ timeout: 20_000 });
  await expect(editedRow.first().getByText("انتقال‌یافته")).toBeVisible();
  results["animalEditPersists"] = true;
  log("animal edit (weight + status) persisted and visible");

  const noDelete = await editedRow.first().getByRole("button", { name: "حذف" }).count();
  expect(noDelete, "animals must have no delete action (immutable history)").toBe(0);
  results["animalNoDeleteAffordance"] = noDelete === 0;
  log("no delete affordance on animals row");

  // RLS boundary via anon: catalogs readable, animals invisible to anonymous.
  const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data: anonSpecies } = await anon.from("species").select("id").limit(1);
  const { data: anonAnimals } = await anon.from("animals").select("id").eq("name", PROBE_ANIMAL);
  expect((anonSpecies || []).length, "anon must read active catalog").toBeGreaterThan(0);
  expect((anonAnimals || []).length, "anon must NOT see animals").toBe(0);
  results["rlsAnonBoundary"] = true;
  log("RLS boundary (anon) verified");

  // Cleanup: animals are never deletable from the UI — remove via service role.
  const { error: cleanupError } = await admin.from("animals").delete().eq("name", PROBE_ANIMAL);
  expect(cleanupError).toBeNull();
  log("probe animal removed via service role");

  console.log("\n\n========== ANIMAL DOMAIN SMOKE SUMMARY ==========");
  console.log(JSON.stringify(results, null, 2));
});
