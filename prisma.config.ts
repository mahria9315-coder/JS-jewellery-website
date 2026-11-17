import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { defineConfig } from "prisma/config";

/*
 * Prisma CLI configuration (Prisma ORM 7).
 *
 * Next.js loads .env.local automatically at runtime, but Prisma CLI commands
 * run outside Next.js. Load the same local file here so `prisma migrate`,
 * `prisma validate`, and `prisma studio` see DATABASE_URL without adding a
 * dotenv dependency. `.env.local` is ignored by Git; never commit real values.
 */
if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Empty fallback keeps offline commands such as `prisma generate` and
    // `prisma validate` usable before a local database password is supplied.
    url: process.env.DATABASE_URL ?? "",
  },
});
