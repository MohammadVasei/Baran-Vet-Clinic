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

// FIXED staff smoke credentials. Provisioned idempotently (auth user +
// staff_users row) via the service-role API before the suite runs; later runs
// reuse the same account so GoTrue signup rate-limits never hit us.
const STAFF_EMAIL = "staff-smoke@baran-clinic.test.app";
const STAFF_PASSWORD = "SmokeTest#123456";
const STAFF_FULL_NAME = "پرسنل تست اسموک";

// Stable strings from the LIVE DB (seeded by scripts/migrate-content.ts).
const CLINIC_PHONE = "۰۵۱-۳۸۴۷-۵۳۷۷";
const SERVICE_GROOMING = "شستشو و اصلاح";
const DOCTOR_TAZIK = /تازیک/;
const DISEASE_PARVO = "پاروویروس سگ";
const CONTACT_ADDRESS = "مشهد، احمدآباد، بلوار بعثت";
const CONTACT_HOURS = "لطفاً قبل از مراجعه تماس بگیرید";

// Probe values — created, verified, and removed by this suite.
const PROBE_DISEASE = "بیماری تست اسموک فاز هفت";
const PROBE_QUOTE = "بازخورد تست اسموک فاز هفت؛ مراقبت عالی از حیوان خانگی‌ام";
const PROBE_HOURS = "تست اسموک: ساعات کاری تغییر کرد و هم‌اکنون بروزرسانی شده";

// The dev server (Next + Turbopack HMR + a Spline 3D viewer on the home page)
// can abort the document `load` event, causing page.goto / waitForLoadState to
// throw net::ERR_ABORTED even though the DOM committed and rendered fine. We
// treat that as tolerable: navigate to `commit`, settle, and let each assertion
// wait on real content via locators instead of on the load event.
async function goto(page: Page, url: string) {
  try {
    await page.goto(url, { waitUntil: "commit" });
  } catch (e) {
    const msg = String(e);
    if (!msg.includes("ERR_ABORTED")) throw e;
  }
  await page.waitForTimeout(800);
}

// Public sections use GSAP revealUp (autoAlpha: 0 -> visible on scroll), so
// elements below the fold register as "hidden" until scrolled into view.
async function expectInView(page: Page, locator: ReturnType<Page["getByText"]>) {
  await locator.first().scrollIntoViewIfNeeded().catch(() => {});
  await expect(locator.first()).toBeVisible();
}

async function staffLogin(page: Page) {
  await goto(page, `${BASE}/admin/login`);
  await page.getByLabel(/ایمیل/).fill(STAFF_EMAIL);
  await page.getByLabel(/رمز عبور/).fill(STAFF_PASSWORD);
  // NOTE: the submit button sits at visibility:hidden (GSAP revealUp on
  // .login-submit never fires), so submit via Enter on the password field.
  await page.getByLabel(/رمز عبور/).press("Enter");
  await page.waitForURL("**/admin", { timeout: 20_000 });
  await expect(page.getByText("هشدارهای مهم").first()).toBeVisible({ timeout: 15_000 });
}

const results: Record<string, unknown> = {};
const log = (msg: string, data?: unknown) => {
  console.log(`[CMS-SMOKE] ${msg}${data !== undefined ? " => " + JSON.stringify(data) : ""}`);
};

test.describe.configure({ mode: "serial" });

// Provision the staff smoke account (auth user + staff_users row) and clear any
// probe leftovers from a previously interrupted run.
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
    .upsert(
      { id: user!.id, role: "staff", full_name: STAFF_FULL_NAME },
      { onConflict: "id" }
    );
  expect(upsertError).toBeNull();
  log("staff account ready", { userId: user!.id, email: STAFF_EMAIL });

  // Idempotent cleanup of probe rows from any interrupted previous run.
  await admin.from("diseases").delete().eq("animal_type", "dog").eq("name", PROBE_DISEASE);
  await admin.from("testimonials").delete().eq("quote", PROBE_QUOTE);
  log("probe leftovers cleaned");
});

