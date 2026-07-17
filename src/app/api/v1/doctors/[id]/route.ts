import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { doctorUpdateSchema } from "@/lib/validation/admin";
import {
  ok,
  fail,
  validationError,
  isUniqueViolation,
  isForeignKeyViolation,
} from "@/lib/http";
import { ar } from "@/content/ar";

/** PATCH /api/v1/doctors/[id] — update a doctor (ADMIN). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(ar.errors.badRequest, 400, { code: "INVALID_JSON" });
  }

  const parsed = doctorUpdateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error, ar.errors.badRequest);
  const { photoUrl, ...rest } = parsed.data;

  try {
    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        ...rest,
        ...(photoUrl !== undefined ? { photoUrl: photoUrl ? photoUrl : null } : {}),
      },
    });
    return ok(doctor);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail(ar.dash.common.slugTaken, 409, { code: "SLUG_TAKEN" });
    }
    return fail(ar.errors.notFound, 404, { code: "NOT_FOUND" });
  }
}

/**
 * DELETE /api/v1/doctors/[id] — blocked when the doctor has future active
 * appointments (PHASES §5). Past appointments also block via the DB restrict
 * constraint, surfaced as the same clear message.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;

  const futureActive = await prisma.appointment.count({
    where: {
      doctorId: id,
      status: { in: ["PENDING", "CONFIRMED"] },
      startsAt: { gte: new Date() },
    },
  });
  if (futureActive > 0) {
    return fail(ar.dash.doctors.deleteBlocked, 409, { code: "DELETE_BLOCKED" });
  }

  try {
    // Availability/time-off cascade; appointments restrict.
    await prisma.doctor.delete({ where: { id } });
    return ok({ id });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return fail(ar.dash.doctors.deleteBlocked, 409, { code: "DELETE_BLOCKED" });
    }
    return fail(ar.errors.notFound, 404, { code: "NOT_FOUND" });
  }
}
