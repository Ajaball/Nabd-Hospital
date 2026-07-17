import { prisma } from "@/lib/db";
import { DoctorsManager } from "@/components/nabd/dashboard/DoctorsManager";

export default async function DoctorsAdminPage() {
  const [doctors, departments] = await Promise.all([
    prisma.doctor.findMany({
      orderBy: { fullNameAr: "asc" },
      include: {
        department: { select: { nameAr: true } },
        availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      },
    }),
    prisma.department.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, nameAr: true },
    }),
  ]);

  return (
    <DoctorsManager
      departments={departments}
      doctors={doctors.map((d) => ({
        id: d.id,
        slug: d.slug,
        fullNameAr: d.fullNameAr,
        title: d.title,
        departmentId: d.departmentId,
        departmentNameAr: d.department.nameAr,
        bio: d.bio,
        yearsExperience: d.yearsExperience,
        isAcceptingPatients: d.isAcceptingPatients,
        availability: d.availability.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          slotMinutes: a.slotMinutes,
        })),
      }))}
    />
  );
}
