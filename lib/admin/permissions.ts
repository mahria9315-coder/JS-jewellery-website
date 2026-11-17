/**
 * Administrator permission catalogue.
 *
 * Permissions are stored on each `AdminRole` row and enforced on the server for
 * every protected page and server action. UI visibility is a convenience only;
 * it is never the security boundary.
 */

export const ADMIN_PERMISSIONS = [
  "dashboard.view",
  "reports.view",
  "products.view",
  "products.manage",
  "products.publish",
  "inventory.view",
  "inventory.manage",
  "suppliers.view",
  "suppliers.manage",
  "suppliers.verify",
  "categories.view",
  "categories.manage",
  "orders.view",
  "orders.manage",
  "orders.cancel",
  "payments.view",
  "payments.verify",
  "payments.configure",
  "returns.view",
  "returns.manage",
  "refunds.process",
  "customers.view",
  "customers.manage",
  "shipping.view",
  "shipping.manage",
  "content.view",
  "content.manage",
  "content.publish",
  "media.manage",
  "navigation.manage",
  "seo.manage",
  "settings.manage",
  "users.manage",
  "roles.manage",
  "audit.view",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

/**
 * The Super Admin role key is fixed by the database seed and first-admin setup
 * flow. It is the only role allowed to manage administrator accounts or role
 * permissions.
 */
export const SUPER_ADMIN_ROLE_KEY = "SUPER_ADMIN";

/**
 * Permissions reserved for the Super Admin role. They are never grantable to
 * another role, so account and role ownership cannot be delegated silently
 * through the role editor.
 */
export const SUPER_ADMIN_ONLY_PERMISSIONS: readonly AdminPermission[] = [
  "users.manage",
  "roles.manage",
];

export function isSuperAdminRole(roleKey: string): boolean {
  return roleKey === SUPER_ADMIN_ROLE_KEY;
}

export function isSuperAdminOnlyPermission(
  permission: AdminPermission,
): boolean {
  return SUPER_ADMIN_ONLY_PERMISSIONS.includes(permission);
}

const permissionSet = new Set<string>(ADMIN_PERMISSIONS);

export function isAdminPermission(value: string): value is AdminPermission {
  return permissionSet.has(value);
}

export function normalizePermissions(values: readonly string[]): AdminPermission[] {
  return [...new Set(values.filter(isAdminPermission))];
}

export function hasPermission(
  permissions: readonly string[],
  permission: AdminPermission,
): boolean {
  return permissions.includes(permission);
}

export function hasAnyPermission(
  permissions: readonly string[],
  required: readonly AdminPermission[],
): boolean {
  return required.some((permission) => permissions.includes(permission));
}

/**
 * Landing page for a role, used after sign-in so a user never starts on a page
 * they are not allowed to open.
 */
export function defaultAdminPath(permissions: readonly string[]): string {
  if (permissions.includes("dashboard.view")) return "/admin";
  if (permissions.includes("orders.view")) return "/admin/orders";
  if (permissions.includes("products.view")) return "/admin/products";
  if (permissions.includes("content.view")) return "/admin/content";
  return "/admin/account";
}
