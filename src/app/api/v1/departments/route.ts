/** POST /api/v1/departments — create a department (ADMIN). */
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-guards";
import { departmentCreateSchema } from "@/lib/validation/catalog";

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const parsed = departmentCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 422 });
  }

  const last = await prisma.department.findFirst({ orderBy: { sortOrder: "desc" } });
  try {
    const created = await prisma.department.create({
      data: { ...parsed.data, sortOrder: (last?.sortOrder ?? -1) + 1 },
    });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
    }
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
