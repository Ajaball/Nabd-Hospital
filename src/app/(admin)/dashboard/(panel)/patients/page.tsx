import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PatientsManager } from "@/components/nabd/dashboard/PatientsManager";

export default async function PatientsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const where: Prisma.PatientWhereInput = q
    ? {
        OR: [
          { user: { fullName: { contains: q, mode: "insensitive" } } },
          { fileNumber: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { fileNumber: "asc" },
    take: 100,
    include: {
      user: { select: { fullName: true, phone: true } },
      appointments: {
        orderBy: { startsAt: "desc" },
        include: {
          doctor: { select: { fullNameAr: true } },
          department: { select: { nameAr: true } },
        },
      },
    },
  });

  return (
    <PatientsManager
      patients={patients.map((p) => ({
        id: p.id,
        fileNumber: p.fileNumber,
        fullName: p.user.fullName,
        phone: p.user.phone,
        gender: p.gender,
        appointments: p.appointments.map((a) => ({
          id: a.id,
          startsAt: a.startsAt.toISOString(),
          doctorNameAr: a.doctor.fullNameAr,
          departmentNameAr: a.department.nameAr,
          status: a.status,
        })),
      }))}
    />
  );
}
