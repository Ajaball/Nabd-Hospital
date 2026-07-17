/**
 * PATCH /api/v1/appointments/[id] — cancel an appointment (CLAUDE.md §Phase 4).
 *
 * PATIENT only, and only their own appointment: PENDING or CONFIRMED, at least
 * 4 hours out. A not-owned appointment returns 404 so ownership is never leaked.
 */
import { NextResponse } from "next/server";
import { AppointmentStatus, Actor } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cancelAppointmentSchema } from "@/lib/validation/appointments";
import { ar } from "@/content/ar";

const CANCEL_CUTOFF_MS = 4 * 60 * 60 * 1000;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const parsed = cancelAppointmentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 422 });
  }

  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!patient) {
    return NextResponse.json({ error: "NO_PATIENT" }, { status: 403 });
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  // Not found or not owned → 404 (never reveal another patient's appointment).
  if (!appointment || appointment.patientId !== patient.id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const cancellable =
    appointment.status === AppointmentStatus.PENDING ||
    appointment.status === AppointmentStatus.CONFIRMED;
  const farEnoughOut =
    appointment.startsAt.getTime() - Date.now() >= CANCEL_CUTOFF_MS;

  if (!cancellable || !farEnoughOut) {
    return NextResponse.json(
      { error: "NOT_CANCELLABLE", message: ar.appointments.cannotCancel },
      { status: 409 },
    );
  }

  await prisma.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelledBy: Actor.PATIENT,
    },
  });

  return NextResponse.json({ ok: true, status: AppointmentStatus.CANCELLED });
}
