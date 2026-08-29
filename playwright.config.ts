import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./smoke-tests",
  timeout: 120_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    locale: "fa-IR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
