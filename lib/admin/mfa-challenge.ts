import { cookies } from "next/headers";

import {
  MFA_CHALLENGE_TTL_SECONDS,
  createMfaChallengeToken,
  parseMfaChallenge,
  type MfaChallenge,
} from "./mfa-challenge-token";

/**
 * Cookie plumbing for the MFA challenge and the one-time recovery-code display.
 *
 * A correct password must not create a session until the second factor is
 * verified. Neither cookie contains a session token, and neither is readable by
 * client JavaScript. The signing rules live in `mfa-challenge-token.ts`.
 */

export const MFA_CHALLENGE_COOKIE = "js_admin_mfa_challenge";
export const MFA_RECOVERY_DISPLAY_COOKIE = "js_admin_mfa_recovery_display";

const RECOVERY_DISPLAY_TTL_SECONDS = 5 * 60;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge,
  };
}

export async function createMfaChallenge(input: {
  userId: string;
  next: string;
  now?: number;
}): Promise<void> {
  const token = createMfaChallengeToken(input);

  const cookieStore = await cookies();
  cookieStore.set(
    MFA_CHALLENGE_COOKIE,
    token,
    cookieOptions(MFA_CHALLENGE_TTL_SECONDS),
  );
}

export async function readMfaChallenge(): Promise<MfaChallenge | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MFA_CHALLENGE_COOKIE)?.value;

  return token ? parseMfaChallenge(token) : null;
}

export async function clearMfaChallenge(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MFA_CHALLENGE_COOKIE);
}

/**
 * Store freshly generated recovery codes for one display. They are shown once,
 * then the cookie is deleted by an explicit acknowledgement action.
 */
export async function setRecoveryCodesForDisplay(codes: string[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    MFA_RECOVERY_DISPLAY_COOKIE,
    JSON.stringify(codes),
    cookieOptions(RECOVERY_DISPLAY_TTL_SECONDS),
  );
}

export async function readRecoveryCodesForDisplay(): Promise<string[] | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(MFA_RECOVERY_DISPLAY_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    const codes = parsed.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );

    return codes.length > 0 ? codes : null;
  } catch {
    return null;
  }
}

export async function clearRecoveryCodesForDisplay(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MFA_RECOVERY_DISPLAY_COOKIE);
}

export {
  MFA_CHALLENGE_TTL_SECONDS,
  createMfaChallengeToken,
  parseMfaChallenge,
  type MfaChallenge,
};
