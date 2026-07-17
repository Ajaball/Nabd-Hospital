import { prisma } from "@/lib/db";
import { DepartmentsManager } from "@/components/nabd/dashboard/DepartmentsManager";

export default async function DepartmentsAdminPage() {
  const departments = await prisma.department.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { doctors: true } } },
  });

  return (
    <DepartmentsManager
      departments={departments.map((d) => ({
        id: d.id,
        slug: d.slug,
        nameAr: d.nameAr,
        descriptionAr: d.descriptionAr,
        icon: d.icon,
        isActive: d.isActive,
        sortOrder: d.sortOrder,
        doctorCount: d._count.doctors,
      }))}
    />
  );
}
