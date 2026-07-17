/**
 * PATCH (edit + toggle accepting) and DELETE a doctor (ADMIN).
 * Deleting a doctor who has upcoming appointments is blocked with a clear
 * message (CLAUDE.md §Phase 5); the DB's Restrict on past appointments is the
 * final backstop.
 */
import { NextResponse } from "next/server";
import { Prisma, AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-guards";
import { doctorUpdateSchema } from "@/lib/validation/catalog";
import { ar } from "@/content/ar";

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
  const parsed = doctorUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 422 });
  }
  const { id } = await params;
  try {
    await prisma.doctor.update({ where: { id }, data: parsed.data });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;

  const upcoming = await prisma.appointment.count({
    where: {
      doctorId: id,
      startsAt: { gte: new Date() },
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
    },
  });
  if (upcoming > 0) {
    return NextResponse.json(
      { error: "HAS_FUTURE_APPOINTMENTS", message: ar.admin.doctors.deleteBlocked },
      { status: 409 },
    );
  }

  try {
    await prisma.doctor.delete({ where: { id } });
  } catch (error) {
    // Restrict on historical appointments (P2003) — same clear block message.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { error: "HAS_APPOINTMENTS", message: ar.admin.doctors.deleteBlocked },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
