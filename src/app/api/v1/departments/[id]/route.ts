import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { departmentUpdateSchema } from "@/lib/validation/admin";
import {
  ok,
  fail,
  validationError,
  isUniqueViolation,
  isForeignKeyViolation,
} from "@/lib/http";
import { ar } from "@/content/ar";

/** PATCH /api/v1/departments/[id] — update / reorder / activate (ADMIN). */
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

  const parsed = departmentUpdateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error, ar.errors.badRequest);

  try {
    const department = await prisma.department.update({
      where: { id },
      data: parsed.data,
    });
    return ok(department);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail(ar.dash.common.slugTaken, 409, { code: "SLUG_TAKEN" });
    }
    return fail(ar.errors.notFound, 404, { code: "NOT_FOUND" });
  }
}

/** DELETE /api/v1/departments/[id] — blocked if doctors/appointments reference it. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;

  try {
    await prisma.department.delete({ where: { id } });
    return ok({ id });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return fail(ar.dash.departments.deleteBlocked, 409, { code: "DELETE_BLOCKED" });
    }
    return fail(ar.errors.notFound, 404, { code: "NOT_FOUND" });
  }
}
