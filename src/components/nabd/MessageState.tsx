import { PulseTrace } from "@/components/nabd/PulseTrace";
import { cn } from "@/lib/utils";

/**
 * Centered full-page state used by the designed 404 / 500 screens. Quiet and
 * clinical; the pulse rule is the only flourish. Actions are passed in so the
 * same layout serves both a server 404 and a client error boundary.
 */
export function MessageState({
  code,
  title,
  lead,
  actions,
  className,
}: {
  code?: string;
  title: string;
  lead: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      {code ? (
        <p className="font-data text-5xl font-bold tabular-nums text-teal">{code}</p>
      ) : null}
      <PulseTrace variant="rule" className="my-6 w-40" />
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">{title}</h1>
      <p className="mt-3 text-base leading-loose text-muted-ink">{lead}</p>
      {actions ? (
        <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
