"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/nabd/admin/AdminNav";
import { ar } from "@/content/ar";

export function AdminMobileNav({ unreadMessages }: { unreadMessages: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={ar.admin.nav.menuTitle} className="lg:hidden">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{ar.admin.nav.menuTitle}</SheetTitle>
        </SheetHeader>
        <AdminNav unreadMessages={unreadMessages} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
