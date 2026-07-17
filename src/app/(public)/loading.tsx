import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton for public routes — no raw flash (CLAUDE.md §Phase 6). */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <Skeleton className="mb-6 h-px w-full" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-4 h-5 w-96 max-w-full" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
