import { randomBytes, randomInt } from "node:crypto";

/**
 * Human-readable, unique order references and unguessable access tokens.
 *
 * The order number is for display and support. The access token is what makes
 * the confirmation page private, so it must never be derived from the order
 * number.
 */

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateOrderNumber(
  now: Date = new Date(),
  nextInt: (max: number) => number = randomInt,
): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");

  let suffix = "";

  for (let index = 0; index < 6; index += 1) {
    suffix += ALPHABET[nextInt(ALPHABET.length)];
  }

  return `JS-${year}${month}${day}-${suffix}`;
}

export function generateOrderAccessToken(): string {
  return randomBytes(32).toString("base64url");
}
