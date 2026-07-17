import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Presentational form primitives shared by the auth forms. They own the label /
 * hint / error layout and the input styling so every field looks the same and
 * announces its error to assistive tech (`role="alert"`, `aria-describedby`).
 * The forms wire react-hook-form into these; these know nothing about it.
 */

export const inputClass =
  "w-full rounded-md border border-line bg-card px-3 py-2 text-base text-ink outline-none transition-colors duration-150 placeholder:text-muted-ink/70 focus-visible:border-teal aria-[invalid=true]:border-st-cancelled";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  const hintId = `${htmlFor}-hint`;
  const errorId = `${htmlFor}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-ink">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-st-cancelled">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type SubmitButtonProps = {
  pending?: boolean;
  children: ReactNode;
  className?: string;
};

export function SubmitButton({ pending, children, className }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "mt-1 inline-flex w-full items-center justify-center rounded-md bg-teal px-4 py-2.5 text-base font-semibold text-paper transition-[filter,opacity] duration-150 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

type FormErrorProps = { message?: string };

/** A top-of-form error banner for failures that aren't tied to one field
 *  (bad credentials, rate limiting, a server error). */
export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-st-cancelled/30 bg-st-cancelled/5 px-3 py-2 text-sm text-st-cancelled"
    >
      {message}
    </p>
  );
}
