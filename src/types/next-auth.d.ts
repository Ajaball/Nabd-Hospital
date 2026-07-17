import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";
// Anchor the core JWT module so the augmentation below merges into it.
import "@auth/core/jwt";

/**
 * Auth.js v5 module augmentation (CLAUDE.md §Phase 2). Puts the typed `role` on
 * the session user and the JWT so authorization checks are type-safe end to end.
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

// next-auth/jwt re-exports @auth/core/jwt with no local JWT interface, so the
// augmentation must target the core module for the merge to take effect.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
