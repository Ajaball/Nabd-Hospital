import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/nabd/SignOutButton";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.myAppointments.title,
  description: ar.metadata.myAppointments.description,
};

/**
 * The patient portal landing. Access is enforced in middleware (PATIENT only);
 * the full upcoming/past lists and cancel flow arrive in Phase 4. For now this
 * proves the protected route and the session.
 */
export default async function MyAppointmentsPage() {
  const session = await auth();
  const t = ar.patient.myAppointments;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">{t.title}</h1>
          {session?.user?.name ? (
            <p className="mt-1 text-sm text-muted-ink">{session.user.name}</p>
          ) : null}
        </div>
        <SignOutButton />
      </div>

      <PulseTrace variant="rule" className="my-8" />

      <p className="text-base leading-relaxed text-muted-ink">{t.lead}</p>

      <div className="mt-8 rounded-lg border border-line bg-card p-8 text-center shadow-clinical">
        <p className="text-base text-ink">{t.placeholder}</p>
        <Link
          href="/book"
          className="mt-5 inline-flex items-center justify-center rounded-md bg-teal px-5 py-2.5 text-base font-semibold text-paper transition-[filter] duration-150 hover:brightness-95"
        >
          {t.bookCta}
        </Link>
      </div>
    </main>
  );
}
