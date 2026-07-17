import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, UserRound } from "lucide-react";
import { auth } from "@/lib/auth";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { DeptIcon } from "@/components/nabd/DeptIcon";
import {
  BookingStepper,
  type BookingStep,
} from "@/components/nabd/booking/BookingStepper";
import {
  BookDateTime,
  type DateOption,
} from "@/components/nabd/booking/BookDateTime";
import { getActiveDepartments, getDepartmentBySlug, getDoctorBySlug } from "@/lib/queries";
import {
  formatISODate,
  formatWeekday,
  formatDayMonth,
  riyadhDayOfWeek,
} from "@/lib/datetime";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.booking.title,
  description: ar.booking.lead,
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Next ~3 weeks of Sun–Thu (dayOfWeek 0–4) dates for the picker. */
function bookableDates(now: Date): DateOption[] {
  const out: DateOption[] = [];
  for (let i = 0; i < 21; i++) {
    const d = new Date(now.getTime() + i * DAY_MS);
    if (riyadhDayOfWeek(d) > 4) continue; // skip Fri/Sat
    out.push({ iso: formatISODate(d), weekday: formatWeekday(d), label: formatDayMonth(d) });
  }
  return out;
}

type SearchParams = Promise<{
  step?: string;
  dept?: string;
  doctor?: string;
  date?: string;
  slot?: string;
}>;

export default async function BookPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const session = await auth();
  const canBook = session?.user?.role === "PATIENT";

  // Resolve the department + doctor from the URL, ignoring invalid values.
  const department = sp.dept ? await getDepartmentBySlug(sp.dept) : null;
  const doctor =
    department && sp.doctor ? await getDoctorBySlug(sp.doctor) : null;
  const doctorInDept =
    doctor && department && doctor.departmentId === department.id ? doctor : null;

  let step: BookingStep = "department";
  if (department && doctorInDept) step = "datetime";
  else if (department) step = "doctor";

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-2 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink sm:text-3xl">
          {ar.booking.title}
        </h1>
      </div>
      <p className="text-muted-ink">{ar.booking.lead}</p>

      <div className="my-8">
        <BookingStepper current={step} />
      </div>
      <PulseTrace variant="rule" className="mb-8" />

      {/* Step 1 — department */}
      {step === "department" ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-ink">
            {ar.booking.chooseDepartment}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(await getActiveDepartments()).map((d) => (
              <Link
                key={d.id}
                href={`/book?step=doctor&dept=${d.slug}`}
                className="group flex items-center gap-4 rounded-lg border border-line bg-card p-4 transition-colors hover:border-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                <span className="flex size-11 items-center justify-center rounded-md bg-mint text-teal">
                  <DeptIcon name={d.icon} className="size-5" />
                </span>
                <span className="font-medium text-ink group-hover:text-teal">
                  {d.nameAr}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Step 2 — doctor */}
      {step === "doctor" && department ? (
        <section>
          <Link
            href="/book"
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-ink hover:text-teal"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
            {ar.booking.steps.department}: {department.nameAr}
          </Link>
          <h2 className="mb-4 text-lg font-semibold text-ink">
            {ar.booking.chooseDoctor}
          </h2>
          {department.doctors.length === 0 ? (
            <p className="rounded-lg border border-line bg-card p-6 text-muted-ink">
              {ar.booking.noDoctors}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {department.doctors.map((doc) => {
                const disabled = !doc.isAcceptingPatients;
                const inner = (
                  <>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-mint text-teal">
                      <UserRound className="size-6" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">{doc.fullNameAr}</span>
                      <span className="block text-sm text-muted-ink">{doc.title}</span>
                    </span>
                    {disabled ? (
                      <span className="text-xs text-st-pending">
                        {ar.doctors.notAccepting}
                      </span>
                    ) : (
                      <ChevronRight className="size-5 rotate-180 text-muted-ink" />
                    )}
                  </>
                );
                return disabled ? (
                  <div
                    key={doc.id}
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-center gap-4 rounded-lg border border-line bg-mint/20 p-4 opacity-70"
                  >
                    {inner}
                  </div>
                ) : (
                  <Link
                    key={doc.id}
                    href={`/book?step=datetime&dept=${department.slug}&doctor=${doc.slug}`}
                    className="group flex items-center gap-4 rounded-lg border border-line bg-card p-4 transition-colors hover:border-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {/* Step 3 — date + slot */}
      {step === "datetime" && department && doctorInDept ? (
        <section>
          <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <Link
              href={`/book?step=doctor&dept=${department.slug}`}
              className="inline-flex items-center gap-1 text-muted-ink hover:text-teal"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
              {ar.booking.change}
            </Link>
            <span className="text-muted-ink">
              {ar.booking.steps.doctor}:{" "}
              <span className="font-medium text-ink">{doctorInDept.fullNameAr}</span>
            </span>
            <span className="text-muted-ink">
              {ar.booking.steps.department}:{" "}
              <span className="font-medium text-ink">{department.nameAr}</span>
            </span>
          </div>

          <BookDateTime
            doctorId={doctorInDept.id}
            isAcceptingPatients={doctorInDept.isAcceptingPatients}
            isAuthenticated={canBook}
            dates={bookableDates(new Date())}
            initialDate={sp.date}
            initialSlot={sp.slot}
          />
        </section>
      ) : null}
    </main>
  );
}
