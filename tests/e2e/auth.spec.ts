import { test, expect } from "@playwright/test";

/** Middleware gates the protected areas (CLAUDE.md §Phase 7). */
test("unauthenticated user is redirected from /dashboard to the admin login", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard\/login/);
});

test("unauthenticated user is redirected from /my-appointments to the patient login", async ({
  page,
}) => {
  await page.goto("/my-appointments");
  await expect(page).toHaveURL(/\/login/);
});
