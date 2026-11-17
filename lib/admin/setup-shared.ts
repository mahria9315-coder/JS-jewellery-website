/**
 * Pure, dependency-light helpers for first-administrator setup.
 *
 * Kept separate from `setup.ts` so unit tests can run without database or
 * path-alias resolution. `setup.ts` re-exports these for application code.
 */

export const ADMIN_SETUP_SECRET_ENV = "ADMIN_SETUP_SECRET" as const;

export class AdminSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminSetupError";
  }
}

export function isAdminSetupSecretConfigured(): boolean {
  return Boolean(process.env[ADMIN_SETUP_SECRET_ENV]?.trim());
}
