import { redirect } from "next/navigation";

import { authorizeAdminRequest, authorizeSuperAdminRequest } from "@/lib/admin/guard";
import type { AdminPermission } from "@/lib/admin/permissions";
import { isDatabaseConfigured } from "@/lib/db";
import { enforceAdminOperationLimit } from "@/lib/security/admin-rate-limit";

/** Shared server-action helpers. Not a "use server" module. */

export function formValue(formData: FormData, key: string): string {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry : "";
}

export function formCheckbox(formData: FormData, key: string): boolean {
  const entry = formData.get(key);
  return entry === "on" || entry === "true" || entry === "1";
}

export function formOptional(formData: FormData, key: string): string | null {
  const raw = formValue(formData, key).trim();
  return raw === "" ? null : raw;
}

export function redirectWithError(path: string, message: string): never {
  redirect(
    `${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`,
  );
}

export function redirectWithNotice(path: string, notice: string): never {
  redirect(
    `${path}${path.includes("?") ? "&" : "?"}notice=${encodeURIComponent(notice)}`,
  );
}

function redirectForAuthorizationFailure(
  auth: Awaited<ReturnType<typeof authorizeAdminRequest>>,
  permission: string,
): never {
  if (auth.ok) {
    redirect("/admin/account");
  }

  if (auth.status === 403) {
    if (auth.reason === "mfa-required") {
      redirect("/admin/mfa?status=enrollment-required");
    }

    if (auth.reason === "origin") {
      redirect("/admin/login?status=blocked");
    }

    redirect(`/admin/account?denied=${encodeURIComponent(permission)}`);
  }

  redirect("/admin/login?status=required");
}

/**
 * Authorise a server action and return the signed-in actor. Database and
 * session failures redirect instead of leaking details to the caller.
 *
 * Every successful authorisation also consumes a per-actor operation token so
 * a stolen session cannot hammer a sensitive mutation or the audit trail.
 */
export async function requireAdminActor(
  permission: AdminPermission,
  operation?: string,
) {
  if (!isDatabaseConfigured()) {
    redirect("/admin/login?status=unconfigured");
  }

  const auth = await authorizeAdminRequest(permission);

  if (!auth.ok) {
    redirectForAuthorizationFailure(auth, permission);
  }

  const limit = await enforceAdminOperationLimit({
    userId: auth.context.user.id,
    permission,
    operation,
  });

  if (!limit.allowed) {
    redirect(
      `/admin/account?error=${encodeURIComponent(
        "Too many administrator operations. Please wait and try again.",
      )}`,
    );
  }

  return auth.context.user;
}

/**
 * Authorise a server action that must be performed by the Super Admin role.
 * This is deliberately stricter than a permission check so account and role
 * management cannot be delegated through a custom role.
 */
export async function requireSuperAdminActor(operation?: string) {
  if (!isDatabaseConfigured()) {
    redirect("/admin/login?status=unconfigured");
  }

  const auth = await authorizeSuperAdminRequest();

  if (!auth.ok) {
    redirectForAuthorizationFailure(auth, "super-admin");
  }

  const limit = await enforceAdminOperationLimit({
    userId: auth.context.user.id,
    permission: "super-admin",
    operation,
  });

  if (!limit.allowed) {
    redirect(
      `/admin/account?error=${encodeURIComponent(
        "Too many administrator operations. Please wait and try again.",
      )}`,
    );
  }

  return auth.context.user;
}
