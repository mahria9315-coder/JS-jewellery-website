import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

/**
 * Administrator credential and session cryptography.
 *
 * Uses Node's built-in scrypt KDF and SHA-256; no extra dependency is required.
 * Passwords are stored only as salted scrypt hashes in the database. Session
 * cookies contain a random opaque token; only its SHA-256 hash is stored, so a
 * database leak does not expose usable sessions.
 *
 * Dependency-free (apart from node:crypto) for unit tests.
 */

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const MAX_MEM = 64 * 1024 * 1024;
export const MIN_ADMIN_PASSWORD_LENGTH = 12;
export const ADMIN_SESSION_DURATION_SECONDS = 8 * 60 * 60;

function scrypt(password: string, salt: Buffer, keyLength: number): Buffer {
  return scryptSync(password, salt, keyLength, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: MAX_MEM,
  });
}

/** Produce a storable hash in the form scrypt$N$r$p$saltHex$hashHex. */
export function hashScryptValue(value: string): string {
  const salt = randomBytes(16);
  const derived = scrypt(value, salt, KEY_LENGTH);

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("hex"),
    derived.toString("hex"),
  ].join("$");
}

/** Produce a storable hash in the form scrypt$N$r$p$saltHex$hashHex. */
export function hashAdminPassword(password: string): string {
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(
      `Administrator passwords must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`,
    );
  }

  return hashScryptValue(password);
}

export function verifyScryptValue(
  value: string,
  storedHash: string,
): boolean {
  const parts = storedHash.split("$");

  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const [, nRaw, rRaw, pRaw, saltHex, hashHex] = parts;
  const n = Number.parseInt(nRaw, 10);
  const r = Number.parseInt(rRaw, 10);
  const p = Number.parseInt(pRaw, 10);

  if (
    !Number.isInteger(n) ||
    !Number.isInteger(r) ||
    !Number.isInteger(p) ||
    n <= 0 ||
    r <= 0 ||
    p <= 0
  ) {
    return false;
  }

  let expected: Buffer;
  let actual: Buffer;

  try {
    expected = Buffer.from(hashHex, "hex");
    actual = scryptSync(value, Buffer.from(saltHex, "hex"), expected.length, {
      N: n,
      r,
      p,
      maxmem: MAX_MEM,
    });
  } catch {
    return false;
  }

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function verifyAdminPassword(
  password: string,
  storedHash: string,
): boolean {
  return verifyScryptValue(password, storedHash);
}

/** Generate an opaque session token. Only its hash is stored server-side. */
export function generateAdminSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Stable SHA-256 hash used to look up a session without storing the token. */
export function hashAdminSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Hash an IP address before storage so raw addresses are not retained. */
export function hashAdminIp(ip: string): string {
  return createHash("sha256")
    .update(`js-jewellers-admin-ip:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

export type AdminSessionPayload = {
  email: string;
  issuedAt: number;
  expiresAt: number;
};

const SESSION_VERSION = "v1";

function sessionSignature(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`js-jewellers-admin-session:${encodedPayload}`)
    .digest("base64url");
}

/**
 * Create a signed, HTTP-only session token. The token carries only the
 * administrator email and timestamps; it never carries a password or hash.
 */
export function createAdminSessionToken(
  email: string,
  secret: string,
  now: number = Date.now(),
): string {
  const payload: AdminSessionPayload = {
    email,
    issuedAt: now,
    expiresAt: now + ADMIN_SESSION_DURATION_SECONDS * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = sessionSignature(encoded, secret);

  return `${SESSION_VERSION}.${encoded}.${signature}`;
}

/**
 * Verify a signed session token. Returns null for any malformed, tampered, or
 * expired token. The HMAC comparison is constant-time.
 */
export function verifyAdminSessionToken(
  token: string,
  secret: string,
  now: number = Date.now(),
): AdminSessionPayload | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [version, encoded, signature] = parts;

  if (version !== SESSION_VERSION || !encoded || !signature) {
    return null;
  }

  if (!safeStringEqual(signature, sessionSignature(encoded, secret))) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as unknown;

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const candidate = parsed as Partial<AdminSessionPayload>;

    if (
      typeof candidate.email !== "string" ||
      candidate.email.length === 0 ||
      typeof candidate.issuedAt !== "number" ||
      typeof candidate.expiresAt !== "number" ||
      !Number.isFinite(candidate.issuedAt) ||
      !Number.isFinite(candidate.expiresAt) ||
      candidate.expiresAt <= now
    ) {
      return null;
    }

    return {
      email: candidate.email,
      issuedAt: candidate.issuedAt,
      expiresAt: candidate.expiresAt,
    };
  } catch {
    return null;
  }
}

/** Constant-time comparison for non-hashed secrets such as an email address. */
export function safeStringEqual(left: string, right: string): boolean {
  const leftHash = createHmac("sha256", "js-jewellers-compare")
    .update(left)
    .digest();
  const rightHash = createHmac("sha256", "js-jewellers-compare")
    .update(right)
    .digest();

  return timingSafeEqual(leftHash, rightHash);
}
