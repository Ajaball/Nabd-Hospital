/**
 * Booking reads (CLAUDE.md §Phase 4). Wraps the pure slot generator with the
 * database queries it needs: a doctor's availability, time-off, and the active
 * appointments on the target Riyadh day. Server Components and the slots
 * endpoint both use this; the actual booking write stays in the REST handler.
 */
import { AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { generateSlots, type Slot } from "@/lib/services/slots";

/** UTC bounds [start, end) of a Riyadh calendar date. Riyadh is UTC+3. */
function riyadhDayBoundsUtc(date: string): { start: Date; end: Date } {
  const [y, m, d] = date.split("-").map(Number);
  return {
    start: new Date(Date.UTC(y, m - 1, d, -3, 0)),
    end: new Date(Date.UTC(y, m - 1, d + 1, -3, 0)),
  };
}

/**
 * The day's slots for a doctor, or null if the doctor does not exist. Active
 * (PENDING/CONFIRMED) appointments on the day are subtracted; the pure
 * generator applies the working-hours, cutoff, and time-off rules.
 */
export async function loadDoctorDaySlots(
  doctorId: string,
  date: string,
  now: Date,
): Promise<Slot[] | null> {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { availability: true, timeOff: true },
  });
  if (!doctor) return null;

  const { start, end } = riyadhDayBoundsUtc(date);
  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      startsAt: { gte: start, lt: end },
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
    },
    select: { startsAt: true, endsAt: true, status: true },
  });

  return generateSlots({
    availability: doctor.availability,
    timeOff: doctor.timeOff,
    existingAppointments: appointments,
    date,
    now,
  });
}

/**
 * A patient's appointments (newest first) with doctor + department names, keyed
 * off the auth user id. Returns null if the user has no patient record.
 */
export async function getPatientAppointmentsByUser(userId: string) {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true, fileNumber: true },
  });
  if (!patient) return null;

  const appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id },
    orderBy: { startsAt: "desc" },
    include: {
      doctor: { select: { fullNameAr: true, title: true } },
      department: { select: { nameAr: true } },
    },
  });

  return { fileNumber: patient.fileNumber, appointments };
}
