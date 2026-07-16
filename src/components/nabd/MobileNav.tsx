"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { NAV_LINKS } from "@/components/nabd/nav-links";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/** The mobile navigation drawer (CLAUDE.md §Phase 3 — mobile nav via Sheet). */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={ar.nav.openMenu} className="lg:hidden">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{ar.nav.menuTitle}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1" aria-label={ar.nav.menuTitle}>
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2.5 text-base transition-colors",
                  active
                    ? "bg-mint font-semibold text-teal"
                    : "text-ink hover:bg-mint",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            {ar.nav.login}
          </Link>
          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ variant: "default" }), "w-full")}
          >
            {ar.actions.bookAppointment}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
