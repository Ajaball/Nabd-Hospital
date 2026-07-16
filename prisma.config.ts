import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration. Connection URLs live here (no longer in the schema).
 * The CLI (migrate / db / studio / seed) connects via datasource.url; the
 * runtime client connects through the pg driver adapter in src/lib/db.ts.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  // The migration engine connects directly via this URL (and creates a shadow
  // database for `migrate dev`).
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
