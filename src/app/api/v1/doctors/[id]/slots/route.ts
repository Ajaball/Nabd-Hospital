import { NextRequest } from "next/server";
import { getDoctorDaySlots } from "@/lib/services/booking";
import { dateParamSchema } from "@/lib/validation/appointment";
import { ok, fail } from "@/lib/http";
import { ar } from "@/content/ar";

/**
 * GET /api/v1/doctors/[id]/slots?date=YYYY-MM-DD — the day's slots for a doctor.
 * Public: booking is a public flow up to the confirm step. Taken/past slots are
 * returned with isAvailable=false and a reason so the UI can disable, not hide.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const dateRaw = request.nextUrl.searchParams.get("date");

  const parsed = dateParamSchema.safeParse(dateRaw);
  if (!parsed.success) {
    return fail(ar.errors.badRequest, 400, { code: "INVALID_DATE" });
  }

  const result = await getDoctorDaySlots(id, parsed.data, new Date());
  if (!result) {
    return fail(ar.doctors.notFound, 404, { code: "DOCTOR_NOT_FOUND" });
  }

  return ok({
    date: parsed.data,
    doctorId: id,
    isAcceptingPatients: result.doctor.isAcceptingPatients,
    slots: result.slots.map((s) => ({
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
      isAvailable: s.isAvailable,
      reason: s.reason ?? null,
    })),
  });
}
