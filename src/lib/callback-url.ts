/**
 * Only ever redirect to an internal, single-slash path. This blocks open-redirect
 * payloads like `//evil.com` or `https://evil.com` arriving via ?callbackUrl.
 */
export function safeCallbackUrl(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
