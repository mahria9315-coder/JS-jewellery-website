import type { AdminPermission } from "@/lib/admin/permissions";

import { checkRateLimit, type RateLimitResult } from "./rate-limit";

/**
 * Per-actor limits for administrator mutations.
 *
 * Ordinary catalogue and content edits are bounded at a generous rate so
 * automation cannot be used to enumerate or flood the audit trail. The
 * sensitive operation groups (payments, refunds, role/account management,
 * settings, supplier verification) are much stricter.
 */

const SENSITIVE_PERMISSIONS = new Set<AdminPermission>([
  "payments.verify",
  "payments.configure",
  "refunds.process",
  "users.manage",
  "roles.manage",
  "settings.manage",
  "suppliers.verify",
]);

const OPERATION_WINDOW_MS = 5 * 60 * 1000;
const SENSITIVE_LIMIT = 30;
const STANDARD_LIMIT = 180;

export async function enforceAdminOperationLimit(input: {
  userId: string;
  permission: AdminPermission | "super-admin";
  operation?: string;
}): Promise<RateLimitResult> {
  const sensitive =
    input.permission === "super-admin" ||
    SENSITIVE_PERMISSIONS.has(input.permission as AdminPermission);

  return checkRateLimit(
    `admin-op:${input.permission}:${input.operation ?? "default"}:${input.userId}`,
    sensitive ? SENSITIVE_LIMIT : STANDARD_LIMIT,
    OPERATION_WINDOW_MS,
  );
}
