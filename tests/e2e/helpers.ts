import { expect, type Page } from "@playwright/test";

/** A unique email/national-id per run so registrations never collide. */
export function uniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}
export function uniqueNationalId(): string {
  return (String(Date.now()).slice(-9) + Math.floor(Math.random() * 10)).slice(0, 10);
}

/** Register a fresh patient and land on the portal (auto sign-in). */
export async function registerPatient(page: Page, email: string): Promise<void> {
  await page.goto("/register");
  await page.fill("#fullName", "مريض اختبار");
  await page.fill("#email", email);
  await page.fill("#phone", "0512345678");
  await page.fill("#nationalId", uniqueNationalId());
  await page.fill("#dateOfBirth", "1990-05-15");
  await page.getByRole("button", { name: "ذكر" }).click();
  await page.fill("#password", "Passw0rd!");
  await page.getByRole("button", { name: "إنشاء الحساب" }).click();
  await page.waitForURL("**/my-appointments");
}

/** Sign an existing admin in and land on the dashboard. */
export async function adminLogin(page: Page): Promise<void> {
  await page.goto("/dashboard/login");
  await page.fill("#admin-email", "admin@nabd.example");
  await page.fill("#admin-password", "Admin@12345");
  await page.click("button[type=submit]");
  await page.waitForURL("**/dashboard");
}

/** Walk the booking flow and book the first available slot for a department. */
export async function bookFirstAvailable(
  page: Page,
  deptSlug = "internal-medicine",
): Promise<void> {
  await page.goto(`/book?step=doctor&dept=${deptSlug}`);
  await page.locator('a[href^="/book?step=datetime"]').first().click();
  await page.waitForLoadState("load");
  const slot = page
    .locator("button:not([disabled])", { hasText: /^\d{2}:\d{2}$/ })
    .first();
  await slot.click();
  await page.getByRole("button", { name: "أكّد الحجز" }).click();
  await expect(page.getByText("تم حجز موعدك")).toBeVisible();
}
