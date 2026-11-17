import { isDatabaseConfigured } from "@/lib/db";

/**
 * Server-only administrator readiness information.
 *
 * No password hash or session secret is read here. Authentication is backed by
 * database accounts created by the website owner through the secure one-time
 * first-admin setup (or the owner-run break-glass recovery script); this helper
 * only reports whether the database is reachable and whether any account
 * exists, so the sign-in page can explain a missing setup step.
 */

export const ADMIN_BOOTSTRAP_ENV_KEYS = [
  "ADMIN_BOOTSTRAP_EMAIL",
  "ADMIN_BOOTSTRAP_PASSWORD",
] as const;

export type AdminReadiness =
  | { state: "database-unconfigured"; adminCount: 0 }
  | { state: "database-error"; adminCount: 0 }
  | { state: "no-accounts"; adminCount: 0 }
  | { state: "ready"; adminCount: number };

export async function getAdminReadiness(): Promise<AdminReadiness> {
  if (!isDatabaseConfigured()) {
    return { state: "database-unconfigured", adminCount: 0 };
  }

  try {
    const { getDb } = await import("@/lib/db");
    const adminCount = await getDb().adminUser.count();

    if (adminCount === 0) {
      return { state: "no-accounts", adminCount: 0 };
    }

    return { state: "ready", adminCount };
  } catch {
    return { state: "database-error", adminCount: 0 };
  }
}
