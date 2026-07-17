import type { Metadata } from "next";

import { StatusBadge } from "@/components/nabd/StatusBadge";
import {
  AppointmentsPerDayChart,
  AppointmentsPerDepartmentChart,
} from "@/components/nabd/admin/OverviewCharts";
import {
  getOverviewKpis,
  getAppointmentsPerDay,
  getAppointmentsPerDepartment,
  getRecentActivity,
} from "@/lib/services/admin";
import { formatDayMonth, formatDateTime } from "@/lib/datetime";
import { ar } from "@/content/ar";

export const metadata: Metadata = { title: ar.admin.overview.title };

export default async function AdminOverviewPage() {
  const now = new Date();
  const [kpis, perDayRaw, perDept, recent] = await Promise.all([
    getOverviewKpis(now),
    getAppointmentsPerDay(now, 30),
    getAppointmentsPerDepartment(),
    getRecentActivity(8),
  ]);

  const perDay = perDayRaw.map((d) => ({ label: formatDayMonth(d.date), count: d.count }));

  const kpiCards = [
    { label: ar.admin.overview.kpiToday, value: String(kpis.todayCount) },
    { label: ar.admin.overview.kpiWeek, value: String(kpis.weekCount) },
    { label: ar.admin.overview.kpiActivePatients, value: String(kpis.activePatients) },
    { label: ar.admin.overview.kpiCancelRate, value: `${kpis.cancellationRate}%` },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.admin.overview.title}
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-line bg-card p-5">
            <div className="text-sm text-muted-ink">{kpi.label}</div>
            <div className="mt-2 font-data text-3xl font-medium text-ink">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            {ar.admin.overview.chartPerDayTitle}
          </h2>
          <AppointmentsPerDayChart data={perDay} />
        </div>
        <div className="rounded-lg border border-line bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            {ar.admin.overview.chartPerDeptTitle}
          </h2>
          <AppointmentsPerDepartmentChart data={perDept} />
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border border-line bg-card">
        <h2 className="border-b border-line px-5 py-4 text-sm font-semibold text-ink">
          {ar.admin.overview.recentTitle}
        </h2>
        {recent.length > 0 ? (
          <ul className="divide-y divide-line">
            {recent.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium text-ink">
                    {a.patient.user.fullName}
                  </span>
                  <span className="text-muted-ink">
                    {" "}
                    · {a.doctor.fullNameAr} · {a.department.nameAr}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-data text-xs text-muted-ink">
                    {formatDateTime(a.startsAt)}
                  </span>
                  <StatusBadge status={a.status} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-muted-ink">
            {ar.admin.overview.recentEmpty}
          </p>
        )}
      </div>
    </div>
  );
}
