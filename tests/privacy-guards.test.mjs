import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import nextConfig from "../next.config.ts";
import {
  adminOrderSelect,
  getOrderForCustomer,
} from "../lib/orders/queries.ts";
import { toPublicProduct } from "../lib/storefront/products.ts";

const repoRoot = new URL("../", import.meta.url);

function readRepo(relativePath) {
  return readFileSync(new URL(relativePath, repoRoot), "utf8");
}

function selectBlock(source, name) {
  const match = source.match(
    new RegExp(`const ${name} = \\{([\\s\\S]*?)\\n\\} as const;`),
  );

  assert.ok(match, `could not find ${name}`);
  return match[1];
}

test("the public product mapping exposes only public fields", () => {
  const row = {
    id: "p1",
    slug: "gold-ring",
    name: "Gold Ring",
    description: "A hand-finished ring.",
    collectionSlugs: ["rings"],
    sellingPriceMinor: 250000,
    currency: "PKR",
    availability: "IN_STOCK",
    availabilityVerifiedAt: new Date("2026-11-01T00:00:00.000Z"),
    stockQuantity: 4,
    images: [
      { src: "/images/products/rings/example.webp", alt: "Gold ring" },
    ],
    // These must never survive the public projection, even if a future query
    // accidentally selects them.
    supplierId: "supplier-1",
    supplierName: "Private Supplier",
    supplierCostMinor: 100000,
    marginMinor: 150000,
    sku: "PRIVATE-SKU",
    internalNotes: "Private note",
  };

  const product = toPublicProduct(row);

  assert.deepEqual(Object.keys(product).sort(), [
    "availability",
    "collectionSlugs",
    "description",
    "id",
    "images",
    "name",
    "price",
    "slug",
    "stockQuantity",
  ]);

  const serialised = JSON.stringify(product);
  for (const secret of [
    "supplier-1",
    "Private Supplier",
    "100000",
    "150000",
    "PRIVATE-SKU",
    "Private note",
  ]) {
    assert.equal(serialised.includes(secret), false, secret);
  }

  assert.deepEqual(product.price, { amountMinor: 250000, currency: "PKR" });
  assert.equal(product.availability.status, "in_stock");
  assert.equal(
    product.availability.lastVerifiedAt,
    "2026-11-01T00:00:00.000Z",
  );
});

test("only verified availability states are published; everything else waits", () => {
  const base = {
    id: "p1",
    slug: "gold-ring",
    name: "Gold Ring",
    description: "A ring.",
    collectionSlugs: ["rings"],
    sellingPriceMinor: 250000,
    currency: "PKR",
    availabilityVerifiedAt: null,
    stockQuantity: null,
    images: [],
  };

  assert.equal(
    toPublicProduct({ ...base, availability: "IN_STOCK" }).availability.status,
    "in_stock",
  );
  assert.equal(
    toPublicProduct({ ...base, availability: "OUT_OF_STOCK" }).availability
      .status,
    "out_of_stock",
  );

  for (const status of ["VERIFICATION_PENDING", "UNKNOWN", "", "in_stock"]) {
    assert.equal(
      toPublicProduct({ ...base, availability: status }).availability.status,
      "verification_pending",
      status,
    );
  }

  assert.equal(
    "lastVerifiedAt" in toPublicProduct({ ...base, availability: "IN_STOCK" })
      .availability,
    false,
  );
});

test("the public product select never asks for supplier-private columns", () => {
  const block = selectBlock(
    readRepo("lib/storefront/products.ts"),
    "publicProductSelect",
  );

  for (const forbidden of [
    "supplierId",
    "supplierName",
    "supplierCostMinor",
    "marginMinor",
    "sku",
    "internalNotes",
    "agreement",
  ]) {
    assert.equal(block.includes(forbidden), false, forbidden);
  }
});

test("customer order queries select no supplier, cost, margin, or internal notes", () => {
  const source = readRepo("lib/orders/queries.ts");
  const block = selectBlock(source, "customerOrderSelect");

  for (const forbidden of [
    "supplierId",
    "supplierName",
    "supplierCostMinor",
    "marginMinor",
    "internalNotes",
    "sku",
    "accessToken",
  ]) {
    assert.equal(block.includes(forbidden), false, forbidden);
  }

  // The admin projection is allowed to carry the private supplier data.
  for (const expected of [
    "supplierId",
    "supplierName",
    "supplierCostMinor",
    "marginMinor",
    "sku",
  ]) {
    assert.equal(expected in adminOrderSelect.items.select, true, expected);
  }

  assert.equal("accessToken" in adminOrderSelect, true);
  assert.equal("internalNotes" in adminOrderSelect, true);
});

