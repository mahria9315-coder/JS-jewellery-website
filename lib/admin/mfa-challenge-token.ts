import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Signed MFA challenge tokens.
 *
 * A correct password must not create a session until the second factor is
 * verified. The login action issues a five-minute signed challenge; the
 * verification action exchanges it for a real database session. This module is
 * deliberately free of Next.js imports so the signing rules can be unit-tested.
 */

export const MFA_CHALLENGE_TTL_SECONDS = 5 * 60;
const CHALLENGE_VERSION = "v1";

let ephemeralSecret: string | null = null;

function challengeSecret(): string {
  const configured =
    process.env.ADMIN_MFA_CHALLENGE_SECRET?.trim() ||
    process.env.CHECKOUT_DRAFT_SECRET?.trim();

  if (configured) {
    return configured;
  }

  if (!ephemeralSecret) {
    ephemeralSecret = randomBytes(48).toString("base64url");
  }

  return ephemeralSecret;
}

function signature(encodedPayload: string): string {
  return createHmac("sha256", challengeSecret())
    .update(`js-jewellers-mfa-challenge:${encodedPayload}`)
    .digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export type MfaChallenge = {
  userId: string;
  next: string;
  issuedAt: number;
  expiresAt: number;
};

/** Build a signed, time-bounded challenge token. */
export function createMfaChallengeToken(input: {
  userId: string;
  next: string;
  now?: number;
}): string {
  const now = input.now ?? Date.now();
  const payload: MfaChallenge = {
    userId: input.userId,
    next: input.next,
    issuedAt: now,
    expiresAt: now + MFA_CHALLENGE_TTL_SECONDS * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );

  return `${CHALLENGE_VERSION}.${encoded}.${signature(encoded)}`;
}

/**
 * Verify and decode a challenge token. Returns null for a malformed, tampered,
 * wrong-secret, or expired token rather than throwing.
 */
export function parseMfaChallenge(
  token: string,
  now: number = Date.now(),
): MfaChallenge | null {
  const parts = token.split(".");

  if (parts.length !== 3 || parts[0] !== CHALLENGE_VERSION) {
    return null;
  }

  const [, encoded, suppliedSignature] = parts;

  if (!encoded || !suppliedSignature) {
    return null;
  }

  if (!safeEqual(suppliedSignature, signature(encoded))) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as unknown;

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const candidate = parsed as Partial<MfaChallenge>;

    if (
      typeof candidate.userId !== "string" ||
      candidate.userId.length === 0 ||
      typeof candidate.next !== "string" ||
      typeof candidate.issuedAt !== "number" ||
      typeof candidate.expiresAt !== "number" ||
      !Number.isFinite(candidate.issuedAt) ||
      !Number.isFinite(candidate.expiresAt) ||
      candidate.expiresAt <= now
    ) {
      return null;
    }

    return {
      userId: candidate.userId,
      next: candidate.next,
      issuedAt: candidate.issuedAt,
      expiresAt: candidate.expiresAt,
    };
  } catch {
    return null;
  }
}
