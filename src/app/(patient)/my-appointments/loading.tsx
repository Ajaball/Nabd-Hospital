import { SiteHeader } from "@/components/nabd/SiteHeader";
import { SiteFooter } from "@/components/nabd/SiteFooter";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyAppointmentsLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-64 max-w-full" />
        <Skeleton className="my-10 h-px w-full" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
