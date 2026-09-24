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

// Shared staff smoke identity (same account the other admin suites reuse).
const STAFF_EMAIL = "staff-smoke@baran-clinic.test.app";
const STAFF_PASSWORD = "SmokeTest#123456";
const STAFF_FULL_NAME = "پرسنل تست اسموک";

// Probe values — created through the admin UI, verified, and removed from the DB.
// Unit = GRAM with a step grid, then edited to a different grid before ordering.
const PROBE_PRODUCT = "محصول پروب واحد فروش";
const PROBE_PRICE = 1500000;
const PROBE_EMAIL_ISH = "09129999888"; // distinct guest phone for the probe order

async function goto(page: Page, url: string) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
  } catch (e) {
    const msg = String(e);
    if (!msg.includes("ERR_ABORTED")) throw e;
  }
  await page.waitForTimeout(1500);
}

// Same login helper the CMS suite uses (login lands on /admin and the submit
// button is GSAP-hidden, so submit via Enter on the password field).
async function staffLogin(page: Page) {
  await goto(page, `${BASE}/admin/login`);
  await page.getByLabel(/ایمیل/).fill(STAFF_EMAIL);
  await page.getByLabel(/رمز عبور/).fill(STAFF_PASSWORD);
  await page.getByLabel(/رمز عبور/).press("Enter");
  await page.waitForURL("**/admin", { timeout: 20_000 });
  await expect(page.getByText("هشدارهای مهم").first()).toBeVisible({ timeout: 15_000 });
}

// Radix Select: open the trigger whose current text matches `trigger`, then
// pick the option (options live in a portal; role="option").
async function pickOption(page: Page, trigger: string, option: string) {
  await page.locator("form").getByText(trigger, { exact: true }).locator("visible=true").first().click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

// The stock-levels product column is a custom-rendered nested value, so the
// global search can't match it; page through until the row (identified by the
// per-product edit link) is on the visible page.
async function findRowByProductLink(page: Page, productId: string) {
  const link = page.locator(`a[href="/admin/products/edit/${productId}"]`);
  for (let i = 0; i < 6; i++) {
    if ((await link.count()) > 0) break;
    const next = page.getByRole("button", { name: "صفحه بعدی" });
    if (await next.isDisabled()) break;
    await next.click();
    await page.waitForTimeout(400);
  }
  return page.locator("tr").filter({ has: link });
}

// Remove the probe product AND any orders referencing it (order_items has
// ON DELETE RESTRICT to products, order_items order FK cascades) so the
// product can be deleted afterwards.
async function cleanupProbe() {
  const { data: leftovers } = await admin.from("products").select("id").eq("name", PROBE_PRODUCT);
  const ids = (leftovers || []).map((p) => p.id);
  if (ids.length === 0) return;
  const { data: relItems } = await admin.from("order_items").select("order_id").in("product_id", ids);
  const orderIds = [...new Set((relItems || []).map((i) => i.order_id))];
  if (orderIds.length > 0) {
    await admin.from("orders").delete().in("id", orderIds);
  }
  await admin.from("products").delete().in("id", ids);
}

const results: Record<string, unknown> = {};
const log = (msg: string, data?: unknown) => {
  console.log(`[PRODUCTS-ADMIN-SMOKE] ${msg}${data !== undefined ? " => " + JSON.stringify(data) : ""}`);
};

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  // Provision the shared staff account (idempotent).
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

  await cleanupProbe();
  log("staff account ready + probe leftovers cleaned", { userId: user!.id });
});

