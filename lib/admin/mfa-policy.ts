/**
 * Administrator MFA policy.
 *
 * Production is always enforced: there is no environment switch that silently
 * removes the second factor from a production deployment. Development can opt
 * in with `ADMIN_MFA_REQUIRED=true` so the full flow can be exercised locally.
 */
export const ADMIN_MFA_REQUIRED_ENV = "ADMIN_MFA_REQUIRED" as const;

export function isMfaEnforced(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.NODE_ENV === "production") {
    return true;
  }

  return env[ADMIN_MFA_REQUIRED_ENV]?.trim().toLowerCase() === "true";
}
