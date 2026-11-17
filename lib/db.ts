import { PrismaPg } from "@prisma/adapter-pg";

import { validateDatabaseUrl } from "@/lib/env/production";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Single Prisma client with the PostgreSQL driver adapter.
 *
 * The client is created lazily so build-time imports do not require a database
 * connection, and it is cached on `globalThis` in every environment: in
 * development to survive hot reloads, and in production so repeated calls
 * reuse one connection pool instead of exhausting PostgreSQL's
 * max_connections. Never import this module into client components.
 */

type PrismaGlobal = typeof globalThis & {
  __jsJewellersPrisma?: PrismaClient;
};

const prismaGlobal = globalThis as PrismaGlobal;

export function isDatabaseConfigured(): boolean {
  const value = process.env.DATABASE_URL?.trim();
  return Boolean(value);
}

export function getDb(): PrismaClient {
  if (prismaGlobal.__jsJewellersPrisma) {
    return prismaGlobal.__jsJewellersPrisma;
  }

  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured. Set the server-only PostgreSQL connection string (for production, the Neon pooled connection string) before using database-backed features.",
    );
  }

  const validationError = validateDatabaseUrl(connectionString);

  if (validationError) {
    // Never include the connection string in the error: it contains a password.
    throw new Error(`${validationError} Database-backed features are unavailable.`);
  }

  const poolMax = Number.parseInt(process.env.DATABASE_POOL_MAX?.trim() ?? "", 10);
  const boundedPoolMax =
    Number.isInteger(poolMax) && poolMax > 0 && poolMax <= 100 ? poolMax : undefined;

  const client = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      ...(boundedPoolMax ? { max: boundedPoolMax } : {}),
    }),
  });

  prismaGlobal.__jsJewellersPrisma = client;

  return client;
}