test("Products admin: selling-unit CRUD, stock-levels, and order-detail units", async ({ page }) => {
  test.setTimeout(240_000);
  page.on("dialog", (d) => d.accept());
  const showSuccessToast = async (text: string) => {
    await page.getByText(text).first().waitFor({ timeout: 10_000 }).catch(() => undefined);
  };

  // 1. Anonymous /admin/products redirects to login.
  await goto(page, `${BASE}/admin/products`);
  await page.waitForURL(/\/admin\/login/, { timeout: 15_000 });
  results["anonymousRedirectsToLogin"] = true;
  log("anonymous /admin/products redirected to login");

  // 2. Staff login.
  await staffLogin(page);
  log("staff logged in", { url: page.url() });

  // 3. Products list renders the "واحد فروش" column with unit labels.
  await goto(page, `${BASE}/admin/products`);
  await expect(page.getByRole("heading", { name: "مدیریت محصولات" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("واحد فروش", { exact: true }).first()).toBeVisible({ timeout: 15_000 });
  results["productListUnitColumn"] = true;
  log("products list shows واحد فروش column");

  // 4. Create a GRAM product with a step grid through the UI.
  await goto(page, `${BASE}/admin/products/create`);
  await page.locator("#product-name").fill(PROBE_PRODUCT);
  await page.locator("#product-description").fill("پروب اسموک واحد فروش — بعداً حذف می‌شود");
  await page.locator("#product-price").fill(String(PROBE_PRICE));
  await pickOption(page, "دسته‌بندی را انتخاب کنید", "دارو");
  await pickOption(page, "عدد", "گرم");
  await page.locator("#product-quantity-step").fill("50");
  await page.locator("#product-min-quantity").fill("100");
  await page.locator("#product-max-quantity").fill("5000");
  await page.getByRole("button", { name: "ایجاد محصول" }).click();
  await page.waitForURL("**/admin/products", { timeout: 15_000 });
  await expect(page.getByText("مدیریت محصولات")).toBeVisible({ timeout: 15_000 });

  // List row shows the probe with a GRAM pill.
  const search = page.getByLabel("جستجو در جدول");
  await search.fill(PROBE_PRODUCT);
  const probeRow = page.locator('table[role="table"] tbody tr').filter({ hasText: PROBE_PRODUCT });
  await expect(probeRow).toBeVisible({ timeout: 15_000 });
  await expect(probeRow.getByText("گرم", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  results["probeCreatedWithGram"] = true;
  log("created probe product, GRAM pill visible in list");

  // Verify creation in the DB.
  const { data: created } = await admin
    .from("products")
    .select("id,selling_unit,quantity_step,min_quantity,max_quantity,price_rial,category,is_active")
    .eq("name", PROBE_PRODUCT)
    .single();
  expect(created, "probe product should exist in DB").toBeTruthy();
  expect(created!.selling_unit).toBe("GRAM");
  expect(created!.quantity_step).toBe(50);
  expect(created!.min_quantity).toBe(100);
  expect(created!.max_quantity).toBe(5000);
  results["dbCreateValues"] = created;
  log("DB record matches form", created);

  // 5. Edit page hydrates the unit fields and persists a new step grid.
  const productId = created!.id;
  await goto(page, `${BASE}/admin/products/edit/${productId}`);
  await expect(page.getByRole("heading", { name: "ویرایش محصول" })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("form").getByText("گرم", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("#product-quantity-step")).toHaveValue("50");
  await expect(page.locator("#product-min-quantity")).toHaveValue("100");
  await expect(page.locator("#product-max-quantity")).toHaveValue("5000");
  results["editHydratesUnitFields"] = true;
  log("edit page hydrated GRAM + step/min/max", { step: "50", min: "100", max: "5000" });

  await page.locator("#product-quantity-step").fill("25");
  await page.locator("#product-min-quantity").fill("150");
  await page.locator("#product-max-quantity").fill("9000");
  await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
  await page.waitForURL("**/admin/products", { timeout: 15_000 });
  await showSuccessToast("ذخیره شد");

  const { data: edited } = await admin
    .from("products")
    .select("selling_unit,quantity_step,min_quantity,max_quantity")
    .eq("id", productId)
    .single();
  expect(edited!.quantity_step).toBe(25);
  expect(edited!.min_quantity).toBe(150);
  expect(edited!.max_quantity).toBe(9000);
  log("edited values persisted", edited);

  // 6. Stock-levels list + edit pages show the unit.
  await goto(page, `${BASE}/admin/stock-levels`);
  await expect(page.getByText("واحد فروش", { exact: true }).first()).toBeVisible({ timeout: 20_000 });
  const stockRow = await findRowByProductLink(page, productId);
  await expect(stockRow).toBeVisible({ timeout: 15_000 });
  await expect(stockRow.getByText("گرم", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  results["stockListUnitVisible"] = true;
  log("stock-levels list shows unit for probe");

  await goto(page, `${BASE}/admin/stock-levels/edit/${productId}`);
  await page.getByText(/موجودی انبار \(گرم\)/).first().waitFor({ timeout: 15_000 });
  results["stockEditUnitLabelVisible"] = true;
  log("stock-levels edit shows unit-aware label");

  // 7. The probe was created with zero stock, so the order ceiling is clamped
//    to 1 — checkout must reject; restock, then order 200g on the new grid.
  const checkoutBody400 = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ productId, quantity: 200 }],
      customerName: "مشتری پروب اسموک",
      customerPhone: PROBE_EMAIL_ISH,
      customerAddress: "مشهد، احمدآباد، خیابان پروب، پلاک ۱",
    }),
  }).then((r) => r.json());
  expect(checkoutBody400.error, JSON.stringify(checkoutBody400)).toContain("حداکثر قابل سفارش");
  results["emptyStockRejectsCheckout"] = checkoutBody400.error;
  log("checkout rejected while stock is empty", checkoutBody400.error);

  const { error: restockError } = await admin
    .from("stock_levels")
    .update({ quantity_on_hand: 500 })
    .eq("product_id", productId);
  expect(restockError).toBeNull();
  results["restocked"] = 500;
  log("restocked probe to 500 گرم");

  const checkoutRes = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ productId, quantity: 200 }],
      customerName: "مشتری پروب اسموک",
      customerPhone: PROBE_EMAIL_ISH,
      customerAddress: "مشهد، احمدآباد، خیابان پروب، پلاک ۱",
    }),
  });
  const checkoutBody = await checkoutRes.json();
  expect(checkoutRes.status, JSON.stringify(checkoutBody)).toBe(200);
  const orderId = checkoutBody.orderId;
  results["checkoutStatus"] = checkoutRes.status;
  results["orderId"] = orderId;
  log("probe order created via /api/checkout", { status: checkoutRes.status, orderId });

  await goto(page, `${BASE}/admin/orders/show/${orderId}`);
  await expect(page.getByText("اقلام سفارش").first()).toBeVisible({ timeout: 15_000 });
  const orderItemRow = page.locator("div.space-y-3").filter({ hasText: PROBE_PRODUCT }).first();
  await expect(orderItemRow.getByText("۲۰۰ گرم")).toBeVisible({ timeout: 10_000 });
  await expect(orderItemRow.getByText("ریال / گرم")).toBeVisible({ timeout: 10_000 });
  results["orderDetailUnitSnapshot"] = true;
  log("admin order detail renders مقدار ۲۰۰ گرم + ریال / گرم");

  // 8. Clean up the probe order + product (service-role).
  await admin.from("orders").delete().eq("id", orderId);
  await admin.from("products").delete().eq("id", productId);
  const { data: gone } = await admin.from("products").select("id").eq("id", productId);
  expect(gone?.length ?? 0).toBe(0);
  results["cleanupComplete"] = true;
  log("probe order + product cleaned up");

  console.log("\n\n========== PRODUCTS-ADMIN SMOKE SUMMARY ==========");
  console.log(JSON.stringify(results, null, 2));
});