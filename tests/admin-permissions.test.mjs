import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_PERMISSIONS,
  SUPER_ADMIN_ONLY_PERMISSIONS,
  SUPER_ADMIN_ROLE_KEY,
  defaultAdminPath,
  hasAnyPermission,
  hasPermission,
  isSuperAdminOnlyPermission,
  isSuperAdminRole,
  normalizePermissions,
} from "../lib/admin/permissions.ts";

test("normalizePermissions keeps only known permissions in catalogue order", () => {
  assert.deepEqual(
    normalizePermissions(["orders.view", "not-a-permission", "audit.view", "orders.view"]),
    ["orders.view", "audit.view"],
  );
});

test("hasPermission and hasAnyPermission respect exact grants", () => {
  const granted = ["products.view", "orders.view"];

  assert.equal(hasPermission(granted, "products.view"), true);
  assert.equal(hasPermission(granted, "products.manage"), false);
  assert.equal(hasAnyPermission(granted, ["products.manage", "orders.view"]), true);
  assert.equal(hasAnyPermission(granted, ["suppliers.view"]), false);
});

test("defaultAdminPath prefers dashboard and falls back to account", () => {
  assert.equal(defaultAdminPath(["dashboard.view", "orders.view"]), "/admin");
  assert.equal(defaultAdminPath(["orders.view"]), "/admin/orders");
  assert.equal(defaultAdminPath([]), "/admin/account");
  assert.ok(ADMIN_PERMISSIONS.includes("users.manage"));
});

test("only the fixed Super Admin role key is treated as Super Admin", () => {
  assert.equal(SUPER_ADMIN_ROLE_KEY, "SUPER_ADMIN");
  assert.equal(isSuperAdminRole("SUPER_ADMIN"), true);
  assert.equal(isSuperAdminRole("MANAGER"), false);
  assert.equal(isSuperAdminRole("super_admin"), false);
  assert.equal(isSuperAdminRole(""), false);
});

test("account and role management permissions are reserved for the Super Admin", () => {
  assert.deepEqual(
    [...SUPER_ADMIN_ONLY_PERMISSIONS].sort(),
    ["roles.manage", "users.manage"],
  );

  for (const permission of SUPER_ADMIN_ONLY_PERMISSIONS) {
    assert.equal(isSuperAdminOnlyPermission(permission), true);
  }

  assert.equal(isSuperAdminOnlyPermission("orders.view"), false);
});
