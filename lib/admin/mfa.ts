import * as OTPAuth from "otpauth";

import { getDb } from "@/lib/db";

import {
  MfaCryptoError,
  decryptMfaSecret,
  encryptMfaSecret,
  generateRecoveryCodes,
  hashRecoveryCode,
  isMfaEncryptionKeyConfigured,
  normalizeRecoveryCode,
  verifyRecoveryCode,
} from "./mfa-crypto";
import { isMfaEnforced } from "./mfa-policy";

/**
 * Administrator TOTP enrolment, verification, and recovery.
 *
 * The plaintext TOTP secret exists only inside this module boundary and in
 * memory. It is never written to an audit log, an application log, a URL, or a
 * response body. Recovery codes are returned exactly once, at generation time,
 * and only their scrypt hashes are stored.
 */

export const MFA_ISSUER = "JS Jewellers";
export const MFA_PERIOD_SECONDS = 30;
export const MFA_DIGITS = 6;
const MFA_WINDOW = 1;

export class MfaError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "MfaError";
    this.field = field;
  }
}

export type MfaStatus = {
  enforced: boolean;
  keyConfigured: boolean;
  enrolled: boolean;
  pending: boolean;
  confirmedAt: Date | null;
  recoveryCodesRemaining: number;
};

function totpFor(secretBase32: string, email: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: MFA_ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: MFA_DIGITS,
    period: MFA_PERIOD_SECONDS,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
}

function currentStep(now: number): number {
  return Math.floor(now / 1000 / MFA_PERIOD_SECONDS);
}

/**
 * Validate a six-digit code and return its time-step. Returns null for a
 * malformed or wrong code. Replay protection is applied by the caller with the
 * stored `lastUsedCounter`.
 */
export function validateTotpCode(
  secretBase32: string,
  email: string,
  code: string,
  now: number = Date.now(),
): number | null {
  if (!/^\d{6}$/.test(code.trim())) {
    return null;
  }

  const delta = totpFor(secretBase32, email).validate({
    token: code.trim(),
    timestamp: now,
    window: MFA_WINDOW,
  });

  if (delta === null) {
    return null;
  }

  return currentStep(now) + delta;
}

/** Current six-digit code. Used by tests only; never exposed to a client. */
export function generateTotpCode(
  secretBase32: string,
  email: string,
  now: number = Date.now(),
): string {
  return totpFor(secretBase32, email).generate({ timestamp: now });
}

export async function getMfaStatus(userId: string): Promise<MfaStatus> {
  const enforced = isMfaEnforced();
  const keyConfigured = isMfaEncryptionKeyConfigured();

  const credential = await getDb().adminMfaCredential.findUnique({
    where: { userId },
    select: {
      confirmedAt: true,
      recoveryCodes: {
        where: { usedAt: null },
        select: { id: true },
      },
    },
  });

  return {
    enforced,
    keyConfigured,
    enrolled: Boolean(credential?.confirmedAt),
    pending: Boolean(credential && !credential.confirmedAt),
    confirmedAt: credential?.confirmedAt ?? null,
    recoveryCodesRemaining: credential?.recoveryCodes.length ?? 0,
  };
}

export async function beginMfaEnrollment(input: {
  userId: string;
  email: string;
}): Promise<{ secret: string; uri: string }> {
  if (!isMfaEncryptionKeyConfigured()) {
    throw new MfaError(
      "encryption-key",
      "MFA encryption is not configured on this server. Set ADMIN_MFA_ENCRYPTION_KEY to a 32-byte key before enrolling.",
    );
  }

  const db = getDb();
  const existing = await db.adminMfaCredential.findUnique({
    where: { userId: input.userId },
    select: { confirmedAt: true },
  });

  if (existing?.confirmedAt) {
    throw new MfaError(
      "already-enrolled",
      "An authenticator is already enrolled for this account.",
    );
  }

  const secret = new OTPAuth.Secret({ size: 20 });
  const encryptedSecret = encryptMfaSecret(secret.base32);

  await db.$transaction(async (tx) => {
    const credential = await tx.adminMfaCredential.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        encryptedSecret,
      },
      update: {
        encryptedSecret,
        lastUsedCounter: 0,
        confirmedAt: null,
      },
      select: { id: true },
    });

    await tx.adminMfaRecoveryCode.deleteMany({
      where: { credentialId: credential.id },
    });
  });

  return {
    secret: secret.base32,
    uri: totpFor(secret.base32, input.email).toString(),
  };
}

export async function getPendingEnrollment(
  userId: string,
): Promise<{ secret: string; uri: string } | null> {
  const credential = await getDb().adminMfaCredential.findUnique({
    where: { userId },
    select: {
      encryptedSecret: true,
      confirmedAt: true,
      user: { select: { email: true } },
    },
  });

  if (!credential || credential.confirmedAt) {
    return null;
  }

  const secret = decryptMfaSecret(credential.encryptedSecret);

  if (!secret) {
    return null;
  }

  return {
    secret,
    uri: totpFor(secret, credential.user.email).toString(),
  };
}

