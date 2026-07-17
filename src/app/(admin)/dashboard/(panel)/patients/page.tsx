import type { Metadata } from "next";

import { PatientsTable, type PatientRow } from "@/components/nabd/admin/PatientsTable";
import { Pagination } from "@/components/nabd/admin/Pagination";
import { listPatients } from "@/lib/services/admin";
import { ar } from "@/content/ar";

export const metadata: Metadata = { title: ar.admin.patients.title };

export default async function AdminPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const data = await listPatients({ q, page: Number(sp.page) || 1 });

  const patients: PatientRow[] = data.rows.map((p) => ({
    id: p.id,
    fileNumber: p.fileNumber,
    fullName: p.user.fullName,
    phone: p.user.phone,
    gender: p.gender,
    dateOfBirth: p.dateOfBirth.toISOString(),
    count: p._count.appointments,
    history: p.appointments.map((a) => ({
      id: a.id,
      startsAt: a.startsAt.toISOString(),
      status: a.status,
      doctorNameAr: a.doctor.fullNameAr,
      departmentNameAr: a.department.nameAr,
    })),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.admin.patients.title}
      </h1>
      <PatientsTable patients={patients} q={sp.q} />
      <Pagination
        basePath="/dashboard/patients"
        params={{ q: sp.q }}
        page={data.page}
        pageCount={data.pageCount}
      />
    </div>
  );
}
