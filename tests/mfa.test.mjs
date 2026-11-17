import assert from "node:assert/strict";
import test from "node:test";

import {
  MfaCryptoError,
  decryptMfaSecret,
  encryptMfaSecret,
  generateRecoveryCodes,
  hashRecoveryCode,
  isMfaEncryptionKeyConfigured,
  normalizeRecoveryCode,
  parseMfaEncryptionKey,
  verifyRecoveryCode,
} from "../lib/admin/mfa-crypto.ts";
import {
  generateTotpCode,
  validateTotpCode,
} from "../lib/admin/mfa.ts";
import { isMfaEnforced } from "../lib/admin/mfa-policy.ts";
import {
  MFA_CHALLENGE_TTL_SECONDS,
  createMfaChallengeToken,
  parseMfaChallenge,
} from "../lib/admin/mfa-challenge-token.ts";

// Deterministic, non-production values. Nothing here is a real credential.
process.env.ADMIN_MFA_ENCRYPTION_KEY = "a".repeat(64);
process.env.CHECKOUT_DRAFT_SECRET = "test-draft-secret-not-a-real-secret";

const SECRET_BASE32 = "JBSWY3DPEHPK3PXP";
const ACCOUNT_EMAIL = "administrator@example.test";

test("the MFA encryption key accepts base64 and hex but rejects wrong sizes", () => {
  assert.ok(parseMfaEncryptionKey("a".repeat(64)));
  assert.equal(parseMfaEncryptionKey("a".repeat(64)).length, 32);

  const base64 = Buffer.alloc(32, 7).toString("base64");
  assert.ok(parseMfaEncryptionKey(base64));

  const base64url = Buffer.alloc(32, 9).toString("base64url");
  assert.ok(parseMfaEncryptionKey(base64url));

  assert.equal(parseMfaEncryptionKey(""), null);
  assert.equal(parseMfaEncryptionKey(undefined), null);
  assert.equal(parseMfaEncryptionKey("too-short"), null);
  assert.equal(parseMfaEncryptionKey("a".repeat(63)), null);
});

test("key configuration only reports true for a usable key", () => {
  assert.equal(
    isMfaEncryptionKeyConfigured({ ADMIN_MFA_ENCRYPTION_KEY: "a".repeat(64) }),
    true,
  );
  assert.equal(isMfaEncryptionKeyConfigured({}), false);
  assert.equal(
    isMfaEncryptionKeyConfigured({ ADMIN_MFA_ENCRYPTION_KEY: "short" }),
    false,
  );
});

test("TOTP secrets round-trip through the AES-256-GCM envelope", () => {
  const first = encryptMfaSecret(SECRET_BASE32);
  const second = encryptMfaSecret(SECRET_BASE32);

  // A fresh IV means the same plaintext produces different ciphertext.
  assert.notEqual(first, second);
  assert.match(first, /^v1\./);
  assert.equal(decryptMfaSecret(first), SECRET_BASE32);
  assert.equal(decryptMfaSecret(second), SECRET_BASE32);
});

test("tampered, malformed, and differently-keyed envelopes fail closed", () => {
  const envelope = encryptMfaSecret(SECRET_BASE32);
  const [version, iv, tag, ciphertext] = envelope.split(".");

  assert.equal(
    decryptMfaSecret(`${version}.${iv}.${tag}.${ciphertext.slice(0, -2)}xx`),
    null,
  );
  assert.equal(decryptMfaSecret(`${version}.${iv}.${tag}`), null);
  assert.equal(decryptMfaSecret("not-an-envelope"), null);
  assert.equal(decryptMfaSecret(`${version}.${iv}.${tag}.`), null);

  const previousKey = process.env.ADMIN_MFA_ENCRYPTION_KEY;

  try {
    process.env.ADMIN_MFA_ENCRYPTION_KEY = "b".repeat(64);
    assert.equal(decryptMfaSecret(envelope), null);
  } finally {
    process.env.ADMIN_MFA_ENCRYPTION_KEY = previousKey;
  }
});

test("encrypting an empty secret is refused", () => {
  assert.throws(() => encryptMfaSecret(""), MfaCryptoError);
});

test("recovery codes are unique, readable, and stored only as hashes", () => {
  const codes = generateRecoveryCodes(10);

  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);

  for (const code of codes) {
    assert.match(code, /^[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/);

    const hash = hashRecoveryCode(code);

    assert.match(hash, /^scrypt\$/);
    assert.equal(hash.includes(normalizeRecoveryCode(code)), false);
    assert.equal(verifyRecoveryCode(code, hash), true);
    assert.equal(verifyRecoveryCode(code.toLowerCase(), hash), true);
    assert.equal(verifyRecoveryCode(code.replace("-", " "), hash), true);
  }
});

