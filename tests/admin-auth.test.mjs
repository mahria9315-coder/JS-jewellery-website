import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_SESSION_DURATION_SECONDS,
  MIN_ADMIN_PASSWORD_LENGTH,
  createAdminSessionToken,
  generateAdminSessionToken,
  hashAdminIp,
  hashAdminPassword,
  hashAdminSessionToken,
  safeStringEqual,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from "../lib/admin/auth-crypto.ts";

const PASSWORD = "correct horse battery staple";
const SECRET = "test-session-secret-not-a-real-secret";

test("administrator passwords are stored as salted scrypt hashes", () => {
  const first = hashAdminPassword(PASSWORD);
  const second = hashAdminPassword(PASSWORD);

  assert.notEqual(first, second, "each hash must use a fresh salt");
  assert.match(first, /^scrypt\$16384\$8\$1\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  assert.equal(first.includes(PASSWORD), false);
  assert.equal(verifyAdminPassword(PASSWORD, first), true);
  assert.equal(verifyAdminPassword(PASSWORD, second), true);
});

test("password verification rejects wrong and malformed hashes", () => {
  const stored = hashAdminPassword(PASSWORD);

  assert.equal(verifyAdminPassword("wrong password value", stored), false);
  assert.equal(verifyAdminPassword(PASSWORD, ""), false);
  assert.equal(verifyAdminPassword(PASSWORD, "not-a-hash"), false);
  assert.equal(verifyAdminPassword(PASSWORD, "scrypt$1$2$3$4$5"), false);
});

test("short administrator passwords are rejected before hashing", () => {
  assert.throws(
    () => hashAdminPassword("short"),
    new RegExp(String(MIN_ADMIN_PASSWORD_LENGTH)),
  );
  assert.ok(MIN_ADMIN_PASSWORD_LENGTH >= 12);
});

test("session tokens round-trip and carry no password material", () => {
  const now = 1_800_000_000_000;
  const token = createAdminSessionToken("admin@example.com", SECRET, now);
  const payload = verifyAdminSessionToken(token, SECRET, now + 1000);

  assert.ok(payload);
  assert.equal(payload.email, "admin@example.com");
  assert.equal(payload.issuedAt, now);
  assert.equal(
    payload.expiresAt,
    now + ADMIN_SESSION_DURATION_SECONDS * 1000,
  );
  assert.equal(token.includes(PASSWORD), false);
  assert.equal(token.includes(SECRET), false);
});

test("session tokens are rejected when tampered, wrong-secret, or expired", () => {
  const now = 1_800_000_000_000;
  const token = createAdminSessionToken("admin@example.com", SECRET, now);
  const parts = token.split(".");

  assert.equal(verifyAdminSessionToken(token, "different-secret", now), null);
  assert.equal(verifyAdminSessionToken(`${token}x`, SECRET, now), null);
  assert.equal(verifyAdminSessionToken("", SECRET, now), null);
  assert.equal(verifyAdminSessionToken("v1.only-two", SECRET, now), null);

  const tamperedPayload = [
    parts[0],
    Buffer.from(JSON.stringify({ email: "attacker@example.com", issuedAt: now, expiresAt: now + 1000 })).toString("base64url"),
    parts[2],
  ].join(".");
  assert.equal(verifyAdminSessionToken(tamperedPayload, SECRET, now), null);

  const expiredAt = now + ADMIN_SESSION_DURATION_SECONDS * 1000;
  assert.equal(verifyAdminSessionToken(token, SECRET, expiredAt), null);
});

test("opaque session tokens are random and hashed before storage", () => {
  const first = generateAdminSessionToken();
  const second = generateAdminSessionToken();

  assert.notEqual(first, second);
  assert.equal(hashAdminSessionToken(first), hashAdminSessionToken(first));
  assert.notEqual(hashAdminSessionToken(first), hashAdminSessionToken(second));
  assert.match(hashAdminSessionToken(first), /^[0-9a-f]{64}$/);
});

test("IP addresses are hashed and truncated for storage", () => {
  const hash = hashAdminIp("203.0.113.7");

  assert.equal(hash.length, 32);
  assert.match(hash, /^[0-9a-f]{32}$/);
  assert.notEqual(hash, hashAdminIp("203.0.113.8"));
  assert.equal(hash.includes("203.0.113.7"), false);
});

test("constant-time string comparison is correct", () => {
  assert.equal(safeStringEqual("same", "same"), true);
  assert.equal(safeStringEqual("same", "different"), false);
  assert.equal(safeStringEqual("", ""), true);
});
