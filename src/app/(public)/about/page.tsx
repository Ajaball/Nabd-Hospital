import type { Metadata } from "next";
import { Building2, Users, Award, Siren } from "lucide-react";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SectionHeading } from "@/components/nabd/SectionHeading";
import { getHospitalStats } from "@/lib/services/public";
import { yearsSince } from "@/lib/datetime";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.about.title,
  description: ar.metadata.about.description,
};

export default async function AboutPage() {
  const stats = await getHospitalStats();
  const years = yearsSince(ar.site.foundedYear);

  const tiles = [
    { icon: Building2, value: String(stats.departments), label: ar.about.statDepartments },
    { icon: Users, value: String(stats.doctors), label: ar.about.statDoctors },
    { icon: Award, value: String(years), label: ar.about.statYears },
    { icon: Siren, value: ar.about.emergencyValue, label: ar.about.statEmergency },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <PulseTrace variant="rule" className="mb-6" />
        <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink sm:text-[2.75rem]">
          {ar.about.title}
        </h1>
        <p className="mt-4 text-lg leading-loose text-muted-ink">{ar.about.lead}</p>
      </header>

      {/* Numbers that matter — figures in IBM Plex Mono */}
      <section className="mt-12">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="flex flex-col gap-3 rounded-lg border border-line bg-card p-5"
            >
              <tile.icon className="size-6 text-teal" aria-hidden="true" />
              <div className="font-data text-3xl font-medium text-ink">
                {tile.value}
              </div>
              <div className="text-sm leading-snug text-muted-ink">{tile.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      <section className="mt-16">
        <SectionHeading title={ar.about.historyTitle} />
        <div className="space-y-4">
          {ar.about.historyBody.map((paragraph) => (
            <p key={paragraph} className="text-base leading-loose text-ink/85">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mt-16">
        <SectionHeading title={ar.about.missionTitle} />
        <p className="max-w-3xl text-lg leading-loose text-ink/85">
          {ar.about.missionBody}
        </p>
      </section>
    </div>
  );
}