test("recovery code verification rejects wrong, short, and malformed values", () => {
  const [code] = generateRecoveryCodes(1);
  const hash = hashRecoveryCode(code);

  assert.equal(verifyRecoveryCode("AAAAA-AAAAA", hash), false);
  assert.equal(verifyRecoveryCode("", hash), false);
  assert.equal(verifyRecoveryCode("abc", hash), false);
  assert.equal(verifyRecoveryCode(code, "not-a-hash"), false);
  assert.throws(() => hashRecoveryCode("abc"), MfaCryptoError);
});

test("TOTP codes validate against the enrolled secret", () => {
  const now = Date.UTC(2026, 0, 2, 3, 4, 5);
  const code = generateTotpCode(SECRET_BASE32, ACCOUNT_EMAIL, now);

  assert.match(code, /^\d{6}$/);

  const counter = validateTotpCode(SECRET_BASE32, ACCOUNT_EMAIL, code, now);

  assert.equal(typeof counter, "number");
  assert.equal(counter, Math.floor(now / 1000 / 30));
});

test("TOTP validation rejects wrong, malformed, and out-of-window codes", () => {
  const now = Date.UTC(2026, 0, 2, 3, 4, 5);

  assert.equal(validateTotpCode(SECRET_BASE32, ACCOUNT_EMAIL, "000000", now), null);
  assert.equal(validateTotpCode(SECRET_BASE32, ACCOUNT_EMAIL, "12345", now), null);
  assert.equal(validateTotpCode(SECRET_BASE32, ACCOUNT_EMAIL, "abcdef", now), null);

  const code = generateTotpCode(SECRET_BASE32, ACCOUNT_EMAIL, now);
  const farFuture = now + 10 * 60 * 1000;

  assert.equal(
    validateTotpCode(SECRET_BASE32, ACCOUNT_EMAIL, code, farFuture),
    null,
  );
});

test("TOTP time-step counters advance across periods so replays are detectable", () => {
  const now = Date.UTC(2026, 0, 2, 3, 4, 5);
  const first = generateTotpCode(SECRET_BASE32, ACCOUNT_EMAIL, now);
  const firstCounter = validateTotpCode(SECRET_BASE32, ACCOUNT_EMAIL, first, now);
  const sameCounter = validateTotpCode(SECRET_BASE32, ACCOUNT_EMAIL, first, now);

  assert.equal(firstCounter, sameCounter);

  const later = now + 30 * 1000;
  const secondCounter = validateTotpCode(
    SECRET_BASE32,
    ACCOUNT_EMAIL,
    generateTotpCode(SECRET_BASE32, ACCOUNT_EMAIL, later),
    later,
  );

  assert.ok(secondCounter > firstCounter);
});

test("MFA is always enforced in production and opt-in in development", () => {
  assert.equal(isMfaEnforced({ NODE_ENV: "production" }), true);
  assert.equal(
    isMfaEnforced({ NODE_ENV: "production", ADMIN_MFA_REQUIRED: "false" }),
    true,
  );
  assert.equal(isMfaEnforced({ NODE_ENV: "test" }), false);
  assert.equal(
    isMfaEnforced({ NODE_ENV: "test", ADMIN_MFA_REQUIRED: "true" }),
    true,
  );
  assert.equal(
    isMfaEnforced({ NODE_ENV: "test", ADMIN_MFA_REQUIRED: "TRUE" }),
    true,
  );
});

test("MFA challenge tokens round-trip with a bounded lifetime", () => {
  const now = Date.UTC(2026, 0, 2, 3, 4, 5);
  const token = createMfaChallengeToken({
    userId: "user_123",
    next: "/admin/orders",
    now,
  });
  const parsed = parseMfaChallenge(token, now);

  assert.ok(parsed);
  assert.equal(parsed.userId, "user_123");
  assert.equal(parsed.next, "/admin/orders");
  assert.equal(parsed.issuedAt, now);
  assert.equal(parsed.expiresAt, now + MFA_CHALLENGE_TTL_SECONDS * 1000);
});

test("MFA challenge tokens reject tampering, expiry, and malformed input", () => {
  const now = Date.UTC(2026, 0, 2, 3, 4, 5);
  const token = createMfaChallengeToken({
    userId: "user_123",
    next: "/admin",
    now,
  });
  const [version, encoded, signature] = token.split(".");

  assert.equal(
    parseMfaChallenge(`${version}.${encoded}.${signature.slice(0, -2)}xx`, now),
    null,
  );
  assert.equal(
    parseMfaChallenge(`${version}.${encoded}x.${signature}`, now),
    null,
  );
  assert.equal(parseMfaChallenge("not-a-token", now), null);
  assert.equal(
    parseMfaChallenge(token, now + MFA_CHALLENGE_TTL_SECONDS * 1000 + 1),
    null,
  );

  const forgedPayload = Buffer.from(
    JSON.stringify({
      userId: "attacker",
      next: "/admin",
      issuedAt: now,
      expiresAt: now + 5 * 60 * 1000,
    }),
  ).toString("base64url");

  assert.equal(
    parseMfaChallenge(`${version}.${forgedPayload}.${signature}`, now),
    null,
  );
});
