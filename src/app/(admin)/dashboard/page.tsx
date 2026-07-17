import { auth } from "@/lib/auth";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SignOutButton } from "@/components/nabd/auth/SignOutButton";
import { ar } from "@/content/ar";

/**
 * Placeholder admin landing. The middleware already guarantees only an ADMIN
 * session reaches this route; Phase 5 replaces this with the real dashboard.
 */
export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <PulseTrace variant="rule" className="mb-10" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
            {ar.dashboard.placeholderTitle}
          </h1>
          <p className="mt-2 text-muted-ink">{ar.dashboard.placeholderLead}</p>
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
