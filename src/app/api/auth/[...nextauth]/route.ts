import { handlers } from "@/lib/auth";

// Auth.js v5 mounts its sign-in / callback / session endpoints here. `signIn`
// (used by the login server actions) posts to this route handler.
export const { GET, POST } = handlers;
