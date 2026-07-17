import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

/**
 * Type augmentation so `session.user.role` is strongly typed (CLAUDE.md §2.6 —
 * no `any`). The Credentials `authorize` returns a `role`; the jwt callback
 * copies it to the token and the session callback exposes it here.
 */
declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: Role;
  }
}