test("an order cannot be read without both an order number and access token", async () => {
  assert.equal(await getOrderForCustomer("", ""), null);
  assert.equal(await getOrderForCustomer("JS-20260101-AAAAAA", ""), null);
  assert.equal(await getOrderForCustomer("", "some-token"), null);
});

test("the error boundary never renders raw error details", () => {
  const source = readRepo("app/error.tsx");

  assert.match(source, /aria-labelledby="error-heading"/);
  assert.match(source, /id="error-heading"/);
  assert.match(source, /error\.digest/);

  assert.equal(source.includes("error.message"), false);
  assert.equal(source.includes("error.stack"), false);
  assert.equal(source.includes("{error}"), false);
});

test("the not-found page has a labelled heading and safe recovery links", () => {
  const source = readRepo("app/not-found.tsx");

  assert.match(source, /aria-labelledby="not-found-heading"/);
  assert.match(source, /id="not-found-heading"/);
  assert.match(source, /href="\/"/);
  assert.match(source, /href="\/collections"/);
  assert.equal(source.includes("<html"), false);
});

test("global security headers cover every route and protect private pages", async () => {
  const rules = await nextConfig.headers();
  const global = rules.find((rule) => rule.source === "/:path*");

  assert.ok(global, "a global header rule must exist");

  const headers = new Map(
    global.headers.map((header) => [header.key, header.value]),
  );

  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(
    headers.get("Referrer-Policy"),
    "strict-origin-when-cross-origin",
  );
  assert.match(headers.get("Permissions-Policy") ?? "", /payment=\(\)/);
  assert.equal(headers.get("Cross-Origin-Opener-Policy"), "same-origin");
  assert.equal(headers.get("Cross-Origin-Resource-Policy"), "same-origin");
  assert.equal(headers.get("X-Permitted-Cross-Domain-Policies"), "none");
  assert.equal(headers.get("X-DNS-Prefetch-Control"), "off");

  const csp = headers.get("Content-Security-Policy") ?? "";
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /img-src [^;]*\*\.public\.blob\.vercel-storage\.com/);
  assert.equal(csp.includes("'unsafe-eval'"), false);

  for (const source of ["/orders/:path*", "/admin/:path*", "/checkout/:path*"]) {
    const rule = rules.find((entry) => entry.source === source);
    assert.ok(rule, `missing cache rule for ${source}`);

    const cache = rule.headers.find(
      (header) => header.key === "Cache-Control",
    );
    assert.equal(cache?.value, "private, no-store", source);
  }

  for (const rule of rules) {
    const cache = rule.headers.find(
      (header) => header.key === "Cache-Control",
    );

    if (cache) {
      assert.equal(/public/.test(cache.value), false, rule.source);
    }
  }
});

test("supplier verification requires the dedicated verification permission", () => {
  const source = readRepo("lib/actions/admin.ts");

  assert.match(source, /requireSupplierVerificationPermission/);
  assert.match(source, /authorizeAdminRequest\("suppliers\.verify"\)/);

  const createBlock = source.includes("createSupplierAction");
  const updateBlock = source.includes("updateSupplierAction");

  assert.equal(createBlock, true);
  assert.equal(updateBlock, true);
  assert.ok(
    (source.match(/requireSupplierVerificationPermission\(\)/g) ?? []).length >= 3,
    "the guard must be defined and called by both supplier write actions",
  );
});

test("the public terms page is a noindex draft with a pending-approval notice", () => {
  const source = readRepo("app/(site)/terms/page.tsx");

  assert.match(source, /noIndex: true/);
  assert.match(source, /PendingApprovalNotice/);
  assert.match(source, /PENDING\s*OWNER\s*APPROVAL/i);
  assert.match(source, /href="\/privacy"/);
  assert.match(source, /href="\/returns"/);
});

test("demo products are visibly labelled and never orderable", () => {
  const list = readRepo("app/admin/(dashboard)/products/page.tsx");
  const preview = readRepo("app/admin/(dashboard)/products/[id]/preview/page.tsx");
  const publication = readRepo("lib/suppliers/publication.ts");

  assert.match(list, /DEMO_PRODUCT_BADGE/);
  assert.match(preview, /DEMO_PRODUCT_BADGE/);
  assert.match(publication, /DEMO_PRODUCT_PUBLICATION_BLOCKER/);
});

test("document language, landmarks, and motion preferences are declared", () => {
  const layout = readRepo("app/layout.tsx");
  const css = readRepo("app/globals.css");

  assert.match(layout, /<html lang="en"/);
  assert.match(layout, /<body className="[^"]*min-h-screen[^"]*"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);

  // A user-scalable=no viewport would block browser zoom.
  assert.equal(/user-scalable\s*=\s*no/i.test(layout), false);
  assert.equal(/maximum-scale\s*=\s*1/i.test(layout), false);
});
