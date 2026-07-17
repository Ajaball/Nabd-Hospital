import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { doctorCreateSchema } from "@/lib/validation/admin";
import { created, fail, validationError, isUniqueViolation } from "@/lib/http";
import { ar } from "@/content/ar";

/** POST /api/v1/doctors — create a doctor (ADMIN). */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(ar.errors.badRequest, 400, { code: "INVALID_JSON" });
  }

  const parsed = doctorCreateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error, ar.errors.badRequest);
  const input = parsed.data;

  const department = await prisma.department.findUnique({
    where: { id: input.departmentId },
    select: { id: true },
  });
  if (!department) {
    return fail(ar.errors.badRequest, 400, { code: "DEPARTMENT_NOT_FOUND" });
  }

  try {
    const doctor = await prisma.doctor.create({
      data: {
        slug: input.slug,
        fullNameAr: input.fullNameAr,
        title: input.title,
        departmentId: input.departmentId,
        bio: input.bio,
        photoUrl: input.photoUrl ? input.photoUrl : null,
        yearsExperience: input.yearsExperience,
        isAcceptingPatients: input.isAcceptingPatients ?? true,
      },
    });
    return created(doctor);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail(ar.dash.common.slugTaken, 409, { code: "SLUG_TAKEN" });
    }
    return fail(ar.errors.serverError, 500, { code: "SERVER_ERROR" });
  }
}
