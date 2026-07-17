/**
 * GET /api/v1/doctors/[id]/slots?date=YYYY-MM-DD — the day's slots for a doctor.
 * A read, so it may be served directly (no auth needed to view availability).
 */
import { NextResponse } from "next/server";

import { loadDoctorDaySlots } from "@/lib/services/booking";
import { dateParamSchema } from "@/lib/validation/appointments";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const date = new URL(request.url).searchParams.get("date");

  const parsed = dateParamSchema.safeParse(date);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_DATE" }, { status: 422 });
  }

  const slots = await loadDoctorDaySlots(id, parsed.data, new Date());
  if (slots === null) {
    return NextResponse.json({ error: "DOCTOR_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    slots: slots.map((s) => ({
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
      isAvailable: s.isAvailable,
      reason: s.reason ?? null,
    })),
  });
}
