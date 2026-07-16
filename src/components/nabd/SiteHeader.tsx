import Link from "next/link";

import { SiteWordmark } from "@/components/nabd/SiteWordmark";
import { DesktopNav } from "@/components/nabd/DesktopNav";
import { MobileNav } from "@/components/nabd/MobileNav";
import { buttonVariants } from "@/components/ui/button";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/** The public site header: wordmark, nav, login link, and booking CTA. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <MobileNav />
          <SiteWordmark />
        </div>

        <DesktopNav />

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            {ar.nav.login}
          </Link>
          <Link
            href="/book"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            {ar.actions.bookAppointment}
          </Link>
        </div>
      </div>
    </header>
  );
}
