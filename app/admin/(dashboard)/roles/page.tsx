import type { Metadata } from "next";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import { AdminPageHeader, StatusPill } from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { checkboxClass, panelClass } from "@/components/ui/FormPrimitives";
import { updateRolePermissionsAction } from "@/lib/actions/admin-content";
import {
  ADMIN_PERMISSIONS,
  SUPER_ADMIN_ONLY_PERMISSIONS,
  SUPER_ADMIN_ROLE_KEY,
} from "@/lib/admin/permissions";
import { requireSuperAdminPage } from "@/lib/admin/session";
import { listAdminRoles } from "@/lib/admin/users";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Roles and permissions",
  description: "Private administrator role management.",
  path: "/admin/roles",
  noIndex: true,
});

const PERMISSION_LABELS: Record<string, string> = {
  "dashboard.view": "View dashboard",
  "reports.view": "View sales and profit reports",
  "products.view": "View products",
  "products.manage": "Create and edit products",
  "products.publish": "Publish or unpublish products",
  "inventory.view": "View inventory",
  "inventory.manage": "Adjust stock and thresholds",
  "suppliers.view": "View suppliers",
  "suppliers.manage": "Create and edit suppliers",
  "suppliers.verify": "Verify suppliers and agreements",
  "categories.view": "View categories and brands",
  "categories.manage": "Manage categories and brands",
  "orders.view": "View orders",
  "orders.manage": "Manage order status and notes",
  "orders.cancel": "Cancel orders",
  "payments.view": "View payment settings",
  "payments.verify": "Verify customer payments",
  "payments.configure": "Enable payment methods",
  "returns.view": "View returns",
  "returns.manage": "Manage return requests",
  "refunds.process": "Process refunds",
  "customers.view": "View customers",
  "customers.manage": "Edit customers and notes",
  "shipping.view": "View shipping settings",
  "shipping.manage": "Manage delivery settings",
  "content.view": "View website pages",
  "content.manage": "Edit website content",
  "content.publish": "Publish website pages",
  "media.manage": "Manage the media library",
  "navigation.manage": "Manage storefront navigation",
  "seo.manage": "Manage search metadata",
  "settings.manage": "Manage business settings",
  "users.manage": "Manage administrator accounts",
  "roles.manage": "Manage roles and permissions",
  "audit.view": "View the audit log",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RolesPage({ searchParams }: PageProps) {
  await requireSuperAdminPage();
  const params = await searchParams;

  let roles: Awaited<ReturnType<typeof listAdminRoles>> = [];
  let unavailable = false;

  try {
    roles = await listAdminRoles();
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Administration"
        title="Roles and permissions"
        description="Permissions are checked on the server for every protected page and action. The Super Admin role always keeps full access and cannot be reduced. Administrator account and role management are reserved for the Super Admin role only and cannot be granted to another role. Saving a role signs out its affected sessions so the change applies immediately."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Roles" },
        ]}
      />

      <AdminQueryNotice params={params} />

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Roles could not be loaded because the database is unavailable.
          </p>
        </div>
      ) : (
        roles.map((role) => {
          const isSuperAdmin = role.key === SUPER_ADMIN_ROLE_KEY;

          return (
            <section
              key={role.id}
              className={panelClass}
              aria-labelledby={`role-${role.id}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3
                    id={`role-${role.id}`}
                    className="heading-editorial heading-champagne text-xl"
                  >
                    {role.name}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-champagne/50">
                    {role.key}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill
                    status={`${role._count.users} account${role._count.users === 1 ? "" : "s"}`}
                  />
                  <StatusPill
                    status={`${role.permissions.length} permission${role.permissions.length === 1 ? "" : "s"}`}
                    tone="info"
                  />
                </div>
              </div>
              <p className="mt-3 text-sm text-champagne/70">{role.description}</p>

              <form action={updateRolePermissionsAction} className="mt-5">
                <input type="hidden" name="roleId" value={role.id} />
                <fieldset disabled={isSuperAdmin}>
                  <legend className="text-sm font-semibold text-champagne">
                    Permissions
                  </legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {ADMIN_PERMISSIONS.map((permission) => {
                      const reserved =
                        SUPER_ADMIN_ONLY_PERMISSIONS.includes(permission);

                      return (
                        <label
                          key={permission}
                          className="flex items-start gap-2 rounded-brand border border-gold/15 px-3 py-2 text-sm text-champagne"
                        >
                          <input
                            type="checkbox"
                            name="permissions"
                            value={permission}
                            defaultChecked={role.permissions.includes(permission)}
                            disabled={reserved}
                            className={checkboxClass}
                          />
                          <span>
                            {PERMISSION_LABELS[permission] ?? permission}
                            {reserved ? (
                              <span className="block text-[0.68rem] font-semibold text-amber-200/80">
                                Super Admin only
                              </span>
                            ) : null}
                            <span className="block font-mono text-[0.68rem] text-champagne/40">
                              {permission}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                {isSuperAdmin ? (
                  <p className="mt-4 text-sm text-champagne/60">
                    The Super Admin role always has every permission and is not
                    editable.
                  </p>
                ) : (
                  <>
                    <p className="mt-4 text-sm text-champagne/60">
                      Administrator account and role management stay with the
                      Super Admin role and cannot be granted here.
                    </p>
                    <div className="mt-4">
                      <SubmitButton>Save permissions</SubmitButton>
                    </div>
                  </>
                )}
              </form>
            </section>
          );
        })
      )}
    </div>
  );
}
