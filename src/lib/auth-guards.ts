/**
 * Server-side authorization helpers (CLAUDE.md §Phase 5 — every admin endpoint
 * checks role === 'ADMIN' server-side; hiding a button is not authorization).
 */
import { auth } from "@/lib/auth";

/** The session when the caller is an ADMIN, otherwise null. */
export async function getAdminSession() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}
