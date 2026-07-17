/** PATCH /api/v1/departments/[id] — edit, activate/deactivate, or reorder (ADMIN). */
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-guards";
import { departmentUpdateSchema } from "@/lib/validation/catalog";

export async function PATCH(
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
  const parsed = departmentUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 422 });
  }
  const { id } = await params;
  const { move, ...fields } = parsed.data;

  const current = await prisma.department.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Reorder: swap sortOrder with the adjacent department.
  if (move) {
    const neighbor = await prisma.department.findFirst({
      where:
        move === "up"
          ? { sortOrder: { lt: current.sortOrder } }
          : { sortOrder: { gt: current.sortOrder } },
      orderBy: { sortOrder: move === "up" ? "desc" : "asc" },
    });
    if (neighbor) {
      await prisma.$transaction([
        prisma.department.update({
          where: { id: current.id },
          data: { sortOrder: neighbor.sortOrder },
        }),
        prisma.department.update({
          where: { id: neighbor.id },
          data: { sortOrder: current.sortOrder },
        }),
      ]);
    }
    return NextResponse.json({ ok: true });
  }

  await prisma.department.update({ where: { id }, data: fields });
  return NextResponse.json({ ok: true });
}
