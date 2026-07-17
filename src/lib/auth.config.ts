import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe Auth.js config. It carries no providers and no Node-only imports
 * (bcrypt, Prisma), so it can be imported by the middleware, which runs on the
 * edge runtime. The full config in `auth.ts` spreads this and adds the
 * Credentials provider.
 *
 * JWT sessions carry the user's id and role on the token, which is what lets the
 * middleware authorize requests without touching the database.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    // Patient area default; the admin area redirects to its own login in
    // middleware. Auth.js sends unauthenticated Server Component `auth()` calls
    // here by default.
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      // The JWT stores id/role as untyped claims; narrow before exposing them.
      if (session.user) {
        if (typeof token.uid === "string") session.user.id = token.uid;
        if (typeof token.role === "string") {
          session.user.role = token.role as Role;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
