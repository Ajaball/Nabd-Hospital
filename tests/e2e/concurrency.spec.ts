import "dotenv/config";
import { test, expect } from "@playwright/test";

import { prisma } from "../../src/lib/db";
import { registerPatient, uniqueEmail } from "./helpers";

type SlotDto = { startsAt: string; isAvailable: boolean };

test.afterAll(async () => {
  await prisma.$disconnect();
});

/** The differentiator (CLAUDE.md §Phase 7): one slot, two POSTs, one 409. */
test("two concurrent bookings of one slot yield one success and one conflict", async ({
  page,
}) => {
  await registerPatient(page, uniqueEmail());

  const doctor = await prisma.doctor.findFirst({
    where: { availability: { some: {} } },
    select: { id: true },
  });
  expect(doctor).not.toBeNull();

  // Find a future day with an available slot.
  let target: string | null = null;
  for (let offset = 3; offset <= 16 && !target; offset++) {
    const date = new Date(Date.now() + offset * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const res = await page.request.get(
      `/api/v1/doctors/${doctor!.id}/slots?date=${date}`,
    );
    const body = (await res.json()) as { slots: SlotDto[] };
    const free = body.slots.find((s) => s.isAvailable);
    if (free) target = free.startsAt;
  }
  expect(target).not.toBeNull();

  const payload = { doctorId: doctor!.id, startsAt: target };
  const [a, b] = await Promise.all([
    page.request.post("/api/v1/appointments", { data: payload }),
    page.request.post("/api/v1/appointments", { data: payload }),
  ]);

  const statuses = [a.status(), b.status()].sort((x, y) => x - y);
  expect(statuses).toEqual([201, 409]);
});
