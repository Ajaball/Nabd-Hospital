import { test, expect } from "@playwright/test";
import {
  apiLogin,
  registerPatient,
  discoverDoctorId,
  firstAvailableSlot,
} from "./utils";
import { ar } from "../../src/content/ar";

/**
 * Story: a patient books (PENDING); an admin confirms it from the dashboard;
 * the patient then sees it as CONFIRMED in their portal.
 */
test("admin confirms a booking and the patient sees it confirmed", async ({
  page,
  request,
  browser,
}) => {
  // A patient books an appointment via the API (starts PENDING).
  const doctorId = await discoverDoctorId(page, "orthopedics", "abdulaziz-alshammari");
  const patient = await registerPatient(request);
  await apiLogin(request, patient.email, patient.password);
  const startsAt = await firstAvailableSlot(request, doctorId);
  expect(startsAt).toBeTruthy();
  const booking = await request.post("/api/v1/appointments", {
    data: { doctorId, startsAt },
  });
  expect(booking.status()).toBe(201);

  // Admin logs in and confirms it from the appointments table.
  await page.goto("/dashboard/login");
  await page.getByLabel(ar.auth.fields.email).fill("admin@nabd.example");
  await page.getByLabel(ar.auth.fields.password).fill("Admin@12345");
  await page.getByRole("button", { name: ar.auth.adminLogin.submit }).click();
  // Reaching the overview heading proves the ADMIN session (a failed login
  // would keep us on /dashboard/login).
  await expect(page.getByRole("heading", { name: ar.dash.overview.title })).toBeVisible();

  await page.goto(`/dashboard/appointments?q=${patient.fileNumber}`);
  const row = page.getByRole("row").filter({ hasText: patient.fileNumber });
  await expect(row).toBeVisible();
  await expect(row.getByText(ar.status.PENDING)).toBeVisible();
  await row.getByRole("button", { name: ar.dash.common.actions }).click();
  await page.getByRole("menuitem", { name: ar.dash.appointments.confirm }).click();
  await expect(row.getByText(ar.status.CONFIRMED)).toBeVisible();

  // The patient sees it as confirmed in their portal (fresh patient → the only
  // appointment they have, so the rendered portal shows the CONFIRMED status).
  const patientContext = await browser.newContext();
  await apiLogin(patientContext.request, patient.email, patient.password);
  const portal = await patientContext.request.get("/my-appointments");
  const html = await portal.text();
  expect(html).toContain(ar.status.CONFIRMED);
  await patientContext.close();
});
