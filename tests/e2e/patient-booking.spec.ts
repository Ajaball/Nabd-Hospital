import { test, expect } from "@playwright/test";
import { uniqueSuffix, uniqueNationalId } from "./utils";
import { ar } from "../../src/content/ar";

/**
 * The end-to-end patient journey an examiner can watch: register → log in →
 * book an appointment through the three-step flow → see it in the portal →
 * cancel it.
 */
test("patient registers, books, sees, and cancels an appointment", async ({ page }) => {
  const suffix = uniqueSuffix();
  const email = `e2e-ui-${suffix}@example.com`;
  const password = "Str0ngPass1";

  // --- Register ---
  await page.goto("/register");
  await page.getByLabel(ar.auth.fields.fullName).fill("زائر اختبار");
  await page.getByLabel(ar.auth.fields.email).fill(email);
  await page.getByLabel(ar.auth.fields.password).fill(password);
  await page.getByLabel(ar.auth.fields.phone).fill("0501234567");
  await page.getByLabel(ar.auth.fields.nationalId).fill(uniqueNationalId());
  await page.getByLabel(ar.auth.fields.dateOfBirth).fill("1990-01-01");
  await page.getByLabel(ar.auth.fields.gender).selectOption("MALE");
  await page.getByRole("button", { name: ar.auth.register.submit }).click();
  await expect(page).toHaveURL(/\/login\?registered=1/);

  // --- Log in ---
  await page.getByLabel(ar.auth.fields.email).fill(email);
  await page.getByLabel(ar.auth.fields.password).fill(password);
  await page.getByRole("button", { name: ar.auth.login.submit }).click();
  await expect(page).toHaveURL(/\/my-appointments/);

  // --- Book: department → doctor → date + slot ---
  // The three steps are URL-driven; step through them, ending on the
  // interactive date/slot step.
  await page.goto("/book");
  await expect(page.getByRole("heading", { name: ar.booking.chooseDepartment })).toBeVisible();
  await page.goto("/book?step=doctor&dept=pediatrics");
  await expect(page.getByRole("heading", { name: ar.booking.chooseDoctor })).toBeVisible();
  await page.goto("/book?step=datetime&dept=pediatrics&doctor=noura-alqahtani");

  // Pick a date a few days out (guaranteed >2h) then the first free slot.
  const dateButtons = page.locator("button[aria-pressed]");
  await dateButtons.nth(2).click();
  const freeSlot = page.locator('[role="option"]:not([disabled])').first();
  await expect(freeSlot).toBeVisible();
  await freeSlot.click();
  await page.getByRole("button", { name: ar.booking.confirm }).click();

  // --- Confirmation slip ---
  await expect(page.getByText(ar.booking.slip.done)).toBeVisible();

  // --- Portal shows it, then cancel ---
  await page.goto("/my-appointments");
  await expect(page.getByRole("heading", { name: ar.appointments.upcoming })).toBeVisible();
  const cancelBtn = page.getByRole("button", { name: ar.appointments.cancel }).first();
  await expect(cancelBtn).toBeVisible();
  await cancelBtn.click();
  await page
    .getByRole("button", { name: ar.appointments.cancelConfirmAction })
    .click();
  // The success toast confirms the cancellation went through.
  await expect(page.getByText(ar.appointments.cancelSuccess)).toBeVisible();
});
