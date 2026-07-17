import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Full journeys live in tests/e2e.
 *
 * The managed environment ships a pre-installed Chromium under
 * PLAYWRIGHT_BROWSERS_PATH that may not match the version this @playwright/test
 * pins, so we launch that binary directly rather than downloading (which is
 * blocked). In CI, where `playwright install` provisions the matching browser,
 * this resolver finds nothing and Playwright uses its own default.
 */
function resolveChromium(): string | undefined {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !existsSync(base)) return undefined;
  const dir = readdirSync(base).find((d) => d.startsWith("chromium-"));
  if (!dir) return undefined;
  const bin = path.join(base, dir, "chrome-linux", "chrome");
  return existsSync(bin) ? bin : undefined;
}

const executablePath = resolveChromium();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
