import { SUPER_ADMIN_ROLE_KEY, type AdminPermission } from "./permissions";

/**
 * Administration navigation. Items are filtered by the signed-in role's
 * permissions before they reach the browser, and every destination checks the
 * permission again on the server.
 */

export type AdminNavItem = {
  href: string;
  label: string;
  permission?: AdminPermission;
  exact?: boolean;
  /** Only shown to the Super Admin role, regardless of permission flags. */
  superAdminOnly?: boolean;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAVIGATION: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", permission: "dashboard.view", exact: true },
      { href: "/admin/reports", label: "Reports", permission: "reports.view" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", permission: "products.view" },
      { href: "/admin/categories", label: "Categories", permission: "categories.view" },
      { href: "/admin/brands", label: "Brands", permission: "categories.view" },
      { href: "/admin/inventory", label: "Inventory", permission: "inventory.view" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", permission: "orders.view" },
      { href: "/admin/returns", label: "Returns", permission: "returns.view" },
      { href: "/admin/customers", label: "Customers", permission: "customers.view" },
    ],
  },
  {
    label: "Suppliers",
    items: [
      { href: "/admin/suppliers", label: "Suppliers", permission: "suppliers.view" },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/content", label: "Pages", permission: "content.view" },
      { href: "/admin/content/homepage", label: "Homepage", permission: "content.view" },
      { href: "/admin/navigation", label: "Navigation", permission: "navigation.manage" },
      { href: "/admin/media", label: "Media", permission: "media.manage" },
      { href: "/admin/seo", label: "SEO", permission: "seo.manage" },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/settings/business", label: "Business settings", permission: "settings.manage" },
      { href: "/admin/settings/payments", label: "Payment methods", permission: "payments.view" },
      { href: "/admin/settings/shipping", label: "Shipping", permission: "shipping.view" },
      { href: "/admin/settings/notifications", label: "Notifications", permission: "settings.manage" },
      { href: "/admin/users", label: "Admin users", permission: "users.manage", superAdminOnly: true },
      { href: "/admin/roles", label: "Roles", permission: "roles.manage", superAdminOnly: true },
      { href: "/admin/audit", label: "Audit log", permission: "audit.view" },
      { href: "/admin/account", label: "My account" },
    ],
  },
];

export function visibleAdminNavigation(
  permissions: readonly string[],
  roleKey?: string,
): AdminNavGroup[] {
  const isSuperAdmin = roleKey === SUPER_ADMIN_ROLE_KEY;

  return ADMIN_NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        (!item.permission || permissions.includes(item.permission)) &&
        (!item.superAdminOnly || isSuperAdmin),
    ),
  })).filter((group) => group.items.length > 0);
}
