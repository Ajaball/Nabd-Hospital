import type { Metadata } from "next";

import { DoctorsManager, type DoctorRow } from "@/components/nabd/admin/DoctorsManager";
import { listDoctorsAdmin, listDepartmentsAdmin } from "@/lib/services/admin";
import { ar } from "@/content/ar";

export const metadata: Metadata = { title: ar.admin.doctors.title };

export default async function AdminDoctorsPage() {
  const [doctors, departments] = await Promise.all([
    listDoctorsAdmin(),
    listDepartmentsAdmin(),
  ]);

  const rows: DoctorRow[] = doctors.map((d) => ({
    id: d.id,
    slug: d.slug,
    fullNameAr: d.fullNameAr,
    title: d.title,
    departmentId: d.departmentId,
    departmentNameAr: d.department.nameAr,
    bio: d.bio,
    yearsExperience: d.yearsExperience,
    isAcceptingPatients: d.isAcceptingPatients,
    futureCount: d._count.appointments,
    availability: d.availability,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.admin.doctors.title}
      </h1>
      <DoctorsManager
        doctors={rows}
        departments={departments.map((d) => ({ id: d.id, nameAr: d.nameAr }))}
      />
    </div>
  );
}
