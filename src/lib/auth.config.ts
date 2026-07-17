import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (CLAUDE.md §Phase 2). This half carries no database
 * or bcrypt imports, so it can run in the middleware (Edge runtime). The
 * Credentials provider — which needs Prisma + bcrypt — is added in auth.ts,
 * which runs only in the Node runtime.
 *
 * The jwt/session callbacks carry `role` and `id` from the authorized user onto
 * the token and then onto the session, so authorization is available everywhere.
 */
export const authConfig = {
  // The app runs behind a proxy in this environment; trust the forwarded host.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        if (user.id) token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
