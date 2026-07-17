import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

/**
 * Module augmentation so `session.user.role` and the JWT `role` claim are typed
 * end-to-end (CLAUDE.md §2.6 — no `any`). Every access-control decision reads
 * this typed role rather than re-querying the database.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

// Auth.js resolves the JWT type from @auth/core/jwt inside its callback
// signatures, so the same fields must be augmented there for `token.id` /
// `token.role` to be typed in the config callbacks.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
