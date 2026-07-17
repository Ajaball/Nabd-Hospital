import { test, expect } from "@playwright/test";
import {
  apiLogin,
  registerPatient,
  discoverDoctorId,
  firstAvailableSlot,
} from "./utils";

/**
 * The differentiator, as a watchable story: two concurrent booking requests for
 * the exact same doctor + slot resolve to exactly one 201 and one 409 — the
 * database partial unique index arbitrates the race, not application code.
 */
test("two concurrent bookings for one slot → one 201 and one 409", async ({
  page,
  request,
}) => {
  const doctorId = await discoverDoctorId(page, "pediatrics", "noura-alqahtani");
  expect(doctorId).toBeTruthy();

  const patient = await registerPatient(request);
  await apiLogin(request, patient.email, patient.password);

  const startsAt = await firstAvailableSlot(request, doctorId);
  expect(startsAt).toBeTruthy();

  const body = { doctorId, startsAt };
  const [a, b] = await Promise.all([
    request.post("/api/v1/appointments", { data: body }),
    request.post("/api/v1/appointments", { data: body }),
  ]);

  const statuses = [a.status(), b.status()].sort();
  expect(statuses).toEqual([201, 409]);
});
