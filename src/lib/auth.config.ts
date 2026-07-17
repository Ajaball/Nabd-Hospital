import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe base auth configuration. It carries NO providers and touches NO
 * database, so it can run inside the middleware (Edge runtime) to read the JWT
 * session. The Node-only pieces — the Credentials provider, bcrypt, Prisma —
 * live in src/lib/auth.ts, which spreads this config.
 *
 * This split is the Auth.js v5 recommendation: Prisma 7 (pg driver adapter)
 * cannot run on the Edge, but middleware still needs to decode the session
 * cookie to enforce access control.
 */
export const authConfig = {
  // Required for self-hosted / proxied production (Vercel sets this implicitly,
  // but being explicit keeps `next start` and any non-Vercel host working).
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    // Default sign-in page for patient-protected routes. The middleware picks
    // the admin login explicitly for /dashboard.
    signIn: "/login",
  },
  callbacks: {
    // Persist the user's id and role onto the JWT at sign-in time, so every
    // later request (including Edge middleware) has the role without a DB hit.
    jwt({ token, user }) {
      // `user` is present only at sign-in; it is the object returned by the
      // Credentials `authorize` callback, which always carries id + role. The
      // library types it as a broader union, so we narrow before assigning.
      if (user) {
        if (user.id) token.id = user.id;
        if ("role" in user) token.role = user.role;
      }
      return token;
    },
    // Expose the typed id + role on the session for Server Components and
    // Route Handlers.
    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
  // Providers are attached in src/lib/auth.ts (Node runtime only).
  providers: [],
} satisfies NextAuthConfig;
