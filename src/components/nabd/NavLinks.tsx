"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

/**
 * Primary navigation links with active-state styling (active nav is --teal,
 * CLAUDE.md §4). Shared between the desktop header and the mobile sheet.
 */
export function NavLinks({
  items,
  orientation = "horizontal",
  onNavigate,
  className,
}: {
  items: NavItem[];
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <ul
      className={cn(
        orientation === "horizontal"
          ? "flex items-center gap-1"
          : "flex flex-col gap-1",
        className,
      )}
    >
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
                orientation === "vertical" && "text-base",
                active
                  ? "bg-mint text-teal"
                  : "text-ink hover:bg-mint/60 hover:text-teal",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
