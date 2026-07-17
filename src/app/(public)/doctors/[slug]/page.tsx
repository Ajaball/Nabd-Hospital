import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRound } from "lucide-react";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDoctorBySlug } from "@/lib/queries";
import { weekdayName } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { ar } from "@/content/ar";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) return { title: ar.doctors.notFound };
  return {
    title: `${doctor.fullNameAr} — ${doctor.title}`,
    description: doctor.bio,
  };
}

export default async function DoctorDetailPage({ params }: Params) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-mint text-teal">
          <UserRound className="size-10" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink sm:text-3xl">
            {doctor.fullNameAr}
          </h1>
          <p className="mt-1 text-base text-muted-ink">{doctor.title}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span className="text-muted-ink">
              {ar.doctors.inDepartment}:{" "}
              <Link
                href={`/departments/${doctor.department.slug}`}
                className="font-medium text-teal hover:underline"
              >
                {doctor.department.nameAr}
              </Link>
            </span>
            <span className="text-muted-ink">
              {ar.doctors.experience}:{" "}
              <span className="font-data tabular-nums text-ink">
                {doctor.yearsExperience}
              </span>{" "}
              {ar.common.yearsExperienceSuffix}
            </span>
          </div>

          <span
            className={cn(
              "mt-3 inline-flex w-fit items-center rounded-sm border-s-[3px] px-2 py-0.5 text-xs font-medium",
              doctor.isAcceptingPatients
                ? "border-s-st-confirmed bg-st-confirmed/8 text-st-confirmed"
                : "border-s-st-completed bg-st-completed/8 text-st-completed",
            )}
          >
            {doctor.isAcceptingPatients ? ar.doctors.accepting : ar.doctors.notAccepting}
          </span>
        </div>
      </div>

      <p className="mt-6 text-base leading-loose text-muted-ink">{doctor.bio}</p>

      <div className="mt-8">
        {doctor.isAcceptingPatients ? (
          <Button asChild size="lg">
            <Link href={`/book?dept=${doctor.department.slug}&doctor=${doctor.slug}`}>
              {ar.doctors.bookWith}
            </Link>
          </Button>
        ) : (
          <Button size="lg" disabled>
            {ar.doctors.bookWith}
          </Button>
        )}
      </div>

      <PulseTrace variant="rule" className="my-10" />

      <h2 className="text-xl font-bold tracking-[-0.01em] text-ink">
        {ar.doctors.availabilityTitle}
      </h2>
      {doctor.availability.length === 0 ? (
        <p className="mt-4 rounded-lg border border-line bg-card p-6 text-muted-ink">
          {ar.doctors.availabilityNone}
        </p>
      ) : (
        <div className="mt-4 rounded-lg border border-line bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ar.doctors.day}</TableHead>
                <TableHead>{ar.doctors.from}</TableHead>
                <TableHead>{ar.doctors.to}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctor.availability.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-ink">
                    {weekdayName(a.dayOfWeek)}
                  </TableCell>
                  <TableCell className="font-data tabular-nums">{a.startTime}</TableCell>
                  <TableCell className="font-data tabular-nums">{a.endTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
