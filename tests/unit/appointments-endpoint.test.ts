import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { Gender } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * HTTP-level proof of the booking concurrency guarantee (CLAUDE.md §Phase 4
 * gate): two concurrent POSTs at the same slot yield exactly one 201 and one
 * 409. The route's P2002 catch translates the partial unique index rejection
 * into a clean 409 — never a pre-check. Auth is mocked to a PATIENT session so
 * the real handler, service, and database all run.
 */

const tag = `apptest-${Date.now()}`;
let userId: string;
let doctorId: string;
let startsAtIso: string;

// Mock the auth module so the handler sees a logged-in patient.
vi.mock("@/lib/auth", () => ({
  auth: () => Promise.resolve({ user: { id: userId, role: "PATIENT" } }),
}));

async function loadPost() {
  const mod = await import("@/app/api/v1/appointments/route");
  return mod.POST;
}

function postRequest() {
  return new Request("http://localhost/api/v1/appointments", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ doctorId, startsAt: startsAtIso, reasonAr: "متابعة" }),
  });
}

beforeAll(async () => {
  // A slot 10 days out at 08:00 Riyadh (05:00 UTC), well past the 2h cutoff.
  const base = new Date(Date.now() + 10 * 86_400_000);
  const y = base.getUTCFullYear();
  const mo = base.getUTCMonth();
  const d = base.getUTCDate();
  const weekday = new Date(Date.UTC(y, mo, d)).getUTCDay();
  const start = new Date(Date.UTC(y, mo, d, 5, 0)); // 08:00 Riyadh
  startsAtIso = start.toISOString();

  const department = await prisma.department.create({
    data: {
      slug: `${tag}-dept`,
      nameAr: "قسم اختبار",
      descriptionAr: "قسم للاختبار",
      icon: "stethoscope",
      sortOrder: 998,
    },
  });

  const doctor = await prisma.doctor.create({
    data: {
      slug: `${tag}-doc`,
      fullNameAr: "د. اختبار الحجز",
      title: "أخصائي",
      departmentId: department.id,
      bio: "طبيب اختبار",
      availability: {
        create: [{ dayOfWeek: weekday, startTime: "08:00", endTime: "14:00", slotMinutes: 30 }],
      },
    },
  });
  doctorId = doctor.id;

  const user = await prisma.user.create({
    data: {
      email: `${tag}@example.com`,
      passwordHash: "x",
      fullName: "مريض اختبار",
      phone: "+966500000002",
      patient: {
        create: {
          fileNumber: `NB-${tag}`,
          nationalId: `9${String(Date.now()).slice(-9)}`,
          dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
          gender: Gender.MALE,
        },
      },
    },
  });
  userId = user.id;
});

afterAll(async () => {
  await prisma.appointment.deleteMany({ where: { doctorId } });
  await prisma.doctor.deleteMany({ where: { id: doctorId } });
  await prisma.user.deleteMany({ where: { email: `${tag}@example.com` } });
  await prisma.department.deleteMany({ where: { slug: `${tag}-dept` } });
  await prisma.$disconnect();
});

describe("POST /api/v1/appointments concurrency", () => {
  it("two concurrent bookings of one slot yield exactly one 201 and one 409", async () => {
    const POST = await loadPost();
    const [a, b] = await Promise.all([POST(postRequest()), POST(postRequest())]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([201, 409]);

    // Exactly one active appointment persisted for the slot.
    const count = await prisma.appointment.count({
      where: { doctorId, startsAt: new Date(startsAtIso) },
    });
    expect(count).toBe(1);
  });
});
