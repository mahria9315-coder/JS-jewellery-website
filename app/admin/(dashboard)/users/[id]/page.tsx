import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import {
  AdminPageHeader,
  StatusPill,
  formatDate,
} from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  resetAdminUserMfaAction,
  resetAdminUserPasswordAction,
  unlockAdminUserAction,
  updateAdminUserAction,
} from "@/lib/actions/admin-content";
import { requireSuperAdminPage } from "@/lib/admin/session";
import { getAdminUserForAdmin, listAdminRoles } from "@/lib/admin/users";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Administrator account",
  description: "Private administrator account management.",
  path: "/admin/users",
  noIndex: true,
});

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: PageProps) {
  const context = await requireSuperAdminPage();
  const { id } = await params;
  const query = await searchParams;
  const [user, roles] = await Promise.all([
    getAdminUserForAdmin(id).catch(() => null),
    listAdminRoles().catch(() => []),
  ]);

  if (!user) {
    notFound();
  }

  const locked = user.isLocked;
  const isSelf = user.id === context.user.id;
  const mfaEnrolled = Boolean(user.mfaCredential?.confirmedAt);
  const recoveryCodesRemaining =
    user.mfaCredential?.recoveryCodes.length ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Administrator accounts"
        title={user.name}
        description="Only the Super Admin can manage administrator accounts. Role changes and password resets revoke the affected account's open sessions. The last active Super Admin cannot be removed."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Admin users", href: "/admin/users" },
          { label: user.name },
        ]}
      />

      <AdminQueryNotice params={query} />

      <dl className="grid gap-4 sm:grid-cols-3">
        {[
          ["Email", user.email],
          ["Role", user.role.name],
          ["Status", user.status === "ACTIVE" ? "Active" : "Disabled"],
          ["Last sign-in", formatDate(user.lastLoginAt)],
          ["Created", formatDate(user.createdAt)],
          [
            "Lockout",
            locked ? `Locked until ${formatDate(user.lockedUntil)}` : "None",
          ],
        ].map(([label, value]) => (
          <div key={label} className={panelClass}>
            <dt className="text-sm text-champagne/70">{label}</dt>
            <dd className="mt-2 break-words text-sm font-semibold text-white">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <section className={panelClass} aria-labelledby="account-details">
        <h3
          id="account-details"
          className="heading-editorial heading-champagne text-xl"
        >
          Account details
        </h3>
        <form action={updateAdminUserAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={user.id} />
          <div>
            <label htmlFor="name" className={labelClass}>
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={120}
              defaultValue={user.name}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="roleId" className={labelClass}>
              Role
            </label>
            <select
              id="roleId"
              name="roleId"
              defaultValue={user.roleId}
              className={inputClass}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Account status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={user.status}
              className={inputClass}
            >
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
            {isSelf ? (
              <p className="mt-1 text-xs text-amber-200">
                You cannot disable your own account.
              </p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Save account</SubmitButton>
          </div>
        </form>
      </section>

      <section className={panelClass} aria-labelledby="reset-password">
        <h3
          id="reset-password"
          className="heading-editorial heading-champagne text-xl"
        >
          Reset password
        </h3>
        <p className="mt-2 text-sm text-champagne/70">
          Set a new password for this account and revoke its existing sessions.
          The password is not shown again after saving.
        </p>
        <form
          action={resetAdminUserPasswordAction}
          className="mt-4 grid gap-4 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={user.id} />
          <div className="sm:col-span-2">
            <label htmlFor="password" className={labelClass}>
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              className={inputClass}
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-champagne sm:col-span-2">
            <input type="checkbox" className={checkboxClass} disabled />
            Existing sessions are revoked automatically
          </label>
          <div className="sm:col-span-2">
            <SubmitButton variant="secondary">Reset password</SubmitButton>
          </div>
        </form>
      </section>

      <section className={panelClass} aria-labelledby="unlock-account">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3
            id="unlock-account"
            className="heading-editorial heading-champagne text-xl"
          >
            Temporary lockout
          </h3>
          <StatusPill
            status={locked ? "Locked" : "Not locked"}
            tone={locked ? "warning" : "success"}
          />
        </div>
        <p className="mt-2 text-sm text-champagne/70">
          Sign-in is locked after repeated failures. Clearing the lockout does
          not change the password.
        </p>
        <form action={unlockAdminUserAction} className="mt-4">
          <input type="hidden" name="id" value={user.id} />
          {locked ? (
            <SubmitButton variant="secondary">Clear lockout</SubmitButton>
          ) : (
            <p className="text-sm text-champagne/60">
              This account is not currently locked.
            </p>
          )}
        </form>
      </section>

      <section className={panelClass} aria-labelledby="mfa-reset">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3
            id="mfa-reset"
            className="heading-editorial heading-champagne text-xl"
          >
            Multi-factor authentication
          </h3>
          <StatusPill
            status={mfaEnrolled ? "Enrolled" : "Not enrolled"}
            tone={mfaEnrolled ? "success" : "warning"}
          />
        </div>
        <p className="mt-2 text-sm text-champagne/70">
          {mfaEnrolled
            ? `This account has ${recoveryCodesRemaining} unused recovery code${
                recoveryCodesRemaining === 1 ? "" : "s"
              }. Reset only after verifying the staff member's identity. The
              authenticator and all recovery codes are removed, and the account
              must enrol again at its next sign-in.`
            : "No authenticator is enrolled. In production, this account cannot complete sign-in until it enrols one."}
        </p>
        {mfaEnrolled ? (
          <form action={resetAdminUserMfaAction} className="mt-4">
            <input type="hidden" name="id" value={user.id} />
            <SubmitButton
              variant="danger"
              pendingLabel="Removing…"
            >
              Reset authenticator and recovery codes
            </SubmitButton>
          </form>
        ) : null}
      </section>
    </div>
  );
}
