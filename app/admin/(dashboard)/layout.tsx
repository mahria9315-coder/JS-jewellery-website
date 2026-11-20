import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminChrome } from "@/components/admin/AdminChrome";
import { visibleAdminNavigation } from "@/lib/admin/navigation";
import { requireAdminSession } from "@/lib/admin/session";
import { getAdminNotificationCounts } from "@/lib/admin/notifications";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Administration",
  description: "Private JS Jewellers administration.",
  path: "/admin",
  noIndex: true,
});

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await requireAdminSession();
  const groups = visibleAdminNavigation(
    context.user.role.permissions,
    context.user.role.key,
  );
  const notifications = await getAdminNotificationCounts(
    context.user.role.permissions,
  );
  const canSearch = context.user.role.permissions.some((permission) =>
    ["products.view", "orders.view", "customers.view", "suppliers.view"].includes(
      permission,
    ),
  );

  return (
    <AdminChrome
      groups={groups}
      user={{
        name: context.user.name,
        email: context.user.email,
        roleName: context.user.role.name,
      }}
      notifications={notifications}
      canSearch={canSearch}
    >
      {children}
    </AdminChrome>
  );
}
