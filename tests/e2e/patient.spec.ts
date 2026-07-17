import { test, expect } from "@playwright/test";

import { registerPatient, bookFirstAvailable, uniqueEmail } from "./helpers";

/** The core patient journey (CLAUDE.md §Phase 7). */
test("patient registers, books, sees the appointment, and cancels it", async ({
  page,
}) => {
  await registerPatient(page, uniqueEmail());

  await bookFirstAvailable(page);

  await page.goto("/my-appointments");
  await expect(page.getByRole("heading", { name: "القادمة" })).toBeVisible();

  await page.getByRole("button", { name: "إلغاء الموعد" }).first().click();
  await page.getByRole("button", { name: "نعم، ألغِ الموعد" }).first().click();

  // Toast confirms and the badge flips to cancelled.
  await expect(page.getByText("تم إلغاء الموعد")).toBeVisible();
  await expect(page.getByText("ملغي").first()).toBeVisible();
});
