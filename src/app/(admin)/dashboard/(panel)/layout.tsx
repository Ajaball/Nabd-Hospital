import { redirect } from "next/navigation";

import { SiteWordmark } from "@/components/nabd/SiteWordmark";
import { SignOutButton } from "@/components/nabd/SignOutButton";
import { AdminNav } from "@/components/nabd/admin/AdminNav";
import { AdminMobileNav } from "@/components/nabd/admin/AdminMobileNav";
import { getAdminSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";

/**
 * Admin dashboard shell (CLAUDE.md §Phase 5). The middleware already gates
 * /dashboard/* to ADMIN; this layout re-checks (defense in depth) and provides
 * the sidebar + header. The unread-messages count drives the nav badge.
 */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const unreadMessages = await prisma.contactMessage.count({
    where: { isRead: false },
  });

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-card">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <AdminMobileNav unreadMessages={unreadMessages} />
            <SiteWordmark />
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24">
            <AdminNav unreadMessages={unreadMessages} />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
