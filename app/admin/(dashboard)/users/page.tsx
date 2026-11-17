import type { Metadata } from "next";
import Link from "next/link";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
  StatusPill,
  formatDate,
} from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { inputClass, labelClass, panelClass } from "@/components/ui/FormPrimitives";
import { createAdminUserAction } from "@/lib/actions/admin-content";
import { requireSuperAdminPage } from "@/lib/admin/session";
import { listAdminRoles, listAdminUsers } from "@/lib/admin/users";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Administrator accounts",
  description: "Private administrator account management.",
  path: "/admin/users",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireSuperAdminPage();
  const params = await searchParams;

  let users: Awaited<ReturnType<typeof listAdminUsers>> = [];
  let roles: Awaited<ReturnType<typeof listAdminRoles>> = [];
  let unavailable = false;

  try {
    [users, roles] = await Promise.all([listAdminUsers(), listAdminRoles()]);
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Administration"
        title="Administrator accounts"
        description="Only the Super Admin can create or change administrator accounts. Accounts are created here only; there is no public registration. Roles are enforced on the server for every page and action. Passwords are never shown or recoverable."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Admin users" },
        ]}
      />

      <AdminQueryNotice params={params} />

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Administrator accounts could not be loaded because the database is
            unavailable.
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className={panelClass}>
          <p className="text-sm text-champagne/70">
            No administrator accounts are listed. Create a staff account below.
            Only the Super Admin can manage accounts or roles.
          </p>
        </div>
      ) : (
        <AdminTable caption="Administrator accounts" minWidth="56rem">
          <thead>
            <tr>
              <AdminTh>Administrator</AdminTh>
              <AdminTh>Role</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Last sign-in</AdminTh>
              <AdminTh>Lockout</AdminTh>
              <AdminTh>Created</AdminTh>
              <AdminTh>Open</AdminTh>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const locked = user.isLocked;

              return (
                <tr key={user.id}>
                  <AdminTd>
                    <span className="font-semibold text-white">{user.name}</span>
                    <span className="block text-xs text-champagne/60">
                      {user.email}
                    </span>
                  </AdminTd>
                  <AdminTd>{user.role.name}</AdminTd>
                  <AdminTd>
                    <StatusPill
                      status={user.status === "ACTIVE" ? "Active" : "Disabled"}
                      tone={user.status === "ACTIVE" ? "success" : "danger"}
                    />
                  </AdminTd>
                  <AdminTd>{formatDate(user.lastLoginAt)}</AdminTd>
                  <AdminTd>
                    {locked ? (
                      <StatusPill status="Locked" tone="warning" />
                    ) : (
                      "-"
                    )}
                  </AdminTd>
                  <AdminTd>{formatDate(user.createdAt)}</AdminTd>
                  <AdminTd>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                    >
                      Manage
                    </Link>
                  </AdminTd>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      )}

      <section className={panelClass} aria-labelledby="new-admin-user">
        <h3
          id="new-admin-user"
          className="heading-editorial heading-champagne text-xl"
        >
          Create administrator
        </h3>
        <p className="mt-2 text-sm text-champagne/70">
          Share the initial password through a private channel and ask the
          administrator to change it on first sign-in.
        </p>
        <form action={createAdminUserAction} className="mt-4 grid gap-4 sm:grid-cols-2">
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
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="roleId" className={labelClass}>
              Role
            </label>
            <select id="roleId" name="roleId" required className={inputClass}>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              Initial password
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
            <p className="mt-1 text-xs text-champagne/60">
              At least 12 characters with at least one letter and one number.
            </p>
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Create administrator</SubmitButton>
          </div>
        </form>
      </section>
    </div>
  );
}
