/**
 * PATCH /api/v1/appointments/[id] — update an appointment's status.
 *
 * PATIENT: may only "cancel" their own appointment (PENDING/CONFIRMED, ≥4h out);
 * a not-owned appointment returns 404 so ownership is never leaked.
 * ADMIN: may confirm, complete, mark no-show, or cancel any appointment.
 * Role is checked server-side (CLAUDE.md §Phase 5).
 */
import { NextResponse } from "next/server";
import { AppointmentStatus, Actor } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appointmentActionSchema } from "@/lib/validation/appointments";
import { ar } from "@/content/ar";

const CANCEL_CUTOFF_MS = 4 * 60 * 60 * 1000;

const ADMIN_TARGET: Record<string, AppointmentStatus> = {
  confirm: AppointmentStatus.CONFIRMED,
  complete: AppointmentStatus.COMPLETED,
  noShow: AppointmentStatus.NO_SHOW,
  cancel: AppointmentStatus.CANCELLED,
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const parsed = appointmentActionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 422 });
  }
  const { action } = parsed.data;
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // --- ADMIN: drive status to any target ------------------------------------
  if (session.user.role === "ADMIN") {
    const status = ADMIN_TARGET[action];
    const cancelling = status === AppointmentStatus.CANCELLED;
    await prisma.appointment.update({
      where: { id },
      data: {
        status,
        cancelledAt: cancelling ? new Date() : null,
        cancelledBy: cancelling ? Actor.ADMIN : null,
      },
    });
    return NextResponse.json({ ok: true, status });
  }

  // --- PATIENT: cancel own, PENDING/CONFIRMED, >= 4h out --------------------
  if (action !== "cancel") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!patient || appointment.patientId !== patient.id) {
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
