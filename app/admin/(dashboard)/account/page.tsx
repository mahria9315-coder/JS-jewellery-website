import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader, StatusPill, formatDate } from "@/components/admin/AdminUI";
import { AdminPasswordForm } from "@/components/admin/PasswordForm";
import { buttonSecondary, panelClass } from "@/components/ui/FormPrimitives";
import { adminLogoutAction } from "@/lib/actions/admin";
import { getMfaStatus } from "@/lib/admin/mfa";
import { defaultAdminPath } from "@/lib/admin/permissions";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "My administrator account",
  description: "Private administrator account.",
  path: "/admin/account",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminAccountPage({ searchParams }: PageProps) {
  const context = await requireAdminPage();
  const mfa = await getMfaStatus(context.user.id);
  const params = await searchParams;
  const denied = first(params, "denied");
  const landing = defaultAdminPath(context.user.role.permissions);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Administration"
        title="My account"
        description="Your session is stored on the server and expires automatically. Change your password here; other signed-in sessions are revoked afterwards."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "My account" },
        ]}
      />

      {denied ? (
        <p
          role="alert"
          className="rounded-card border border-amber-400/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-100"
        >
          {denied === "super-admin" ? (
            <>
              Administrator account and role management is reserved for the
              Super Admin, so that area was not opened.
            </>
          ) : (
            <>
              Your role does not include the <code>{denied}</code> permission,
              so that area was not opened.
            </>
          )}
        </p>
      ) : null}

      <section className={panelClass} aria-labelledby="profile">
        <h3 id="profile" className="heading-editorial heading-champagne text-xl">
          Profile
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["Name", context.user.name],
            ["Email", context.user.email],
            ["Role", context.user.role.name],
            ["Session expires", formatDate(context.expiresAt)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-champagne/60">{label}</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-white">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-champagne/60">
          Email addresses and roles are changed by a Super Admin from the
          administrator accounts screen.
        </p>
      </section>

      <section className={panelClass} aria-labelledby="password">
        <h3 id="password" className="heading-editorial heading-champagne text-xl">
          Change password
        </h3>
        <AdminPasswordForm />
      </section>

      <section className={panelClass} aria-labelledby="mfa">
        <h3 id="mfa" className="heading-editorial heading-champagne text-xl">
          Multi-factor authentication
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-champagne/60">Status</dt>
            <dd className="mt-1 text-sm font-semibold text-white">
              {mfa.enrolled ? "Authenticator enrolled" : "Not enrolled"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-champagne/60">
              Unused recovery codes
            </dt>
            <dd className="mt-1 text-sm font-semibold text-white">
              {mfa.enrolled ? mfa.recoveryCodesRemaining : "—"}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-champagne/70">
          {mfa.enforced
            ? "Multi-factor authentication is required on this deployment."
            : "Multi-factor authentication is optional in local development."}
        </p>
        <div className="mt-4">
          <Link href="/admin/mfa" className={buttonSecondary}>
            {mfa.enrolled ? "Manage authenticator" : "Set up authenticator"}
          </Link>
        </div>
      </section>

      <section className={panelClass} aria-labelledby="permissions">
        <h3
          id="permissions"
          className="heading-editorial heading-champagne text-xl"
        >
          Your permissions
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {context.user.role.permissions.length === 0 ? (
            <p className="text-sm text-champagne/70">
              No permissions are assigned to this role.
            </p>
          ) : (
            context.user.role.permissions.map((permission) => (
              <StatusPill key={permission} status={permission} />
            ))
          )}
        </div>
      </section>

      <section className={panelClass} aria-labelledby="session-actions">
        <h3
          id="session-actions"
          className="heading-editorial heading-champagne text-xl"
        >
          Session
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={landing} className={buttonSecondary}>
            Go to my start page
          </Link>
          <form action={adminLogoutAction}>
            <button type="submit" className={buttonSecondary}>
              Sign out
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
