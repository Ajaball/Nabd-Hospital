import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { Session } from "next-auth";
import { Gender } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatISODate, riyadhWallTimeToUtc } from "@/lib/datetime";

/**
 * End-to-end concurrency test for the booking endpoint (PHASES §4 gate): two
 * concurrent POSTs for the same doctor + slot must produce exactly one 201 and
 * one 409. The 409 comes from the DB partial unique index (P2002), not from an
 * application-level check — this is the race the oral defense is built around.
 */

// Mock the auth session so the route sees a logged-in patient.
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
import { auth } from "@/lib/auth";
import { POST } from "@/app/api/v1/appointments/route";

const tag = `bookconf-${Date.now()}`;
let doctorId: string;
let userId: string;
let slotISO: string;

function req(body: unknown): Request {
  return new Request("http://localhost/api/v1/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  const department = await prisma.department.create({
    data: {
      slug: `${tag}-dept`,
      nameAr: "قسم اختبار الحجز",
      descriptionAr: "قسم لاختبار التزامن",
      icon: "stethoscope",
      sortOrder: 999,
    },
  });

  // A slot 10 days out, at 09:00 Riyadh, on that date's weekday.
  const base = new Date(Date.now() + 10 * 86400000);
  const dateISO = formatISODate(base);
  const [y, m, d] = dateISO.split("-").map((n) => Number.parseInt(n, 10));
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  slotISO = riyadhWallTimeToUtc(dateISO, "09:00").toISOString();

  const doctor = await prisma.doctor.create({
    data: {
      slug: `${tag}-doc`,
      fullNameAr: "د. اختبار التزامن",
      title: "أخصائي",
      departmentId: department.id,
      bio: "طبيب اختبار",
      isAcceptingPatients: true,
      availability: {
        create: [
          { dayOfWeek: weekday, startTime: "09:00", endTime: "12:00", slotMinutes: 30 },
        ],
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
          nationalId: `9${Date.now()}`,
          dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
          gender: Gender.MALE,
        },
      },
    },
  });
  userId = user.id;

  const session: Session = {
    user: { id: userId, role: "PATIENT", name: "مريض اختبار", email: `${tag}@example.com` },
    expires: "2099-01-01T00:00:00.000Z",
  };
  // `auth` is an overloaded export; cast the mock to a simple resolver.
  (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(session);
});

afterAll(async () => {
  await prisma.appointment.deleteMany({ where: { doctorId } });
  await prisma.availability.deleteMany({ where: { doctorId } });
  await prisma.doctor.deleteMany({ where: { id: doctorId } });
  await prisma.user.deleteMany({ where: { email: `${tag}@example.com` } });
  await prisma.department.deleteMany({ where: { slug: `${tag}-dept` } });
  await prisma.$disconnect();
});

describe("POST /api/v1/appointments — concurrency", () => {
  it("books a valid slot (201) and returns the slip payload", async () => {
    // Use a distinct slot so this test is independent of the race test.
    const soloISO = riyadhWallTimeToUtc(formatISODate(new Date(Date.now() + 10 * 86400000)), "09:30").toISOString();
    const res = await POST(req({ doctorId, startsAt: soloISO }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.fileNumber).toBe(`NB-${tag}`);
    expect(json.data.status).toBe("PENDING");
  });

  it("under two concurrent POSTs for one slot, exactly one 201 and one 409", async () => {
    const [a, b] = await Promise.all([
      POST(req({ doctorId, startsAt: slotISO })),
      POST(req({ doctorId, startsAt: slotISO })),
    ]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([201, 409]);
  });

  it("rejects an invalid (non-slot) time with 422", async () => {
    const badISO = riyadhWallTimeToUtc(formatISODate(new Date(Date.now() + 10 * 86400000)), "09:07").toISOString();
    const res = await POST(req({ doctorId, startsAt: badISO }));
    expect(res.status).toBe(422);
  });
});
