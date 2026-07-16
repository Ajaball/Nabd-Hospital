import type { ReactNode } from "react";
import Link from "next/link";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/**
 * The shared frame for the auth screens (login, register, admin login): a
 * single centered card carrying the pulse hairline, a title and subtitle, the
 * form, and an optional footer link. Keeps the three screens visually coherent
 * while each supplies its own body.
 */
type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <Link
        href="/"
        className="mb-6 block text-center text-sm font-medium text-teal transition-[filter] duration-150 hover:brightness-90"
      >
        {ar.site.name}
      </Link>

      <section
        className={cn(
          "rounded-lg border border-line bg-card p-8 shadow-clinical",
          className,
        )}
      >
        <PulseTrace variant="rule" className="mb-6" />
        <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-ink">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </section>

      {footer ? (
        <p className="mt-6 text-center text-sm text-muted-ink">{footer}</p>
      ) : null}
    </main>
  );
}
