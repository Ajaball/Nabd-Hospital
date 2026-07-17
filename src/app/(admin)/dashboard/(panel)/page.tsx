import { PulseTrace } from "@/components/nabd/PulseTrace";
import { KpiCard } from "@/components/nabd/dashboard/KpiCard";
import {
  AppointmentsPerDayChart,
  AppointmentsPerDeptChart,
} from "@/components/nabd/dashboard/Charts";
import { StatusBadge } from "@/components/nabd/StatusBadge";
import {
  getKpis,
  getAppointmentsPerDay,
  getAppointmentsPerDepartment,
  getRecentAppointments,
} from "@/lib/services/dashboard";
import { formatISODate, formatTime } from "@/lib/datetime";
import { ar } from "@/content/ar";

export default async function DashboardOverviewPage() {
  const now = new Date();
  const [kpis, perDay, perDept, recent] = await Promise.all([
    getKpis(now),
    getAppointmentsPerDay(now, 30),
    getAppointmentsPerDepartment(),
    getRecentAppointments(8),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.dash.overview.title}
      </h1>
      <p className="mt-1 text-muted-ink">{ar.dash.overview.lead}</p>
      <PulseTrace variant="rule" className="my-6" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label={ar.dash.overview.kpiToday} value={kpis.today} />
        <KpiCard label={ar.dash.overview.kpiWeek} value={kpis.week} />
        <KpiCard label={ar.dash.overview.kpiActivePatients} value={kpis.activePatients} />
        <KpiCard
          label={ar.dash.overview.kpiCancellation}
          value={kpis.cancellationRate}
          suffix="٪"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            {ar.dash.overview.chartPerDay}
          </h2>
          <AppointmentsPerDayChart data={perDay} />
        </section>
        <section className="rounded-lg border border-line bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            {ar.dash.overview.chartPerDept}
          </h2>
          <AppointmentsPerDeptChart data={perDept} />
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-line bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">
          {ar.dash.overview.recent}
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-ink">{ar.dash.overview.noRecent}</p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <span className="font-data text-sm tabular-nums text-ink">
                  {formatISODate(a.startsAt)} {formatTime(a.startsAt)}
                </span>
                <span className="text-sm text-ink">{a.patient.user.fullName}</span>
                <span className="text-sm text-muted-ink">
                  {a.doctor.fullNameAr} — {a.department.nameAr}
                </span>
                <span className="ms-auto">
                  <StatusBadge status={a.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
