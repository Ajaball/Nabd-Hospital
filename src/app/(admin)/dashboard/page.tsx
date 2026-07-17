import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SiteWordmark } from "@/components/nabd/SiteWordmark";
import { SignOutButton } from "@/components/nabd/SignOutButton";
import { auth } from "@/lib/auth";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.dashboard.title,
  description: ar.metadata.dashboard.description,
};

/**
 * Admin dashboard. Access is gated to ADMIN by the middleware. The KPI overview,
 * tables, and charts arrive in Phase 5; this authenticated placeholder proves
 * the gate and shows the signed-in admin.
 */
export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name ?? "";

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <SiteWordmark />
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <PulseTrace variant="rule" className="mb-6" />
        <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink">
          {ar.auth.adminHome.title}
        </h1>
        <p className="mt-2 text-muted-ink">{ar.auth.adminHome.welcome(name)}</p>

        <div className="mt-10 flex flex-col items-center gap-4 rounded-lg border border-dashed border-line bg-card p-12 text-center">
          <LayoutDashboard className="size-8 text-teal" aria-hidden="true" />
          <p className="max-w-md text-muted-ink">{ar.auth.adminHome.placeholder}</p>
        </div>
      </main>
    </div>
  );
}
