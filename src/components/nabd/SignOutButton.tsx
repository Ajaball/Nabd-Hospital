"use client";

import { useTransition } from "react";
import { signOutAction } from "@/lib/actions/auth";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/** Signs the current user out and returns them to the home page. */
export function SignOutButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction())}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-mint disabled:opacity-60",
        className,
      )}
    >
      {ar.common.signOut}
    </button>
  );
}
