import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

import {
  hashScryptValue,
  verifyScryptValue,
} from "./auth-crypto";

/**
 * Administrator MFA cryptography.
 *
 * TOTP secrets are encrypted at rest with AES-256-GCM. The key is supplied
 * only through `ADMIN_MFA_ENCRYPTION_KEY` as 32 raw bytes encoded as base64
 * (standard or URL-safe) or 64 hexadecimal characters. The key, the plaintext
 * secret, and generated recovery codes are never logged.
 *
 * Recovery codes are shown once and stored only as salted scrypt hashes using
 * the same vetted KDF as administrator passwords.
 */

export const ADMIN_MFA_ENCRYPTION_KEY_ENV = "ADMIN_MFA_ENCRYPTION_KEY" as const;

export const RECOVERY_CODE_COUNT = 10;
const RECOVERY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const RECOVERY_GROUP = 5;
const RECOVERY_GROUPS = 2;

const ENVELOPE_VERSION = "v1";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

export function parseMfaEncryptionKey(raw: string | undefined): Buffer | null {
  const value = raw?.trim();

  if (!value) {
    return null;
  }

  let key: Buffer;

  if (/^[0-9a-f]{64}$/i.test(value)) {
    key = Buffer.from(value, "hex");
  } else {
    key = Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  }

  return key.length === KEY_BYTES ? key : null;
}

export function isMfaEncryptionKeyConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return parseMfaEncryptionKey(env[ADMIN_MFA_ENCRYPTION_KEY_ENV]) !== null;
}

function encryptionKey(): Buffer {
  const key = parseMfaEncryptionKey(
    process.env[ADMIN_MFA_ENCRYPTION_KEY_ENV],
  );

  if (!key) {
    throw new MfaCryptoError(
      `${ADMIN_MFA_ENCRYPTION_KEY_ENV} is not configured with a 32-byte key.`,
    );
  }

  return key;
}

export class MfaCryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MfaCryptoError";
  }
}

/** Encrypt a TOTP secret. Returns a versioned, self-describing envelope. */
export function encryptMfaSecret(plaintext: string): string {
  if (!plaintext) {
    throw new MfaCryptoError("Cannot encrypt an empty MFA secret.");
  }

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    ENVELOPE_VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

/**
 * Decrypt an envelope. Returns null for malformed, tampered, or
 * differently-keyed values instead of throwing, so a corrupted row fails
 * closed without leaking cryptographic detail.
 */
export function decryptMfaSecret(envelope: string): string | null {
  const parts = envelope.split(".");

  if (parts.length !== 4 || parts[0] !== ENVELOPE_VERSION) {
    return null;
  }

  const [, ivPart, tagPart, ciphertextPart] = parts;

  try {
    const iv = Buffer.from(ivPart, "base64url");
    const tag = Buffer.from(tagPart, "base64url");
    const ciphertext = Buffer.from(ciphertextPart, "base64url");

    if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
      return null;
    }

    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

/**
 * Generate one-time recovery codes. Ambiguous characters (I, O, 0, 1) are
 * excluded so a code can be read from a printed sheet safely.
 */
export function generateRecoveryCodes(
  count: number = RECOVERY_CODE_COUNT,
): string[] {
  const codes: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const groups: string[] = [];

    for (let group = 0; group < RECOVERY_GROUPS; group += 1) {
      const bytes = randomBytes(RECOVERY_GROUP);
      let text = "";

      for (const byte of bytes) {
        text += RECOVERY_ALPHABET[byte % RECOVERY_ALPHABET.length];
      }

      groups.push(text);
    }

    codes.push(groups.join("-"));
  }

  return codes;
}

/** Case- and separator-insensitive form used for storage and comparison. */
export function normalizeRecoveryCode(code: string): string {
  return code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function hashRecoveryCode(code: string): string {
  const normalized = normalizeRecoveryCode(code);

  if (normalized.length < 8) {
    throw new MfaCryptoError("Recovery code is too short.");
  }

  return hashScryptValue(normalized);
}

export function verifyRecoveryCode(code: string, hash: string): boolean {
  const normalized = normalizeRecoveryCode(code);

  if (normalized.length < 8) {
    return false;
  }

  return verifyScryptValue(normalized, hash);
}
