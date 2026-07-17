import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { availabilitySchema } from "@/lib/validation/admin";
import { ok, fail, validationError } from "@/lib/http";
import { ar } from "@/content/ar";

/**
 * PUT /api/v1/doctors/[id]/availability — replace a doctor's weekly availability
 * wholesale (ADMIN). Done in a transaction so the grid is never half-applied.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!doctor) return fail(ar.errors.notFound, 404, { code: "NOT_FOUND" });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(ar.errors.badRequest, 400, { code: "INVALID_JSON" });
  }

  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error, ar.errors.badRequest);

  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { doctorId: id } }),
    prisma.availability.createMany({
      data: parsed.data.availability.map((a) => ({
        doctorId: id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        slotMinutes: a.slotMinutes,
      })),
    }),
  ]);

  return ok({ id, count: parsed.data.availability.length });
}
