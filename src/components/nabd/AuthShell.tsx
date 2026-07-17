import { PulseTrace } from "@/components/nabd/PulseTrace";

/**
 * The centered card used by the login and register screens. Led by the pulse
 * hairline so the auth pages stay in the same visual language as the site.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 sm:py-24">
      <div className="rounded-lg border border-line bg-card p-6 shadow-clinical sm:p-8">
        <PulseTrace variant="rule" className="mb-6" />
        <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-ink">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      {footer ? (
        <div className="mt-6 text-center text-sm text-muted-ink">{footer}</div>
      ) : null}
    </div>
  );
}
