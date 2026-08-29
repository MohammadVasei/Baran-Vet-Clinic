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

// Real products from the live DB (active, in stock). We buy 3 distinct ones.
// Names must EXACTLY match the DB (Persian zero-width/space-sensitive).
const PRODUCTS = [
  { id: "0cd3748b-d3c5-4e97-ae37-9015f66c4785", name: "غذایRoyal Canin گربه بزرگسال", price: 2500000 },
  { id: "55cbb27a-0410-4c3e-a286-59d494b27600", name: "قلاده ضد بله و کنه سولانو", price: 850000 },
  { id: "b5971745-384f-4162-8b7a-7fbc83b13eb1", name: "شامپو ضد عفونت مدی‌داک", price: 4500000 },
];

// FIXED smoke credentials. The account is created ONCE via the UI register flow;
// later runs re-use it (Supabase GoTrue flood-protection rate-limits repeated
// signups from the same IP — "email rate limit exceeded").
const EMAIL = "guest-smoke@baran-clinic.test.app";
const PASSWORD = "SmokeTest#123456";
const FULL_NAME = "مشتری تست";
const PHONE = "091212345678"; // 0 + 11 digits = 12 chars (max allowed by schema)
const ADDRESS = "مشهد، احمدآباد، بلوار بعثت، پلاک ۹۴، واحد ۳";

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

const results: Record<string, unknown> = {};
const log = (msg: string, data?: unknown) => {
  console.log(`[SMOKE] ${msg}${data !== undefined ? " => " + JSON.stringify(data) : ""}`);
};

test.describe.configure({ mode: "serial" });

// Resolve the smoke-test account: registered via the real UI on first run,
// re-used on later runs. Confirms the email admin-side either way.
// NOTE: Supabase GoTrue rate-limits public signups per-IP ("email rate limit
// exceeded"); when that strikes, fall back to the service-role creation path
// (which bypasses it) — mirroring exactly what the UI register form submits.
async function resolveSmokeUser(page: Page): Promise<string> {
  const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = listData?.users.find((u) => u.email === EMAIL);

  if (existing) {
    results["registerViaUi"] = false; // user already existed from a previous run
    log("smoke user already exists, reusing", { userId: existing.id });
    return existing.id;
  }

  // First run: go through the real "create account" UI.
  await goto(page, `${BASE}/auth/register`);
  await page.getByLabel(/نام و نام خانوادگی/).fill(FULL_NAME);
  await page.getByLabel(/ایمیل/).fill(EMAIL);
  await page.getByLabel(/رمز عبور/).first().fill(PASSWORD);
  await page.getByLabel(/تکرار رمز/).fill(PASSWORD);
  await page.getByRole("button", { name: /ثبت‌نام/ }).click();

  const success = page.getByText(/حساب کاربری با موفقیت ایجاد شد/);
  try {
    await success.waitFor({ state: "visible", timeout: 8000 });
    results["registerViaUi"] = true;
    log("registered through the UI register form");
  } catch {
    const rateLimited = await page.getByText(/rate limit/i).isVisible().catch(() => false);
    expect(rateLimited, "register UI should succeed or be rate-limited, not hang").toBe(true);
    results["registerViaUi"] = "blocked (GoTrue email rate limit)";
    log("UI register rate-limited; falling back to service-role creation");
  }

  // Ensure the user exists (created by the UI, or via fallback), email confirmed.
  const { data: after } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  let found = after?.users.find((u) => u.email === EMAIL);
  if (!found) {
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: FULL_NAME },
    });
    expect(error, error?.message).toBeNull();
    found = data?.user ?? undefined;
  } else {
    await admin.auth.admin.updateUserById(found.id, { email_confirm: true });
  }
  expect(found, "smoke user should exist after creation").toBeTruthy();
  log("account ready", { userId: found!.id, EMAIL });
  return found!.id;
}

