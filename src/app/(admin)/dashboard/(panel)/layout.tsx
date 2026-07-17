import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  DashboardSidebar,
  DashboardTopbar,
} from "@/components/nabd/dashboard/DashboardNav";
import { SignOutButton } from "@/components/nabd/auth/SignOutButton";

/**
 * Admin panel shell. Middleware already gates /dashboard/* to ADMIN, but we
 * re-check here (defense in depth) and load the unread-message count for the
 * nav badge.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard/login");
  }

  const unread = await prisma.contactMessage.count({ where: { isRead: false } });

  return (
    <div className="flex min-h-screen bg-paper">
      <DashboardSidebar unread={unread} signOut={<SignOutButton />} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar unread={unread} signOut={<SignOutButton />} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
