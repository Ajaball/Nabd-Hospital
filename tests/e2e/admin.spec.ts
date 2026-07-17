import "dotenv/config";
import { test, expect } from "@playwright/test";

import { prisma } from "../../src/lib/db";
import {
  registerPatient,
  bookFirstAvailable,
  adminLogin,
  uniqueEmail,
} from "./helpers";

test.afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * Admin confirms a pending appointment and the change shows in the patient's
 * own view (CLAUDE.md §Phase 7).
 */
test("admin confirms a pending appointment and the patient sees it confirmed", async ({
  browser,
}) => {
  const email = uniqueEmail();

  // Patient: register + book (the new appointment is PENDING).
  const patientCtx = await browser.newContext();
  const patientPage = await patientCtx.newPage();
  await registerPatient(patientPage, email);
  await bookFirstAvailable(patientPage);

  const appt = await prisma.appointment.findFirst({
    where: { patient: { user: { email } }, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  expect(appt).not.toBeNull();

  // Admin: sign in and confirm it.
  const adminCtx = await browser.newContext();
  const adminPage = await adminCtx.newPage();
  await adminLogin(adminPage);
  const res = await adminPage.request.patch(`/api/v1/appointments/${appt!.id}`, {
    data: { action: "confirm" },
  });
  expect(res.status()).toBe(200);

  // Patient reloads and sees the confirmed status.
  await patientPage.goto("/my-appointments");
  await expect(patientPage.getByText("مؤكد").first()).toBeVisible();

  await patientCtx.close();
  await adminCtx.close();
});
