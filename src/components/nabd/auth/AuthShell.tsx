import Link from "next/link";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ar } from "@/content/ar";

type Props = {
  title: string;
  lead: string;
  /** "patient" is the public clinical look; "admin" is the dark staff portal. */
  tone?: "patient" | "admin";
  children: React.ReactNode;
};

/**
 * Centered card shell shared by the login/register screens. The admin tone is
 * deliberately darker so staff can tell at a glance they are on the internal
 * portal, not the public patient site (CLAUDE.md §4 — clinical wayfinding).
 */
export function AuthShell({ title, lead, tone = "patient", children }: Props) {
  const isAdmin = tone === "admin";

  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center justify-center px-6 py-16",
        isAdmin ? "bg-ink" : "bg-paper",
      )}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className={cn(
              "mx-auto block w-fit text-xl font-bold tracking-[-0.01em]",
              isAdmin ? "text-paper" : "text-ink",
            )}
          >
            {ar.site.name}
          </Link>
          <PulseTrace variant="rule" className="mx-auto mt-4 max-w-[12rem]" />
        </div>

        <Card className={cn(isAdmin && "border-transparent")}>
          <CardContent className="p-7">
            <div className="mb-6 space-y-1.5">
              <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
                {title}
              </h1>
              <p className="text-sm text-muted-ink">{lead}</p>
            </div>
            {children}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
