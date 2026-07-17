import type { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { fail } from "@/lib/http";
import { ar } from "@/content/ar";

/**
 * Server-side authorization guards for Route Handlers (CLAUDE.md §5: hiding a
 * button is not authorization — every mutating endpoint checks the role here).
 *
 * Usage:
 *   const guard = await requireAdmin();
 *   if ("error" in guard) return guard.error;
 *   // guard.session is a typed ADMIN session
 */

type Guard = { session: Session } | { error: NextResponse };

export async function requireAdmin(): Promise<Guard> {
  const session = await auth();
  if (!session?.user) {
    return { error: fail(ar.errors.unauthorized, 401, { code: "UNAUTHENTICATED" }) };
  }
  if (session.user.role !== "ADMIN") {
    return { error: fail(ar.errors.forbidden, 403, { code: "FORBIDDEN" }) };
  }
  return { session };
}

export async function requireSession(): Promise<Guard> {
  const session = await auth();
  if (!session?.user) {
    return { error: fail(ar.errors.unauthorized, 401, { code: "UNAUTHENTICATED" }) };
  }
  return { session };
}
