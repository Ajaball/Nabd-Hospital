import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { AppointmentStatus, Gender } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Proves the double-booking invariant is enforced by the DATABASE (the partial
 * unique index appointment_no_double_booking), not by application code. Two
 * active appointments (PENDING/CONFIRMED) for the same doctor + start time are
 * rejected with Prisma P2002 — including when the inserts race concurrently.
 * A cancelled appointment at the same slot is allowed, because the index only
 * covers active statuses.
 */

const tag = `dbtest-${Date.now()}`;
let departmentId: string;
let doctorId: string;
let patientId: string;

beforeAll(async () => {
  const department = await prisma.department.create({
    data: {
      slug: `${tag}-dept`,
      nameAr: "قسم اختبار",
      descriptionAr: "قسم لأغراض الاختبار",
      icon: "stethoscope",
      sortOrder: 999,
    },
  });
  departmentId = department.id;

  const doctor = await prisma.doctor.create({
    data: {
      slug: `${tag}-doc`,
      fullNameAr: "د. اختبار",
      title: "أخصائي",
      departmentId,
      bio: "طبيب اختبار",
    },
  });
  doctorId = doctor.id;

  const user = await prisma.user.create({
    data: {
      email: `${tag}@example.com`,
      passwordHash: "x",
      fullName: "مريض اختبار",
      phone: "+966500000001",
      patient: {
        create: {
          fileNumber: `NB-${tag}`,
          nationalId: `9${Date.now()}`,
          dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
          gender: Gender.MALE,
        },
      },
    },
    include: { patient: true },
  });
  patientId = user.patient!.id;
});

afterAll(async () => {
  await prisma.appointment.deleteMany({ where: { doctorId } });
  await prisma.doctor.deleteMany({ where: { id: doctorId } });
  await prisma.user.deleteMany({ where: { email: `${tag}@example.com` } });
  await prisma.department.deleteMany({ where: { id: departmentId } });
  await prisma.$disconnect();
});

function booking(startsAt: Date, status: AppointmentStatus) {
  return {
    patientId,
    doctorId,
    departmentId,
    startsAt,
    endsAt: new Date(startsAt.getTime() + 30 * 60000),
    status,
  };
}

describe("double-booking guard (partial unique index)", () => {
  it("rejects a second active booking for the same doctor + slot with P2002", async () => {
    const slot = new Date("2027-01-04T06:00:00.000Z");
    await prisma.appointment.create({ data: booking(slot, AppointmentStatus.CONFIRMED) });

    await expect(
      prisma.appointment.create({ data: booking(slot, AppointmentStatus.PENDING) }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("allows the slot to be re-used once the conflicting booking is cancelled", async () => {
    const slot = new Date("2027-01-05T06:00:00.000Z");
    const first = await prisma.appointment.create({
      data: booking(slot, AppointmentStatus.CONFIRMED),
    });

    // Cancelling removes it from the partial index...
    await prisma.appointment.update({
      where: { id: first.id },
      data: { status: AppointmentStatus.CANCELLED },
    });

    // ...so the slot can be booked again.
    const second = await prisma.appointment.create({
      data: booking(slot, AppointmentStatus.CONFIRMED),
    });
    expect(second.id).not.toBe(first.id);
  });

  it("under a concurrent race, exactly one insert wins and one gets P2002", async () => {
    const slot = new Date("2027-01-06T06:00:00.000Z");
    const results = await Promise.allSettled([
      prisma.appointment.create({ data: booking(slot, AppointmentStatus.CONFIRMED) }),
      prisma.appointment.create({ data: booking(slot, AppointmentStatus.CONFIRMED) }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({ code: "P2002" });
  });
});
