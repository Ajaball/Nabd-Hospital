import type { Metadata } from "next";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SectionHeading } from "@/components/nabd/SectionHeading";
import { getHospitalStats } from "@/lib/queries";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.about.title,
  description: ar.metadata.about.description,
};

export default async function AboutPage() {
  const stats = await getHospitalStats();

  const figures = [
    { value: stats.departments, label: ar.about.statDepartments },
    { value: stats.doctors, label: ar.about.statDoctors },
    { value: stats.totalExperience, label: ar.about.statYears },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <SectionHeading as="h1" title={ar.about.title} lead={ar.about.lead} />
      <PulseTrace variant="rule" className="my-10" />

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-bold tracking-[-0.01em] text-ink">
            {ar.about.historyTitle}
          </h2>
          <p className="mt-3 text-base leading-loose text-muted-ink">{ar.about.history}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-[-0.01em] text-ink">
            {ar.about.missionTitle}
          </h2>
          <p className="mt-3 text-base leading-loose text-muted-ink">{ar.about.mission}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-[-0.01em] text-ink">
            {ar.about.statsTitle}
          </h2>
          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {figures.map((f) => (
              <div
                key={f.label}
                className="rounded-lg border border-line bg-card p-6 text-center"
              >
                <dd className="font-data text-3xl font-bold tabular-nums text-teal">
                  {f.value}
                </dd>
                <dt className="mt-2 text-sm text-muted-ink">{f.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
