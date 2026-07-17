import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validation/auth";
import {
  clearLoginFailures,
  loginRateLimitState,
  recordLoginFailure,
} from "@/lib/rate-limit";

/**
 * The full Auth.js v5 config. Credentials provider + bcrypt + Prisma live here
 * (Node runtime only). The `intent` credential keeps the two login areas
 * separate: the patient login authorizes only PATIENT accounts and the admin
 * login only ADMIN accounts, so an account can never sign in through the wrong
 * door. Authorization failures return null — Auth.js surfaces a single generic
 * error, never revealing whether the email exists.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
        intent: { label: "intent", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const intent = credentials?.intent === "admin" ? "admin" : "patient";

        // Rate limiting lives here, the single choke point for every credential
        // check — so a direct POST to the callback endpoint is limited too, not
        // only the login UI. A blocked key is rejected without incrementing.
        const key = `${intent}:${email}`;
        if (loginRateLimitState(key).blocked) return null;

        const reject = () => {
          recordLoginFailure(key);
          return null;
        };

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return reject();

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) return reject();

        // Enforce that each login area only admits its own role.
        if (intent === "admin" && user.role !== "ADMIN") return reject();
        if (intent === "patient" && user.role !== "PATIENT") return reject();

        clearLoginFailures(key);
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
