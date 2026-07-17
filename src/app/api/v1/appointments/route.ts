/**
 * POST /api/v1/appointments — book an appointment (CLAUDE.md §Phase 4).
 *
 * PATIENT only. The slot is validated against the live generator (working
 * hours, 2-hour cutoff, time-off), then inserted. The double-booking race is
 * caught by the partial unique index (P2002 → 409), never by a pre-check —
 * two concurrent requests for one slot yield exactly one 201 and one 409.
 */
import { NextResponse } from "next/server";
import { Prisma, AppointmentStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadDoctorDaySlots } from "@/lib/services/booking";
import { createAppointmentSchema } from "@/lib/validation/appointments";
import { isoDate } from "@/lib/datetime";
import { ar } from "@/content/ar";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PATIENT") {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: ar.booking.errors.auth },
      { status: 401 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = createAppointmentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { doctorId, startsAt, reasonAr } = parsed.data;

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    select: { id: true, fileNumber: true },
  });
  if (!patient) {
    return NextResponse.json({ error: "NO_PATIENT" }, { status: 403 });
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { department: true },
  });
  if (!doctor) {
    return NextResponse.json({ error: "DOCTOR_NOT_FOUND" }, { status: 404 });
  }

  const start = new Date(startsAt);
  const now = new Date();
  const slots = await loadDoctorDaySlots(doctorId, isoDate(start), now);
  const slot = slots?.find((s) => s.startsAt.getTime() === start.getTime());

  if (!slot) {
    return NextResponse.json(
      { error: "SLOT_UNAVAILABLE", message: ar.booking.errors.slotUnavailable },
      { status: 422 },
    );
  }
  if (!slot.isAvailable) {
    const taken = slot.reason === "booked";
    return NextResponse.json(
      {
        error: taken ? "SLOT_TAKEN" : "SLOT_UNAVAILABLE",
        message: taken
          ? ar.booking.errors.slotTaken
          : ar.booking.errors.slotUnavailable,
      },
      { status: taken ? 409 : 422 },
    );
  }

  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        departmentId: doctor.departmentId,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        status: AppointmentStatus.PENDING,
        reasonAr: reasonAr || null,
      },
      select: { id: true, startsAt: true, endsAt: true, status: true },
    });

    return NextResponse.json(
      {
        ok: true,
        appointment: {
          id: appointment.id,
          startsAt: appointment.startsAt.toISOString(),
          endsAt: appointment.endsAt.toISOString(),
          status: appointment.status,
          fileNumber: patient.fileNumber,
          doctorNameAr: doctor.fullNameAr,
          departmentNameAr: doctor.department.nameAr,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    // Partial unique index rejected a concurrent duplicate booking.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "SLOT_TAKEN", message: ar.booking.errors.slotTaken },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: ar.booking.errors.invalid },
      { status: 500 },
    );
  }
}
