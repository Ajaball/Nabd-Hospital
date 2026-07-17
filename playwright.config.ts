import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config (CLAUDE.md §Phase 7). Runs the built app on port 3200 and drives it
 * with the pre-installed Chromium. Serial (workers: 1) because the tests share
 * one database.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 12_000 },
  reporter: process.env.CI ? "list" : "html",
  use: {
    baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3200",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    launchOptions: {
      executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium",
    },
  },
  webServer: {
    command: "PORT=3200 pnpm start",
    url: "http://127.0.0.1:3200",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
