import type { Metadata } from "next";

import { DepartmentsManager, type DeptRow } from "@/components/nabd/admin/DepartmentsManager";
import { listDepartmentsAdmin } from "@/lib/services/admin";
import { ar } from "@/content/ar";

export const metadata: Metadata = { title: ar.admin.departments.title };

export default async function AdminDepartmentsPage() {
  const departments = await listDepartmentsAdmin();
  const rows: DeptRow[] = departments.map((d) => ({
    id: d.id,
    slug: d.slug,
    nameAr: d.nameAr,
    descriptionAr: d.descriptionAr,
    icon: d.icon,
    isActive: d.isActive,
    doctorCount: d._count.doctors,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.admin.departments.title}
      </h1>
      <DepartmentsManager departments={rows} />
    </div>
  );
}
