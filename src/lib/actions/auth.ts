"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/auth";
import { loginRateLimitState } from "@/lib/rate-limit";
import { ar } from "@/content/ar";

/**
 * Login/logout server actions. They delegate to Auth.js's `signIn`/`signOut`
 * (which post to the Route Handler at /api/auth/*), so the session mutation
 * still travels through a handler. On success `signIn` throws a redirect that
 * must propagate; only an `AuthError` means bad credentials.
 */

export type LoginState = { error?: string };

type Intent = "patient" | "admin";
type Credentials = { email: string; password: string };

// Only same-origin relative paths are honored, to avoid an open redirect.
function safeCallback(url: string | undefined, fallback: string): string {
  if (url && url.startsWith("/") && !url.startsWith("//")) return url;
  return fallback;
}

async function performLogin(
  intent: Intent,
  credentials: Credentials,
  callbackUrl: string | undefined,
  fallback: string,
  messages: { invalid: string; rateLimited: string },
): Promise<LoginState> {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return { error: messages.invalid };

  const { email, password } = parsed.data;
  // The counter is owned by `authorize` (auth.ts); here we only read it to show
  // a friendly message — before the round-trip, and again if this attempt is
  // the one that tipped the key over the limit.
  const key = `${intent}:${email}`;

  if (loginRateLimitState(key).blocked) {
    return { error: messages.rateLimited };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      intent,
      redirectTo: safeCallback(callbackUrl, fallback),
    });
    return {};
  } catch (error) {
    // A successful sign-in throws a redirect — let it bubble up.
    if (error instanceof AuthError) {
      return {
        error: loginRateLimitState(key).blocked
          ? messages.rateLimited
          : messages.invalid,
      };
    }
    throw error;
  }
}

export async function patientLoginAction(
  credentials: Credentials,
  callbackUrl?: string,
): Promise<LoginState> {
  return performLogin("patient", credentials, callbackUrl, "/my-appointments", {
    invalid: ar.auth.login.errors.invalid,
    rateLimited: ar.auth.login.errors.rateLimited,
  });
}

export async function adminLoginAction(
  credentials: Credentials,
  callbackUrl?: string,
): Promise<LoginState> {
  return performLogin("admin", credentials, callbackUrl, "/dashboard", {
    invalid: ar.auth.adminLogin.errors.invalid,
    rateLimited: ar.auth.adminLogin.errors.rateLimited,
  });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
