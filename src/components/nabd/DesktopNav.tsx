"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS } from "@/components/nabd/nav-links";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/** The desktop navigation row, with the active section marked. */
export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label={ar.nav.menuTitle}>
      {NAV_LINKS.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-mint text-teal" : "text-ink hover:bg-mint",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
