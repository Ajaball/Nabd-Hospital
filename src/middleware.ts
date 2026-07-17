import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

/**
 * Access control at the edge (CLAUDE.md §5 — exactly two roles).
 *
 *   /dashboard/*        → ADMIN only   (except /dashboard/login)
 *   /my-appointments    → PATIENT only
 *
 * Unauthorized users are redirected to the correct login with a callbackUrl so
 * they land back where they were headed after signing in. This uses the
 * edge-safe base config (no Prisma) and reads role from the JWT.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const role = req.auth?.user?.role;
  const isLoggedIn = Boolean(req.auth);

  const path = nextUrl.pathname;
  const isAdminArea = path.startsWith("/dashboard") && path !== "/dashboard/login";
  const isPatientArea = path === "/my-appointments" || path.startsWith("/my-appointments/");

  if (isAdminArea && role !== "ADMIN") {
    const url = new URL("/dashboard/login", nextUrl.origin);
    url.searchParams.set("callbackUrl", path + nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (isPatientArea && role !== "PATIENT") {
    const url = new URL("/login", nextUrl.origin);
    url.searchParams.set("callbackUrl", path + nextUrl.search);
    return NextResponse.redirect(url);
  }

  // A signed-in user visiting a login page is sent to their home surface.
  if (isLoggedIn && (path === "/login" || path === "/dashboard/login")) {
    const dest = role === "ADMIN" ? "/dashboard" : "/my-appointments";
    return NextResponse.redirect(new URL(dest, nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/my-appointments/:path*", "/login"],
};
