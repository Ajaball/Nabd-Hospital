import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitises a post-login callbackUrl to a same-origin path, preventing an open
 * redirect. Only a single-slash absolute path (e.g. "/my-appointments") is
 * accepted; anything else (protocol-relative "//host", absolute URLs) falls back.
 */
export function safeCallbackUrl(
  value: string | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
