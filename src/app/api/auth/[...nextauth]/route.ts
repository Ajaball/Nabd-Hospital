/**
 * Auth.js v5 route handlers (sign-in / callback / session / CSRF). All auth
 * traffic flows through here; the config lives in src/lib/auth.ts.
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
