"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NavLinks, type NavItem } from "@/components/nabd/NavLinks";
import { ar } from "@/content/ar";

type AuthLink = { href: string; label: string };

/**
 * Small-screen navigation in a slide-in Sheet. The auth area mirrors the
 * desktop header: a link to the user's home surface or the login link.
 */
export function MobileNav({
  items,
  authLink,
  signOut,
}: {
  items: NavItem[];
  authLink: AuthLink;
  signOut?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={ar.nav.openMenu}
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="end" className="w-72">
        <SheetHeader>
          <SheetTitle>{ar.site.name}</SheetTitle>
        </SheetHeader>
        <nav aria-label={ar.nav.primary} className="mt-2">
          <NavLinks items={items} orientation="vertical" onNavigate={close} />
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
          <Button asChild className="w-full">
            <Link href="/book" onClick={close}>
              {ar.actions.bookAppointment}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={authLink.href} onClick={close}>
              {authLink.label}
            </Link>
          </Button>
          {signOut}
        </div>
      </SheetContent>
    </Sheet>
  );
}
