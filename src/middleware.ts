import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Route protection (CLAUDE.md §5 / Phase 2). Reads the JWT (no DB) via the
 * edge-safe config:
 *   - /dashboard/*     → ADMIN only  (except /dashboard/login, the admin login)
 *   - /my-appointments → PATIENT only
 * Unauthorized requests are redirected to the correct login with a callbackUrl
 * so the user returns to where they were headed after signing in. This is the
 * gate, not the whole story: every /api/v1 write re-checks the role server-side.
 */

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { nextUrl } = request;
  const path = nextUrl.pathname;
  const role = request.auth?.user?.role;

  if (path.startsWith("/dashboard")) {
    // The admin login page is public; bounce already-authenticated admins in.
    if (path === "/dashboard/login") {
      if (role === "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return;
    }
    if (role !== "ADMIN") {
      const loginUrl = new URL("/dashboard/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", path + nextUrl.search);
      return Response.redirect(loginUrl);
    }
    return;
  }

  if (path === "/my-appointments" && role !== "PATIENT") {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path + nextUrl.search);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/my-appointments"],
};