test("1. Public pages render CMS content from the database", async ({ page }) => {
  page.on("dialog", (d) => d.accept());

  // Home — clinic/emergency/doctors/services all come from site_content + tables.
  await goto(page, BASE);
  await expect(page).toHaveTitle(/باران/);
  await expect(page.getByText(CLINIC_PHONE).first()).toBeVisible({ timeout: 20_000 });
  await expect(
    page.locator('aside[aria-label="تماس مستقیم با کلینیک"]').getByText(CLINIC_PHONE).first()
  ).toBeVisible();
  await expect(page.getByText(SERVICE_GROOMING).first()).toBeVisible();
  await expect(page.getByText(DOCTOR_TAZIK).first()).toBeVisible();
  results["homeHasCmsContent"] = true;
  log("home renders clinic/services/doctors from CMS");

  // Services page
  await goto(page, `${BASE}/services`);
  await expect(page.getByText(SERVICE_GROOMING).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("درمان").first()).toBeVisible();
  results["servicesPageHasCmsContent"] = true;
  log("services page renders CMS services");

  // Doctors page
  await goto(page, `${BASE}/doctors`);
  await expect(page.getByText(DOCTOR_TAZIK).first()).toBeVisible({ timeout: 20_000 });
  results["doctorsPageHasCmsContent"] = true;
  log("doctors page renders CMS doctors");

  // Common diseases encyclopedia
  await goto(page, `${BASE}/common-diseases`);
  await expectInView(page, page.getByText(DISEASE_PARVO));
  results["diseasesPageHasCmsContent"] = true;
  log("common-diseases renders CMS diseases");

  // Contact page
  await goto(page, `${BASE}/contact`);
  await expectInView(page, page.getByText(CONTACT_ADDRESS));
  await expectInView(page, page.getByText(CONTACT_HOURS));
  results["contactPageHasCmsContent"] = true;
  log("contact renders CMS clinic info");
});

test("2. Diseases CRUD reflects on the public encyclopedia (revalidation)", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await staffLogin(page);

  // Create via the admin UI.
  await goto(page, `${BASE}/admin/diseases`);
  await page.getByRole("button", { name: "افزودن بیماری" }).click();
  await page.waitForURL("**/admin/diseases/create", { timeout: 15_000 });
  await page.getByLabel("نام بیماری").fill(PROBE_DISEASE);
  await page.getByLabel("علائم (هر مورد در یک خط)").fill("تب\nبی‌اشتهایی\nسرفه");
  await page.getByLabel("مراقبت و درمان (هر مورد در یک خط)").fill("مراجعه به دامپزشک\nاستراحت کامل");
  await page.getByRole("button", { name: "افزودن بیماری" }).click();
  await page.waitForURL("**/admin/diseases", { timeout: 15_000 });

  // 55+ rows paginate 10/page — narrow with the table search first.
  await page.getByLabel("جستجو در جدول").fill(PROBE_DISEASE);
  const listRow = page.getByRole("row").filter({ hasText: PROBE_DISEASE });
  await expect(listRow.first()).toBeVisible({ timeout: 20_000 });
  results["diseaseCreatedInAdminList"] = true;
  log("disease created and visible in admin list");

  // Public page picks it up after the revalidate POST (fire-and-forget, polled).
  await expect
    .poll(
      async () => {
        await goto(page, `${BASE}/common-diseases`);
        return page.getByText(PROBE_DISEASE).count();
      },
      { timeout: 30_000, intervals: [2500] }
    )
    .toBeGreaterThan(0);
  results["diseaseVisibleOnPublicAfterCreate"] = true;
  log("disease appeared on /common-diseases after create (revalidation ok)");

  // Delete via the admin UI.
  await goto(page, `${BASE}/admin/diseases`);
  await page.getByLabel("جستجو در جدول").fill(PROBE_DISEASE);
  await page.getByRole("row").filter({ hasText: PROBE_DISEASE }).getByRole("button", { name: "حذف" }).click();
  await expect(page.getByRole("row").filter({ hasText: PROBE_DISEASE })).toHaveCount(0, { timeout: 20_000 });
  results["diseaseDeletedFromAdminList"] = true;
  log("disease deleted from admin list");

  // Public page drops it after revalidation.
  await expect
    .poll(
      async () => {
        await goto(page, `${BASE}/common-diseases`);
        return page.getByText(PROBE_DISEASE).count();
      },
      { timeout: 30_000, intervals: [2500] }
    )
    .toBe(0);
  results["diseaseGoneFromPublicAfterDelete"] = true;
  log("disease gone from /common-diseases after delete (revalidation ok)");
});

