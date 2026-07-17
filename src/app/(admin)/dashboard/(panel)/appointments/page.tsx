import type { Metadata } from "next";
import { AppointmentStatus } from "@prisma/client";

import { StatusBadge } from "@/components/nabd/StatusBadge";
import { AppointmentsFilters } from "@/components/nabd/admin/AppointmentsFilters";
import { AppointmentRowActions } from "@/components/nabd/admin/AppointmentRowActions";
import { Pagination } from "@/components/nabd/admin/Pagination";
import { listAppointments } from "@/lib/services/admin";
import { getDepartments } from "@/lib/services/public";
import { formatDate, formatTime } from "@/lib/datetime";
import { ar } from "@/content/ar";

export const metadata: Metadata = { title: ar.admin.appointments.title };

function toStatus(value?: string): AppointmentStatus | undefined {
  return value && value in AppointmentStatus
    ? (value as AppointmentStatus)
    : undefined;
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; dept?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = toStatus(sp.status);
  const q = sp.q?.trim() || undefined;
  const page = Number(sp.page) || 1;

  const [data, departments] = await Promise.all([
    listAppointments({ status, deptSlug: sp.dept, q, page }),
    getDepartments(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.admin.appointments.title}
      </h1>

      <AppointmentsFilters
        departments={departments.map((d) => ({ slug: d.slug, nameAr: d.nameAr }))}
        current={{ status: sp.status, dept: sp.dept, q: sp.q }}
      />

      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line bg-mint/40 text-start">
              <Th>{ar.admin.appointments.colPatient}</Th>
              <Th>{ar.admin.appointments.colFileNumber}</Th>
              <Th>{ar.admin.appointments.colDoctor}</Th>
              <Th>{ar.admin.appointments.colDepartment}</Th>
              <Th>{ar.admin.appointments.colDateTime}</Th>
              <Th>{ar.admin.appointments.colStatus}</Th>
              <Th className="text-end">{ar.admin.common.actions}</Th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((a) => (
              <tr key={a.id} className="border-b border-line last:border-0 hover:bg-mint/20">
                <Td className="font-medium text-ink">{a.patient.user.fullName}</Td>
                <Td className="font-data text-muted-ink">{a.patient.fileNumber}</Td>
                <Td>{a.doctor.fullNameAr}</Td>
                <Td>{a.department.nameAr}</Td>
                <Td className="whitespace-nowrap font-data text-muted-ink">
                  {formatDate(a.startsAt)} · {formatTime(a.startsAt)}
                </Td>
                <Td>
                  <StatusBadge status={a.status} />
                </Td>
                <Td className="text-end">
                  <AppointmentRowActions id={a.id} status={a.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-muted-ink">
            {ar.admin.appointments.empty}
          </p>
        ) : null}
      </div>

      <Pagination
        basePath="/dashboard/appointments"
        params={{ status: sp.status, dept: sp.dept, q: sp.q }}
        page={data.page}
        pageCount={data.pageCount}
      />
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={`px-4 py-3 text-start font-semibold text-ink ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