export async function confirmMfaEnrollment(input: {
  userId: string;
  code: string;
}): Promise<{ recoveryCodes: string[] }> {
  const db = getDb();
  const credential = await db.adminMfaCredential.findUnique({
    where: { userId: input.userId },
    select: {
      id: true,
      encryptedSecret: true,
      confirmedAt: true,
      user: { select: { email: true } },
    },
  });

  if (!credential) {
    throw new MfaError(
      "not-started",
      "Start authenticator setup before entering a code.",
    );
  }

  if (credential.confirmedAt) {
    throw new MfaError(
      "already-enrolled",
      "An authenticator is already enrolled for this account.",
    );
  }

  const secret = decryptMfaSecret(credential.encryptedSecret);

  if (!secret) {
    throw new MfaError(
      "invalid-secret",
      "The pending authenticator secret could not be read. Start setup again.",
    );
  }

  const counter = validateTotpCode(secret, credential.user.email, input.code);

  if (counter === null) {
    throw new MfaError(
      "code",
      "That authenticator code is not valid. Check the device clock and try again.",
    );
  }

  const recoveryCodes = generateRecoveryCodes();

  await db.$transaction(async (tx) => {
    await tx.adminMfaCredential.update({
      where: { id: credential.id },
      data: { confirmedAt: new Date(), lastUsedCounter: counter },
    });

    await tx.adminMfaRecoveryCode.deleteMany({
      where: { credentialId: credential.id },
    });

    await tx.adminMfaRecoveryCode.createMany({
      data: recoveryCodes.map((code) => ({
        credentialId: credential.id,
        codeHash: hashRecoveryCode(code),
      })),
    });
  });

  return { recoveryCodes };
}

export type MfaVerification =
  | { ok: true; method: "totp" | "recovery-code" }
  | { ok: false; message: string };

/**
 * Verify an authenticator code or a recovery code for sign-in. The TOTP
 * time-step is recorded atomically so the same code cannot be replayed.
 */
export async function verifyMfaLogin(input: {
  userId: string;
  code: string;
}): Promise<MfaVerification> {
  const db = getDb();
  const credential = await db.adminMfaCredential.findUnique({
    where: { userId: input.userId },
    select: {
      id: true,
      encryptedSecret: true,
      confirmedAt: true,
      lastUsedCounter: true,
      user: { select: { email: true } },
    },
  });

  if (!credential || !credential.confirmedAt) {
    return {
      ok: false,
      message: "This account does not have an authenticator enrolled.",
    };
  }

  const raw = input.code.trim();

  if (/^\d{6}$/.test(raw)) {
    const secret = decryptMfaSecret(credential.encryptedSecret);

    if (!secret) {
      return {
        ok: false,
        message: "The authenticator secret could not be read. Contact a Super Admin.",
      };
    }

    const counter = validateTotpCode(secret, credential.user.email, raw);

    if (counter === null || counter <= credential.lastUsedCounter) {
      return {
        ok: false,
        message: "That authenticator code is not valid or has already been used.",
      };
    }

    const updated = await db.adminMfaCredential.updateMany({
      where: {
        id: credential.id,
        lastUsedCounter: { lt: counter },
      },
      data: { lastUsedCounter: counter },
    });

    if (updated.count !== 1) {
      return {
        ok: false,
        message: "That authenticator code is not valid or has already been used.",
      };
    }

    return { ok: true, method: "totp" };
  }

  const normalized = normalizeRecoveryCode(raw);

  if (normalized.length < 8) {
    return {
      ok: false,
      message: "Enter a six-digit authenticator code or one of your recovery codes.",
    };
  }

  const candidates = await db.adminMfaRecoveryCode.findMany({
    where: { credentialId: credential.id, usedAt: null },
    select: { id: true, codeHash: true },
  });

  for (const candidate of candidates) {
    if (!verifyRecoveryCode(normalized, candidate.codeHash)) {
      continue;
    }

    const consumed = await db.adminMfaRecoveryCode.updateMany({
      where: { id: candidate.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    if (consumed.count === 1) {
      return { ok: true, method: "recovery-code" };
    }
  }

  return {
    ok: false,
    message: "That recovery code is not valid or has already been used.",
  };
}

export async function regenerateRecoveryCodes(input: {
  userId: string;
  code: string;
}): Promise<{ recoveryCodes: string[] }> {
  const verification = await verifyMfaLogin({
    userId: input.userId,
    code: input.code,
  });

  if (!verification.ok) {
    throw new MfaError("code", verification.message);
  }

  const db = getDb();
  const credential = await db.adminMfaCredential.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });

  if (!credential) {
    throw new MfaError("not-enrolled", "No authenticator is enrolled.");
  }

  const recoveryCodes = generateRecoveryCodes();

  await db.$transaction(async (tx) => {
    await tx.adminMfaRecoveryCode.deleteMany({
      where: { credentialId: credential.id },
    });
    await tx.adminMfaRecoveryCode.createMany({
      data: recoveryCodes.map((code) => ({
        credentialId: credential.id,
        codeHash: hashRecoveryCode(code),
      })),
    });
  });

  return { recoveryCodes };
}

/**
 * Remove an administrator's authenticator and recovery codes. Used by a Super
 * Admin when a staff member loses both their device and their recovery sheet.
 */
export async function resetMfaForUser(userId: string): Promise<boolean> {
  const result = await getDb().adminMfaCredential.deleteMany({
    where: { userId },
  });

  return result.count > 0;
}

export { MfaCryptoError };
