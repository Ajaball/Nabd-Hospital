import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";

/**
 * Full auth configuration (Node runtime). Extends the edge-safe base with the
 * Credentials provider, which verifies passwords with bcrypt against the User
 * table. JWT sessions carry the role (see auth.config.ts callbacks).
 *
 * Rate limiting lives at the API boundary (the login form posts through a
 * server action / route that checks src/lib/services/rate-limit.ts), not here,
 * because `authorize` has no reliable access to the client IP.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // Re-validate at the boundary — never trust the caller (CLAUDE.md §2.7).
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          // Hash a throwaway value so the response time doesn't reveal whether
          // the email exists (mitigates user enumeration via timing).
          await bcrypt.compare(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinva");
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
});
