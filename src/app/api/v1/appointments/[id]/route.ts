import type { AppointmentStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateAppointmentSchema } from "@/lib/validation/appointment";
import { CANCEL_CUTOFF_MS } from "@/lib/services/booking";
import { ok, fail, validationError } from "@/lib/http";
import { ar } from "@/content/ar";

/**
 * PATCH /api/v1/appointments/[id] — status transitions.
 *   PATIENT: may only "cancel" their own PENDING/CONFIRMED appointment ≥4h out.
 *   ADMIN:   may confirm, complete, mark no-show, or cancel any appointment.
 * Authorization is enforced server-side (CLAUDE.md §5).
 */

// Which current statuses each action may transition from.
const ALLOWED_FROM: Record<string, AppointmentStatus[]> = {
  cancel: ["PENDING", "CONFIRMED"],
  confirm: ["PENDING"],
  complete: ["PENDING", "CONFIRMED"],
  no_show: ["PENDING", "CONFIRMED"],
};

const TO_STATUS: Record<string, AppointmentStatus> = {
  cancel: "CANCELLED",
  confirm: "CONFIRMED",
  complete: "COMPLETED",
  no_show: "NO_SHOW",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) {
    return fail(ar.errors.unauthorized, 401, { code: "UNAUTHENTICATED" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(ar.errors.badRequest, 400, { code: "INVALID_JSON" });
  }

  const parsed = updateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error, ar.errors.badRequest);
  }
  const { action } = parsed.data;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      startsAt: true,
      patient: { select: { userId: true } },
    },
  });
  if (!appointment) {
    return fail(ar.errors.notFound, 404, { code: "NOT_FOUND" });
  }

  const isAdmin = session.user.role === "ADMIN";

  // Patients may only cancel their own appointment, and only ≥4h out.
  if (!isAdmin) {
    if (action !== "cancel") {
      return fail(ar.errors.forbidden, 403, { code: "FORBIDDEN" });
    }
    if (appointment.patient.userId !== session.user.id) {
      return fail(ar.errors.forbidden, 403, { code: "FORBIDDEN" });
    }
    if (appointment.startsAt.getTime() - Date.now() < CANCEL_CUTOFF_MS) {
      return fail(ar.appointments.cancelTooLate, 409, { code: "TOO_LATE" });
    }
  }

  if (!ALLOWED_FROM[action].includes(appointment.status)) {
    return fail(ar.appointments.cancelNotAllowed, 409, { code: "INVALID_TRANSITION" });
  }

  const toStatus = TO_STATUS[action];
  const now = new Date();

  await prisma.appointment.update({
    where: { id },
    data:
      toStatus === "CANCELLED"
        ? { status: toStatus, cancelledAt: now, cancelledBy: isAdmin ? "ADMIN" : "PATIENT" }
        : { status: toStatus },
  });

  return ok({ id, status: toStatus });
}
