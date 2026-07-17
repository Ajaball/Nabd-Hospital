import { auth } from "@/lib/auth";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SignOutButton } from "@/components/nabd/auth/SignOutButton";
import { ar } from "@/content/ar";

/**
 * Placeholder patient portal. The middleware guarantees only a PATIENT session
 * reaches this route; Phase 4 replaces this with the real appointments view.
 */
export default async function MyAppointmentsPage() {
  const session = await auth();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <PulseTrace variant="rule" className="mb-10" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
            {ar.myAppointments.placeholderTitle}
          </h1>
          <p className="mt-2 text-muted-ink">{ar.myAppointments.placeholderLead}</p>
          {session?.user?.name ? (
            <p className="mt-4 font-data text-sm text-muted-ink">
              {session.user.name}
            </p>
          ) : null}
        </div>
        <SignOutButton />
      </div>
    </main>
  );
}
