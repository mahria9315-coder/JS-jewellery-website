import { isDatabaseConfigured } from "@/lib/db";
import { isSameOriginAction } from "@/lib/security/action-origin";

import {
  hasAnyPermission,
  isSuperAdminRole,
  type AdminPermission,
} from "./permissions";
import { getAdminContext, type AdminContext } from "./session";

export type AdminApiAuthorization =
  | { ok: true; context: AdminContext }
  | {
      ok: false;
      status: 401 | 403 | 503;
      message: string;
      reason?: "permission" | "mfa-required" | "session" | "origin";
    };

function requiredList(
  required?: AdminPermission | readonly AdminPermission[],
): readonly AdminPermission[] {
  if (!required) return [];
  return Array.isArray(required) ? required : [required as AdminPermission];
}

/**
 * Authorize a server action or API request from the database-backed session
 * cookie. Role or user ids supplied in a request body are never trusted.
 */
export async function authorizeAdminRequest(
  required?: AdminPermission | readonly AdminPermission[],
  options?: { allowUnenrolled?: boolean },
): Promise<AdminApiAuthorization> {
  if (!(await isSameOriginAction())) {
    return {
      ok: false,
      status: 403,
      reason: "origin",
      message: "This request did not originate from the website.",
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      status: 503,
      message:
        "Administrator access is unavailable because the database is not configured.",
    };
  }

  const context = await getAdminContext();

  if (!context) {
    return {
      ok: false,
      status: 401,
      reason: "session",
      message: "Sign in with an administrator account.",
    };
  }

  const permissions = requiredList(required);

  if (
    permissions.length > 0 &&
    !hasAnyPermission(context.user.role.permissions, permissions)
  ) {
    return {
      ok: false,
      status: 403,
      reason: "permission",
      message: "Your administrator role does not allow this action.",
    };
  }

  if (
    context.mfa.enforced &&
    !context.mfa.enrolled &&
    !options?.allowUnenrolled
  ) {
    return {
      ok: false,
      status: 403,
      reason: "mfa-required",
      message:
        "Enrol an authenticator before using administrator actions. Open the MFA setup page to continue.",
    };
  }

  return { ok: true, context };
}

/**
 * Authorize a request that must come from an active Super Admin account.
 *
 * Administrator account and role management is reserved for the Super Admin
 * role itself. A permission flag alone is not sufficient: a custom role that
 * was granted `users.manage` or `roles.manage` in the past must not be able to
 * take over ownership, and role ids or names supplied by the caller are never
 * trusted.
 */
export async function authorizeSuperAdminRequest(): Promise<AdminApiAuthorization> {
  const auth = await authorizeAdminRequest();

  if (!auth.ok) {
    return auth;
  }

  if (!isSuperAdminRole(auth.context.user.role.key)) {
    return {
      ok: false,
      status: 403,
      message: "Only a Super Admin can manage administrator accounts and roles.",
    };
  }

  return auth;
}
