"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/auth";
import {
  rateLimit,
  LOGIN_RATE_LIMIT,
  LOGIN_RATE_WINDOW_MS,
} from "@/lib/services/rate-limit";
import { ar } from "@/content/ar";

export type LoginActionState = { error: string | null };

/**
 * Server action behind the login forms. It rate-limits by IP+email (see
 * rate-limit.ts) and then delegates the password check to the Credentials
 * provider via Auth.js `signIn`. On success `signIn` throws a redirect to
 * `callbackUrl`, which we rethrow so the framework navigates; on failure it
 * throws an AuthError, which we translate to a single opaque message (never
 * revealing whether the email or password was wrong).
 */
export async function authenticate(
  input: { email: string; password: string },
  callbackUrl: string,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: ar.auth.login.invalidCredentials };
  }
  const { email, password } = parsed.data;

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(
    `login:${ip}:${email}`,
    LOGIN_RATE_LIMIT,
    LOGIN_RATE_WINDOW_MS,
  );
  if (!limit.ok) {
    return { error: ar.auth.login.rateLimited };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: ar.auth.login.invalidCredentials };
    }
    // NEXT_REDIRECT thrown by a successful signIn — let it propagate.
    throw error;
  }

  return { error: null };
}
