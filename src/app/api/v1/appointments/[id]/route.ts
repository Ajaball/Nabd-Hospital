import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cancelAppointmentSchema } from "@/lib/validation/appointment";
import { CANCEL_CUTOFF_MS } from "@/lib/services/booking";
import { ok, fail, validationError } from "@/lib/http";
import { ar } from "@/content/ar";

/**
 * PATCH /api/v1/appointments/[id] — a patient cancels their own appointment.
 * Allowed only for PENDING/CONFIRMED appointments at least 4 hours out. Admin
 * status transitions are Phase 5.
 */
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

  const parsed = cancelAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error, ar.errors.badRequest);
  }

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
  // Ownership check — never trust the id alone (CLAUDE.md §5: authorization is
  // server-side, per request).
  if (appointment.patient.userId !== session.user.id) {
    return fail(ar.errors.forbidden, 403, { code: "FORBIDDEN" });
  }
  if (appointment.status !== "PENDING" && appointment.status !== "CONFIRMED") {
    return fail(ar.appointments.cancelNotAllowed, 409, { code: "NOT_CANCELLABLE" });
  }

  const now = new Date();
  if (appointment.startsAt.getTime() - now.getTime() < CANCEL_CUTOFF_MS) {
    return fail(ar.appointments.cancelTooLate, 409, { code: "TOO_LATE" });
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED", cancelledAt: now, cancelledBy: "PATIENT" },
  });

  return ok({ id, status: "CANCELLED" });
}