test("Guest buyer end-to-end smoke", async ({ page }) => {
  page.on("dialog", (d) => d.accept());

  // 1. Home page loads
  await goto(page, BASE);
  await expect(page).toHaveTitle(/باران/);
  log("home page loaded", { url: page.url() });

  // 2. Pet shop catalog loads with products
  await goto(page, `${BASE}/services/petshop`);
  const cards = page.locator('article[role="listitem"]');
  await cards.first().waitFor({ timeout: 15_000 });
  const cardCount = await cards.count();
  expect(cardCount).toBeGreaterThanOrEqual(3);
  log("catalog loaded", { cardCount });

  // 3. Add-to-cart via the real UI (in-memory add works)
  await page.waitForTimeout(1500); // let entrance animations settle
  {
    const addBtn = page
      .locator('article[role="listitem"]', { hasText: PRODUCTS[0].name })
      .getByRole("button", { name: /به سبد خرید/ })
      .first();
    await addBtn.click({ timeout: 20_000 });
    const drawer = page.getByRole("dialog", { name: "سبد خرید" });
    await drawer.waitFor({ state: "visible", timeout: 10_000 });
    const hasItem = await drawer.getByText(PRODUCTS[0].name).isVisible().catch(() => false);
    results["uiAddToCartWorks"] = hasItem;
    log("ui add-to-cart works (item in drawer)", hasItem);

    // Finding: drawer X (close) is intercepted by the sticky header on desktop.
    const xBlocked = await page
      .getByRole("button", { name: "بستن سبد خرید" })
      .click({ timeout: 3000, trial: true })
      .then(() => false)
      .catch(() => true);
    results["cartDrawerCloseXBlockedByHeader"] = xBlocked;
    log("drawer close (X) blocked by header", xBlocked);
  }

  // 4. FINDING: the intended "go to cart -> checkout" flow delivers an EMPTY
  //    cart. The drawer's "ادامه به تسویه" button uses window.location.href =
  //    "/checkout" (full page reload), and the CartContext reload-persistence race
  //    wipes the cart on every full page load — so checkout always shows empty.
  await page.getByRole("button", { name: /ادامه به تسویه/ }).click();
  await page.waitForTimeout(1500);
  const checkoutEmpty = await page.getByText("سبد خرید شما خالی است").isVisible().catch(() => false);
  results["checkoutArrivesEmptyAfterAddToCart"] = checkoutEmpty;
  log("checkout page shows EMPTY cart after add-to-cart (bug)", checkoutEmpty);

  // 5. Resolve the account (register via UI on first run / reuse existing)
  const userId = await resolveSmokeUser(page);

  // 6. Login
  await goto(page, `${BASE}/auth/login`);
  await page.getByLabel(/ایمیل/).fill(EMAIL);
  await page.getByLabel(/رمز عبور/).fill(PASSWORD);
  await page.getByRole("button", { name: /ورود/ }).click();
  await page.waitForURL("**/account", { timeout: 20_000 });
  log("logged in", { url: page.url() });

  // 7. Add a delivery address (skip re-adding if a previous run already saved it)
  const { data: savedAddrs } = await admin
    .from("customer_addresses")
    .select("id,address_line")
    .eq("user_id", userId);
  const alreadySaved = !!savedAddrs?.find((a) => a.address_line === ADDRESS);
  results["addressAlreadySavedByPreviousRun"] = alreadySaved;

  await goto(page, `${BASE}/account/addresses`);
  if (!alreadySaved) {
    await page.getByRole("button", { name: /افزودن آدرس/ }).first().click();
    await page.getByLabel(/نام گیرنده/).fill(FULL_NAME);
    await page.getByLabel(/تلفن گیرنده/).fill(PHONE);
    await page.getByLabel(/استان/, { exact: true }).fill("خراسان رضوی");
    await page.getByLabel(/شهر/, { exact: true }).fill("مشهد");
    await page.getByLabel(/آدرس کامل/).fill(ADDRESS);
    await page.getByRole("button", { name: /ذخیره آدرس/ }).click();
  }
  await expect(page.getByText(ADDRESS).first()).toBeVisible({ timeout: 15_000 });
  log("address saved", { alreadySaved });

  // 8. Place the order through the REAL /api/checkout with the 3 items.
  //    (Bypassing the broken client cart — which can never survive navigation —
  //    and calling exactly what the checkout form would submit. This verifies the
  //    real server order pipeline: validation, stock, order + order_items insert.)
  const checkoutRes = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: PRODUCTS.map((p) => ({ productId: p.id, quantity: 1 })),
      customerName: FULL_NAME,
      customerPhone: PHONE,
      customerAddress: ADDRESS,
    }),
  });
  const checkoutBody = await checkoutRes.json();
  results["checkoutHttpStatus"] = checkoutRes.status;
  results["checkoutBody"] = checkoutBody;
  log("real /api/checkout responded", { status: checkoutRes.status, body: checkoutBody });

  // The order is created server-side (status pending) even though the payment
  // gateway call failed (ZARINPAL_MERCHANT_ID empty) — order insert precedes it.
  const { data: orders } = await admin
    .from("orders")
    .select("id,status,total_rial,user_id,customer_phone,zarinpal_authority")
    .eq("customer_phone", `98${PHONE.slice(1)}`)
    .order("created_at", { ascending: false });

  expect(orders && orders.length, "an order should exist for this guest phone").toBeTruthy();
  const order = orders![0];
  results["orderId"] = order.id;
  results["orderStatus"] = order.status;
  results["orderTotal"] = order.total_rial;
  results["orderUserId"] = order.user_id;
  log("order created in DB", order);

  const { data: items } = await admin
    .from("order_items")
    .select("product_id,quantity,unit_price_rial")
    .eq("order_id", order.id);
  results["orderItemCount"] = items?.length;
  expect(items && items.length === 3, "order should have 3 line items").toBeTruthy();
  log("order items count", items?.length);

  // 9. FINDING: the guest order is NOT linked to the logged-in account
  //    automatically — /api/auth/link-orders is orphaned (never called by the
  //    frontend). We call it directly to prove it works; in production a user's
  //    purchased order would NOT appear in "سفارشات من" unless this runs.
  const linkRes = await fetch(`${BASE}/api/auth/link-orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, phone: PHONE }),
  });
  const linkBody = await linkRes.json();
  results["linkOrdersResponse"] = linkBody;
  log("link-orders response", linkBody);

  await goto(page, `${BASE}/account/orders`);
  await expect(page.getByText(/سفارشات من/).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(order.id.slice(0, 8)).first()).toBeVisible({ timeout: 15_000 });
  log("order visible in account orders after manual link");

  console.log("\n\n========== SMOKE TEST SUMMARY ==========");
  console.log(JSON.stringify(results, null, 2));
});