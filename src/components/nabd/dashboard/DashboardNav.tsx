"use client";

import { useState } from "react";
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
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/nabd/Logo";
import { cn } from "@/lib/utils";
import { ar } from "@/content/ar";

const ICONS = {
  overview: LayoutDashboard,
  appointments: CalendarDays,
  patients: Users,
  doctors: Stethoscope,
  departments: Building2,
  news: Newspaper,
  messages: Mail,
} as const;

const ITEMS: { key: keyof typeof ICONS; href: string; label: string }[] = [
  { key: "overview", href: "/dashboard", label: ar.dash.nav.overview },
  { key: "appointments", href: "/dashboard/appointments", label: ar.dash.nav.appointments },
  { key: "patients", href: "/dashboard/patients", label: ar.dash.nav.patients },
  { key: "doctors", href: "/dashboard/doctors", label: ar.dash.nav.doctors },
  { key: "departments", href: "/dashboard/departments", label: ar.dash.nav.departments },
  { key: "news", href: "/dashboard/news", label: ar.dash.nav.news },
  { key: "messages", href: "/dashboard/messages", label: ar.dash.nav.messages },
];

function NavList({
  unread,
  onNavigate,
}: {
  unread: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={ar.dash.brand} className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const Icon = ICONS[item.key];
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
              active ? "bg-mint text-teal" : "text-ink hover:bg-mint/60",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {item.key === "messages" && unread > 0 ? (
              <Badge variant="count">{unread}</Badge>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar({
  unread,
  signOut,
}: {
  unread: number;
  signOut: React.ReactNode;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-e border-line bg-card md:flex">
      <div className="border-b border-line p-4">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <NavList unread={unread} />
      </div>
      <div className="flex flex-col gap-2 border-t border-line p-3">
        <Button asChild variant="ghost" size="sm" className="justify-start">
          <Link href="/">{ar.dash.backToSite}</Link>
        </Button>
        {signOut}
      </div>
    </aside>
  );
}

export function DashboardTopbar({
  unread,
  signOut,
}: {
  unread: number;
  signOut: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between border-b border-line bg-card p-3 md:hidden">
      <Logo />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={ar.nav.openMenu}>
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="end" className="w-72">
          <SheetHeader>
            <SheetTitle>{ar.dash.brand}</SheetTitle>
          </SheetHeader>
          <div className="mt-2 flex-1">
            <NavList unread={unread} onNavigate={() => setOpen(false)} />
          </div>
          <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
            <Button asChild variant="ghost" size="sm" className="justify-start">
              <Link href="/" onClick={() => setOpen(false)}>
                {ar.dash.backToSite}
              </Link>
            </Button>
            {signOut}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
