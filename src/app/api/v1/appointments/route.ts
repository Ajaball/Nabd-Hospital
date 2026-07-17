import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createAppointmentSchema } from "@/lib/validation/appointment";
import { getDoctorDaySlots } from "@/lib/services/booking";
import { formatISODate } from "@/lib/datetime";
import { created, fail, validationError } from "@/lib/http";
import { ar } from "@/content/ar";

/**
 * POST /api/v1/appointments — book a slot (CLAUDE.md §2.5, all writes via REST).
 *
 * Concurrency is arbitrated by the database, not by application code: we insert
 * and catch the partial-unique-index violation (P2002) → 409. We never
 * "check then insert" to prevent a double-booking — two concurrent requests for
 * the same slot both pass the availability pre-check (which only validates
 * working hours / cutoff / time-off) and race at INSERT, where exactly one wins.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return fail(ar.errors.unauthorized, 401, { code: "UNAUTHENTICATED" });
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!patient) {
    return fail(ar.errors.forbidden, 403, { code: "NOT_A_PATIENT" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(ar.errors.badRequest, 400, { code: "INVALID_JSON" });
  }

  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error, ar.errors.badRequest);
  }
  const input = parsed.data;

  const startsAt = new Date(input.startsAt);
  const now = new Date();
  const dateISO = formatISODate(startsAt);

  const result = await getDoctorDaySlots(input.doctorId, dateISO, now);
  if (!result) {
    return fail(ar.doctors.notFound, 404, { code: "DOCTOR_NOT_FOUND" });
  }
  if (!result.doctor.isAcceptingPatients) {
    return fail(ar.booking.notAccepting, 422, { code: "NOT_ACCEPTING" });
  }

  const slot = result.slots.find(
    (s) => s.startsAt.getTime() === startsAt.getTime(),
  );
  // A slot must exist and be a legitimate bookable time. "booked" is allowed
  // through so the DB index — not this pre-check — resolves the race.
  if (!slot || (slot.reason && slot.reason !== "booked")) {
    return fail(ar.booking.invalidSlot, 422, { code: "INVALID_SLOT" });
  }

  try {
    const appointment = await prisma.$transaction((tx) =>
      tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: result.doctor.id,
          departmentId: result.doctor.departmentId,
          startsAt,
          endsAt: slot.endsAt,
          status: "PENDING",
          reasonAr: input.reasonAr && input.reasonAr.length > 0 ? input.reasonAr : null,
        },
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          status: true,
          reasonAr: true,
          doctor: { select: { fullNameAr: true } },
          department: { select: { nameAr: true } },
          patient: { select: { fileNumber: true } },
        },
      }),
    );

    return created({
      id: appointment.id,
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      status: appointment.status,
      reasonAr: appointment.reasonAr,
      doctorNameAr: appointment.doctor.fullNameAr,
      departmentNameAr: appointment.department.nameAr,
      fileNumber: appointment.patient.fileNumber,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail(ar.booking.conflict, 409, { code: "SLOT_TAKEN" });
    }
    return fail(ar.booking.genericError, 500, { code: "SERVER_ERROR" });
  }
}
