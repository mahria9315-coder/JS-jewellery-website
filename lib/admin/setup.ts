import { getDb, isDatabaseConfigured } from "@/lib/db";
import { recordAdminAudit } from "./audit";
import { hashAdminPassword, safeStringEqual } from "./auth-crypto";
import { validateAdminPassword } from "./auth";
import { SUPER_ADMIN_ROLE_KEY } from "./permissions";
import {
  ADMIN_SETUP_SECRET_ENV,
  AdminSetupError,
  isAdminSetupSecretConfigured,
} from "./setup-shared";

export { ADMIN_SETUP_SECRET_ENV, AdminSetupError, isAdminSetupSecretConfigured };

/**
 * Secure, one-time first-administrator setup.
 *
 * The setup secret is read only from server-side environment variables and is
 * compared in constant time. It is never logged, returned to the browser, or
 * stored in the database. Account creation runs inside a database transaction
 * with a transaction-scoped advisory lock so two simultaneous requests cannot
 * both claim the first-admin bootstrap.
 */

const FIRST_ADMIN_ADVISORY_LOCK_ID = 734221;

export async function isFirstAdminSetupAvailable(): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    const count = await getDb().adminUser.count();
    return count === 0;
  } catch {
    return false;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateEmail(email: string): string | null {
  if (!email) return "Enter an administrator email address.";
  if (email.length > 254) return "Email address is too long.";
  // Pragmatic validation; the browser and database constraints also apply.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }
  return null;
}

export type ClaimFirstAdminInput = {
  email: string;
  name?: string | null;
  password: string;
  confirmPassword: string;
  setupSecret: string;
};

export type ClaimFirstAdminResult = {
  userId: string;
  email: string;
  name: string;
};

export async function claimFirstAdminSetup(
  input: ClaimFirstAdminInput,
): Promise<ClaimFirstAdminResult> {
  if (!isDatabaseConfigured()) {
    throw new AdminSetupError(
      "Administrator setup is unavailable because the database is not configured.",
    );
  }

  const configuredSecret = process.env[ADMIN_SETUP_SECRET_ENV]?.trim();

  if (!configuredSecret) {
    throw new AdminSetupError(
      `Administrator setup is not configured. Set the ${ADMIN_SETUP_SECRET_ENV} server environment variable before first-time setup.`,
    );
  }

  if (!safeStringEqual(input.setupSecret, configuredSecret)) {
    throw new AdminSetupError("The setup secret was not accepted.");
  }

  const email = normalizeEmail(input.email);
  const emailError = validateEmail(email);

  if (emailError) {
    throw new AdminSetupError(emailError);
  }

  if (input.password !== input.confirmPassword) {
    throw new AdminSetupError("The passwords did not match.");
  }

  const passwordError = validateAdminPassword(input.password);

  if (passwordError) {
    throw new AdminSetupError(passwordError);
  }

  const name = (input.name?.trim() || "Super Admin").slice(0, 120);
  const passwordHash = hashAdminPassword(input.password);
  const db = getDb();

  const result = await db.$transaction(async (tx) => {
    // Serialize first-admin claims. The count check below remains necessary;
    // the advisory lock prevents a race where two transactions observe zero.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${FIRST_ADMIN_ADVISORY_LOCK_ID})`;

    const count = await tx.adminUser.count();

    if (count > 0) {
      throw new AdminSetupError(
        "Administrator setup is no longer available because an administrator account already exists. Sign in instead.",
      );
    }

    const role = await tx.adminRole.findUnique({
      where: { key: SUPER_ADMIN_ROLE_KEY },
      select: { id: true },
    });

    if (!role) {
      throw new AdminSetupError(
        "Administrator setup could not continue because the Super Admin role is missing. Apply database migrations and try again.",
      );
    }

    return tx.adminUser.create({
      data: {
        email,
        name,
        passwordHash,
        roleId: role.id,
        status: "ACTIVE",
      },
      select: { id: true, email: true, name: true },
    });
  });

  await recordAdminAudit({
    actor: result.email,
    action: "auth.setup.first_admin",
    entityType: "AdminUser",
    entityId: result.id,
    summary: "Created the initial Super Admin account through first-time setup.",
  });

  return { userId: result.id, email: result.email, name: result.name };
}
