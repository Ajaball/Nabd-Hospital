import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/nabd/SignOutButton";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.dashboard.title,
  description: ar.metadata.dashboard.description,
};

/**
 * The admin dashboard landing. Access is enforced in middleware (ADMIN only);
 * the KPI overview, charts, and management screens arrive in Phase 5. For now
 * this proves the protected route and the ADMIN session.
 */
export default async function DashboardPage() {
  const session = await auth();
  const t = ar.admin.dashboard;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
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

      <div className="rounded-lg border border-line bg-card p-8 shadow-clinical">
        <p className="text-lg font-semibold text-ink">{t.welcome}</p>
        <p className="mt-2 text-base leading-relaxed text-muted-ink">{t.lead}</p>
      </div>
    </main>
  );
}
