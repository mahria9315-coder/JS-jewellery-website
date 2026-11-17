import { getDb } from "@/lib/db";

import {
  MIN_ADMIN_PASSWORD_LENGTH,
  hashAdminPassword,
  verifyAdminPassword,
} from "./auth-crypto";
import { recordAdminAudit } from "./audit";

/**
 * Administrator authentication and account security.
 *
 * Failed attempts are counted per account and lock the account temporarily.
 * The same generic message is returned for an unknown email, a wrong password,
 * a disabled account, and a locked account so the form does not reveal which
 * accounts exist. Password hashing always runs, even for unknown emails, to
 * keep the response timing comparable.
 */

export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;

// A valid scrypt hash for a value that is not any real password. Used only to
// equalise timing when the supplied email does not exist.
const DUMMY_PASSWORD_HASH =
  "scrypt$16384$8$1$d7329e54988b909e22f644fb8e19c14e$aed799c5ff707c7922d138a1077c0bdcc2f76c0a9f5bb7b5733365e6179bebb3747c61353cda08065e2536369597a8bdec25546827295c4d42bb5befc21605b9";

const GENERIC_FAILURE = "Those administrator details did not match.";

export type AdminLoginResult =
  | { ok: true; userId: string; email: string; name: string }
  | { ok: false; message: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateAdminPassword(password: string): string | null {
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`;
  }

  if (password.length > 200) {
    return "Use 200 characters or fewer.";
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Include at least one letter and one number.";
  }

  return null;
}

export async function authenticateAdmin(
  rawEmail: string,
  password: string,
): Promise<AdminLoginResult> {
  const email = normalizeEmail(rawEmail);
  const db = getDb();

  const user = await db.adminUser.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      status: true,
      failedLoginCount: true,
      lockedUntil: true,
    },
  });

  const passwordMatches = verifyAdminPassword(
    password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );

  if (!user) {
    return { ok: false, message: GENERIC_FAILURE };
  }

  const now = new Date();
  const locked = user.lockedUntil !== null && user.lockedUntil > now;

  if (!passwordMatches || user.status !== "ACTIVE" || locked) {
    if (user.status === "ACTIVE" && !locked) {
      const failedLoginCount = user.failedLoginCount + 1;
      const lock = failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS;

      await db.adminUser.update({
        where: { id: user.id },
        data: {
          failedLoginCount: lock ? 0 : failedLoginCount,
          lockedUntil: lock
            ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000)
            : null,
        },
      });

      await recordAdminAudit({
        actor: user.email,
        action: lock ? "auth.lock" : "auth.failed",
        entityType: "AdminUser",
        entityId: user.id,
        summary: lock
          ? "Account locked after repeated failed sign-in attempts."
          : "Failed administrator sign-in attempt.",
      });
    }

    return { ok: false, message: GENERIC_FAILURE };
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: {
      lastLoginAt: now,
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  await recordAdminAudit({
    actor: user.email,
    action: "auth.login",
    entityType: "AdminUser",
    entityId: user.id,
    summary: "Administrator signed in.",
  });

  return { ok: true, userId: user.id, email: user.email, name: user.name };
}

export async function changeOwnPassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getDb();
  const user = await db.adminUser.findUnique({
    where: { id: input.userId },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!user || !verifyAdminPassword(input.currentPassword, user.passwordHash)) {
    return { ok: false, message: "Your current password did not match." };
  }

  const passwordError = validateAdminPassword(input.newPassword);

  if (passwordError) {
    return { ok: false, message: passwordError };
  }

  if (verifyAdminPassword(input.newPassword, user.passwordHash)) {
    return {
      ok: false,
      message: "Choose a password that differs from the current password.",
    };
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: hashAdminPassword(input.newPassword) },
  });

  await recordAdminAudit({
    actor: user.email,
    action: "auth.password.change",
    entityType: "AdminUser",
    entityId: user.id,
    summary: "Changed their own administrator password.",
  });

  return { ok: true };
}
