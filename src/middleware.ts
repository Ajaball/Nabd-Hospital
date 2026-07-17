import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

/**
 * Route protection (CLAUDE.md §Phase 2):
 *   /dashboard/*       → ADMIN only (except the admin login itself)
 *   /my-appointments/* → PATIENT only
 * Unauthorized requests redirect to the matching login with a callbackUrl so the
 * user returns to where they were headed after signing in. Uses the edge-safe
 * authConfig (no Prisma/bcrypt), so it runs in the middleware runtime.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const role = req.auth?.user?.role;
  const path = nextUrl.pathname;

  const isAdminArea = path.startsWith("/dashboard") && path !== "/dashboard/login";
  const isPatientArea = path.startsWith("/my-appointments");

  if (isAdminArea && role !== "ADMIN") {
    const url = new URL("/dashboard/login", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (isPatientArea && role !== "PATIENT") {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  // Run only on the protected areas; everything else skips the middleware.
  matcher: ["/dashboard/:path*", "/my-appointments/:path*"],
};
