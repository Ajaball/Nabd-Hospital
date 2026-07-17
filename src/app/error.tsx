"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { Button, buttonVariants } from "@/components/ui/button";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/** Designed error boundary (CLAUDE.md §Phase 6). */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <PulseTrace variant="rule" className="mb-8 w-full max-w-sm" />
      <AlertTriangle className="size-9 text-st-pending" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.system.errorTitle}
      </h1>
      <p className="mt-3 max-w-md text-muted-ink">{ar.system.errorBody}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>{ar.system.retry}</Button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          {ar.system.backHome}
        </Link>
      </div>
    </div>
  );
}
