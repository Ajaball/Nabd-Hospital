/**
 * PUT /api/v1/doctors/[id]/availability — replace a doctor's weekly hours (ADMIN).
 * The whole set is swapped in one transaction.
 */
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-guards";
import { availabilitySchema } from "@/lib/validation/catalog";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const parsed = availabilitySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 422 });
  }
  const { id } = await params;

  const doctor = await prisma.doctor.findUnique({ where: { id }, select: { id: true } });
  if (!doctor) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { doctorId: id } }),
    prisma.availability.createMany({
      data: parsed.data.slots.map((s) => ({ ...s, doctorId: id })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