test("3. Testimonials CRUD via the admin", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await staffLogin(page);

  await goto(page, `${BASE}/admin/testimonials`);
  await page.getByRole("button", { name: "افزودن بازخورد" }).click();
  await page.waitForURL("**/admin/testimonials/create", { timeout: 15_000 });
  await page.getByLabel("نام مراجعه‌کننده").fill("مراجعه‌کننده تست اسموک");
  await page.getByLabel("متن بازخورد").fill(PROBE_QUOTE);
  await page.getByRole("button", { name: "افزودن بازخورد" }).click();
  await page.waitForURL("**/admin/testimonials", { timeout: 15_000 });

  await page.getByLabel("جستجو در جدول").fill(PROBE_QUOTE);
  const listRow = page.getByRole("row").filter({ hasText: PROBE_QUOTE });
  await expect(listRow.first()).toBeVisible({ timeout: 20_000 });
  results["testimonialCreatedInAdminList"] = true;
  log("testimonial created and visible in admin list");

  await listRow.first().getByRole("button", { name: "حذف" }).click();
  await expect(page.getByRole("row").filter({ hasText: PROBE_QUOTE })).toHaveCount(0, { timeout: 20_000 });
  results["testimonialDeletedFromAdminList"] = true;
  log("testimonial deleted from admin list");
});

test("4. Site-content clinic editor persists + revalidates, then restores", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await staffLogin(page);

  // Capture the real hoursNote so we always restore the exact prior value.
  const { data: row } = await admin
    .from("site_content")
    .select("id,data")
    .eq("key", "clinic")
    .single();
  const originalHoursNote = (row?.data as { hoursNote: string })?.hoursNote ?? "";
  expect(originalHoursNote.length, "clinic hoursNote must exist before mutation").toBeGreaterThan(0);

  const restore = async () => {
    // Idempotent: only touch the DB if the probe is still there.
    const { data: cur } = await admin
      .from("site_content")
      .select("data")
      .eq("key", "clinic")
      .single();
    const curNote = (cur?.data as { hoursNote?: string })?.hoursNote ?? "";
    if (curNote === PROBE_HOURS) {
      const data = { ...(cur!.data as object), hoursNote: originalHoursNote };
      await admin.from("site_content").update({ data }).eq("key", "clinic");
    }
  };

  try {
    // Edit the clinic hoursNote via the structured form.
    await goto(page, `${BASE}/admin/site-content`);
    await page
      .getByRole("row")
      .filter({ hasText: "clinic" })
      .getByRole("link", { name: "ویرایش" })
      .click();
    await page.waitForURL("**/admin/site-content/edit/clinic", { timeout: 15_000 });
    await page.getByLabel("توضیح ساعات کار").fill(PROBE_HOURS);
    await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
    await page.waitForURL("**/admin/site-content", { timeout: 15_000 });
    log("clinic hoursNote saved (probe)");

    // Public home reflects it after the revalidate POST.
    await expect
      .poll(
        async () => {
          await goto(page, BASE);
          return page
            .locator('aside[aria-label="تماس مستقیم با کلینیک"]')
            .getByText(PROBE_HOURS)
            .count();
        },
        { timeout: 30_000, intervals: [2500] }
      )
      .toBeGreaterThan(0);
    results["siteContentChangeVisibleOnPublic"] = true;
    log("probe hoursNote appeared on home appointment CTA (revalidation ok)");

    // Restore via the same UI path (which also revalidates).
    await goto(page, `${BASE}/admin/site-content`);
    await page
      .getByRole("row")
      .filter({ hasText: "clinic" })
      .getByRole("link", { name: "ویرایش" })
      .first()
      .click();
    await page.waitForURL("**/admin/site-content/edit/clinic", { timeout: 15_000 });
    await page.getByLabel("توضیح ساعات کار").fill(originalHoursNote);
    await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
    await page.waitForURL("**/admin/site-content", { timeout: 15_000 });

    await expect
      .poll(
        async () => {
          await goto(page, BASE);
          return page
            .locator('aside[aria-label="تماس مستقیم با کلینیک"]')
            .getByText(PROBE_HOURS)
            .count();
        },
        { timeout: 30_000, intervals: [2500] }
      )
      .toBe(0);
    results["siteContentRestoredOnPublic"] = true;
    log("probe hoursNote removed from home after restore (revalidation ok)");
  } finally {
    await restore();
    const { data: check } = await admin
      .from("site_content")
      .select("data")
      .eq("key", "clinic")
      .single();
    const note = (check?.data as { hoursNote?: string })?.hoursNote ?? "";
    results["clinicHoursNoteMatchesOriginalAfterSuite"] = note === originalHoursNote;
    log("clinic hoursNote final state", { matchesOriginal: note === originalHoursNote });
  }
});

console.log("\n\n========== CMS/ADMIN SMOKE SUMMARY ==========");
console.log(JSON.stringify(results, null, 2));