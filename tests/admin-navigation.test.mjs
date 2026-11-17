import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_NAVIGATION,
  visibleAdminNavigation,
} from "../lib/admin/navigation.ts";
import {
  ADMIN_PERMISSIONS,
  SUPER_ADMIN_ONLY_PERMISSIONS,
  SUPER_ADMIN_ROLE_KEY,
  isAdminPermission,
} from "../lib/admin/permissions.ts";

function flatten(groups) {
  return groups.flatMap((group) => group.items);
}

function hrefs(groups) {
  return flatten(groups).map((item) => item.href);
}

test("navigation entries are unique and reference known permissions", () => {
  const all = flatten(ADMIN_NAVIGATION);
  const hrefsSeen = all.map((item) => item.href);

  assert.equal(new Set(hrefsSeen).size, hrefsSeen.length);

  for (const item of all) {
    assert.ok(item.href.startsWith("/admin"), item.href);
    assert.ok(item.label.trim().length > 0);

    if (item.permission) {
      assert.equal(isAdminPermission(item.permission), true, item.permission);
    }
  }

  for (const item of all.filter((entry) => entry.superAdminOnly)) {
    assert.ok(item.permission, `${item.href} must declare a permission`);
    assert.ok(
      SUPER_ADMIN_ONLY_PERMISSIONS.includes(item.permission),
      `${item.href} must use a Super Admin reserved permission`,
    );
  }
});

test("the Super Admin sees every navigation entry", () => {
  const visible = visibleAdminNavigation(
    [...ADMIN_PERMISSIONS],
    SUPER_ADMIN_ROLE_KEY,
  );

  assert.deepEqual(hrefs(visible), hrefs(ADMIN_NAVIGATION));
});

test("account and role management stay hidden from a non-Super-Admin role", () => {
  // Even a custom role that was granted the reserved permission flags must not
  // see the account or role management navigation.
  const visible = visibleAdminNavigation([...ADMIN_PERMISSIONS], "CUSTOM_ROLE");
  const visibleHrefs = hrefs(visible);

  assert.equal(visibleHrefs.includes("/admin/users"), false);
  assert.equal(visibleHrefs.includes("/admin/roles"), false);
  assert.equal(visibleHrefs.includes("/admin/audit"), true);
});

test("navigation is filtered by exact permission grants", () => {
  const visible = visibleAdminNavigation(
    ["orders.view", "products.view"],
    "CUSTOM_ROLE",
  );
  const visibleHrefs = hrefs(visible);

  assert.deepEqual(visibleHrefs.sort(), [
    "/admin/account",
    "/admin/orders",
    "/admin/products",
  ]);

  for (const hidden of [
    "/admin/reports",
    "/admin/customers",
    "/admin/suppliers",
    "/admin/settings/payments",
    "/admin/users",
    "/admin/roles",
  ]) {
    assert.equal(visibleHrefs.includes(hidden), false, hidden);
  }

  // Groups left with no visible items are removed entirely.
  assert.equal(
    visible.some((group) => group.items.length === 0),
    false,
  );
});

test("a role with no permissions still reaches its own account page", () => {
  const visible = visibleAdminNavigation([], "CUSTOM_ROLE");

  assert.deepEqual(hrefs(visible), ["/admin/account"]);
  assert.deepEqual(
    visible.map((group) => group.label),
    ["Administration"],
  );
});
