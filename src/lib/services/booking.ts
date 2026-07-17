import type { Doctor } from "@prisma/client";
import { prisma } from "@/lib/db";
import { riyadhWallTimeToUtc } from "@/lib/datetime";
import { generateSlots, type Slot } from "@/lib/services/slots";

/**
 * Server-side booking helpers. These load the doctor's schedule and delegate
 * the actual slot math to the pure, unit-tested generateSlots (slots.ts). The
 * concurrency guarantee lives in the DB (partial unique index), not here — the
 * POST route inserts and catches P2002.
 */

// A patient may cancel only up to 4 hours before the appointment (PHASES §4).
export const CANCEL_CUTOFF_MS = 4 * 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Generate the day's slots for a doctor. Returns null if the doctor does not
 * exist. `now` is injected so callers control the clock (and tests can too).
 */
export async function getDoctorDaySlots(
  doctorId: string,
  dateISO: string,
  now: Date,
): Promise<{ doctor: Doctor; slots: Slot[] } | null> {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { availability: true },
  });
  if (!doctor) return null;

  // The Riyadh calendar day expressed as a UTC half-open interval.
  const dayStart = riyadhWallTimeToUtc(dateISO, "00:00");
  const dayEnd = new Date(dayStart.getTime() + DAY_MS);

  const [timeOff, appointments] = await Promise.all([
    prisma.timeOff.findMany({
      where: { doctorId, startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } },
      select: { startsAt: true, endsAt: true },
    }),
    prisma.appointment.findMany({
      where: {
        doctorId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startsAt: { gte: dayStart, lt: dayEnd },
      },
      select: { startsAt: true, endsAt: true },
    }),
  ]);

  const slots = generateSlots({
    availability: doctor.availability.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
      slotMinutes: a.slotMinutes,
    })),
    timeOff,
    existingAppointments: appointments,
    date: dateISO,
    now,
  });

  return { doctor, slots };
}
