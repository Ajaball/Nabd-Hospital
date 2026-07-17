"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  Building2,
  Newspaper,
  Mail,
  type LucideIcon,
} from "lucide-react";

import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const LINKS: NavLink[] = [
  { href: "/dashboard", label: ar.admin.nav.overview, icon: LayoutDashboard, exact: true },
  { href: "/dashboard/appointments", label: ar.admin.nav.appointments, icon: CalendarDays },
  { href: "/dashboard/patients", label: ar.admin.nav.patients, icon: Users },
  { href: "/dashboard/doctors", label: ar.admin.nav.doctors, icon: Stethoscope },
  { href: "/dashboard/departments", label: ar.admin.nav.departments, icon: Building2 },
  { href: "/dashboard/news", label: ar.admin.nav.news, icon: Newspaper },
  { href: "/dashboard/messages", label: ar.admin.nav.messages, icon: Mail },
];

export function AdminNav({
  unreadMessages = 0,
  onNavigate,
}: {
  unreadMessages?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label={ar.admin.nav.menuTitle}>
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        const showBadge = link.href === "/dashboard/messages" && unreadMessages > 0;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-mint text-teal" : "text-ink hover:bg-mint/60",
            )}
          >
            <link.icon className="size-5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{link.label}</span>
            {showBadge ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-teal px-1.5 py-0.5 font-data text-xs text-paper">
                {unreadMessages}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
