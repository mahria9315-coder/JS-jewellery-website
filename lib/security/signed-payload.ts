import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Signed, short-lived payloads for the checkout review step.
 *
 * The review page must not put customer details or payment choices in the URL.
 * The draft is stored in an HTTP-only cookie, signed with HMAC-SHA256 so it
 * cannot be tampered with, and re-validated again before the order is created.
 *
 * Set `CHECKOUT_DRAFT_SECRET` in production. When it is absent the code falls
 * back to `ADMIN_SESSION_SECRET`, then to a per-process random secret, which is
 * safe for local development but does not survive a server restart.
 */

const DRAFT_TTL_SECONDS = 30 * 60;
let ephemeralSecret: string | null = null;

function resolveSecret(): string {
  const configured =
    process.env.CHECKOUT_DRAFT_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim();

  if (configured) {
    return configured;
  }

  if (!ephemeralSecret) {
    ephemeralSecret = randomBytes(48).toString("base64url");
  }

  return ephemeralSecret;
}

function base64Url(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function signPayload(
  payload: Record<string, unknown>,
  ttlSeconds: number = DRAFT_TTL_SECONDS,
): string {
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const segment = base64Url(Buffer.from(JSON.stringify(body)));
  const signature = base64Url(
    createHmac("sha256", resolveSecret()).update(segment).digest(),
  );

  return `${segment}.${signature}`;
}

export function verifyPayload<T>(token: string): T | null {
  if (!token) {
    return null;
  }

  const [segment, signature] = token.split(".");

  if (!segment || !signature) {
    return null;
  }

  const expected = createHmac("sha256", resolveSecret())
    .update(segment)
    .digest();

  let actual: Buffer;

  try {
    actual = Buffer.from(
      signature.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    );
  } catch {
    return null;
  }

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  let payload: T & { exp?: number };

  try {
    payload = JSON.parse(
      Buffer.from(
        segment.replace(/-/g, "+").replace(/_/g, "/"),
        "base64",
      ).toString("utf8"),
    ) as T & { exp?: number };
  } catch {
    return null;
  }

  if (
    typeof payload.exp !== "number" ||
    payload.exp <= Math.floor(Date.now() / 1000)
  ) {
    return null;
  }

  return payload;
}
