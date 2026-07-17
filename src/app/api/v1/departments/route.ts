import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { departmentCreateSchema } from "@/lib/validation/admin";
import { created, fail, validationError, isUniqueViolation } from "@/lib/http";
import { ar } from "@/content/ar";

/** POST /api/v1/departments — create a department (ADMIN). */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(ar.errors.badRequest, 400, { code: "INVALID_JSON" });
  }

  const parsed = departmentCreateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error, ar.errors.badRequest);
  const input = parsed.data;

  try {
    const count = await prisma.department.count();
    const department = await prisma.department.create({
      data: {
        slug: input.slug,
        nameAr: input.nameAr,
        descriptionAr: input.descriptionAr,
        icon: input.icon,
        sortOrder: input.sortOrder ?? count,
        isActive: input.isActive ?? true,
      },
    });
    return created(department);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail(ar.dash.common.slugTaken, 409, { code: "SLUG_TAKEN" });
    }
    return fail(ar.errors.serverError, 500, { code: "SERVER_ERROR" });
  }
}
