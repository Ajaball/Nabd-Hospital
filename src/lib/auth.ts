import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validation/auth";
import { hitRateLimit, resetRateLimit } from "@/lib/rate-limit";

/**
 * Full Auth.js v5 config (CLAUDE.md §Phase 2 — Credentials + bcrypt, JWT
 * sessions with `role` on the token). Runs in the Node runtime only; the
 * middleware uses the leaner authConfig.
 *
 * Login attempts are rate-limited per email (in-memory; see rate-limit.ts for
 * the limitation). A failed authorize returns null so Auth.js surfaces a single
 * generic CredentialsSignin error — we never reveal whether the email exists.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase();

        // Rate-limit by email to blunt credential stuffing against one instance.
        const limit = hitRateLimit(`login:${normalizedEmail}`, 5, 60_000);
        if (!limit.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Successful login clears the counter.
        resetRateLimit(`login:${normalizedEmail}`);

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
