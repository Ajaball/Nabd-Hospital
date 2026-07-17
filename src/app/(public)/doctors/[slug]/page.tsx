import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Award } from "lucide-react";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { AvailabilityTable } from "@/components/nabd/AvailabilityTable";
import { buttonVariants } from "@/components/ui/button";
import { getDoctorBySlug } from "@/lib/services/public";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) return {};
  return {
    title: doctor.fullNameAr,
    description: ar.build.doctorMetaDescription(
      doctor.fullNameAr,
      doctor.title,
      doctor.department.nameAr,
    ),
  };
}

export default async function DoctorDetailPage({ params }: Params) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) notFound();

  const accepting = doctor.isAcceptingPatients;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/doctors"
        className="inline-flex items-center gap-1 text-sm font-medium text-teal transition-colors hover:brightness-90"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {ar.actions.backToDoctors}
      </Link>

      <header className="mt-6">
        <PulseTrace variant="rule" className="mb-6" />
        <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink sm:text-[2.75rem]">
          {doctor.fullNameAr}
        </h1>
        <p className="mt-2 text-lg text-muted-ink">{doctor.title}</p>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-teal" aria-hidden="true" />
            <dt className="text-muted-ink">{ar.doctorDetail.departmentLabel}:</dt>
            <dd>
              <Link
                href={`/departments/${doctor.department.slug}`}
                className="font-medium text-teal transition-colors hover:brightness-90"
              >
                {doctor.department.nameAr}
              </Link>
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Award className="size-4 text-teal" aria-hidden="true" />
            <dt className="text-muted-ink">{ar.doctorDetail.experienceLabel}:</dt>
            <dd className="flex items-baseline gap-1">
              <span className="font-data font-medium text-ink">
                {doctor.yearsExperience}
              </span>
              <span className="text-muted-ink">{ar.common.yearsExperience}</span>
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <span
            className={cn(
              "inline-flex items-center rounded-sm border-s-[3px] bg-mint/60 py-1 pe-3 ps-3 text-sm font-medium",
              accepting
                ? "border-s-st-confirmed text-st-confirmed"
                : "border-s-st-completed text-st-completed",
            )}
          >
            {accepting ? ar.common.accepting : ar.common.notAccepting}
          </span>
        </div>
      </header>

      {/* Bio */}
      <section className="mt-12">
        <PulseTrace variant="rule" className="mb-6" />
        <h2 className="text-xl font-bold tracking-[-0.01em] text-ink sm:text-2xl">
          {ar.doctorDetail.bioTitle}
        </h2>
        <p className="mt-4 text-base leading-loose text-ink/85">{doctor.bio}</p>
      </section>

      {/* Weekly availability */}
      <section className="mt-12">
        <PulseTrace variant="rule" className="mb-6" />
        <h2 className="text-xl font-bold tracking-[-0.01em] text-ink sm:text-2xl">
          {ar.doctorDetail.scheduleTitle}
        </h2>
        <p className="mt-2 text-sm text-muted-ink">{ar.doctorDetail.scheduleLead}</p>
        <div className="mt-6">
          {doctor.availability.length > 0 ? (
            <AvailabilityTable availability={doctor.availability} />
          ) : (
            <p className="rounded-lg border border-line bg-card p-6 text-center text-muted-ink">
              {ar.doctorDetail.scheduleEmpty}
            </p>
          )}
        </div>
      </section>

      <div className="mt-12">
        <Link
          href={`/book?doctor=${doctor.slug}`}
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
        >
          {ar.build.bookWithDoctor(doctor.fullNameAr)}
        </Link>
      </div>
    </div>
  );
}
