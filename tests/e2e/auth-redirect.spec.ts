import { test, expect } from "@playwright/test";

/**
 * Story: an unauthenticated visitor cannot reach protected areas; the
 * middleware sends them to the correct login with a callbackUrl.
 */
test.describe("access control redirects", () => {
  test("unauthenticated → /dashboard bounces to the admin login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard\/login\?callbackUrl=/);
  });

  test("unauthenticated → /my-appointments bounces to the patient login", async ({ page }) => {
    await page.goto("/my-appointments");
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  });
});
