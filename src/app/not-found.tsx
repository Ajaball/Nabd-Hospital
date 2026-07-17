import Link from "next/link";

import { SiteWordmark } from "@/components/nabd/SiteWordmark";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { buttonVariants } from "@/components/ui/button";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/** Designed Arabic 404 with a clear way out (CLAUDE.md §Phase 6). */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <SiteWordmark className="mb-10" />
      <PulseTrace variant="rule" className="mb-8 w-full max-w-sm" />
      <p className="font-data text-5xl font-medium text-teal">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.system.notFoundTitle}
      </h1>
      <p className="mt-3 max-w-md text-muted-ink">{ar.system.notFoundBody}</p>
      <Link href="/" className={cn(buttonVariants(), "mt-8")}>
        {ar.system.backHome}
      </Link>
    </div>
  );
}
