import assert from "node:assert/strict";
import test from "node:test";

import {
  formatPkr,
  getAllProducts,
  getProductBySlug,
  getProductsByCollection,
  hasValidDiscount,
} from "../lib/catalogue.ts";
import {
  filterAndSortProducts,
  hasActiveCatalogueQuery,
  parseCatalogueQuery,
} from "../lib/catalogue-query.ts";
import { collections, getCollection, getCollectionHref } from "../lib/collections.ts";
import {
  getDisplayProductImage,
  getDisplayProductImages,
  isSupportedProductImagePath,
} from "../lib/product-images.ts";
import {
  collectionLinks,
  policyLinks,
  primaryLinks,
  shopLinks,
} from "../lib/site-navigation.ts";

function product(overrides = {}) {
  return {
    id: "p1",
    slug: "gold-ring",
    name: "Gold Ring",
    description: "A ring",
    images: [],
    collectionSlugs: ["rings"],
    price: { amountMinor: 250000, currency: "PKR" },
    availability: { status: "in_stock" },
    stockQuantity: 3,
    ...overrides,
  };
}

test("the eight approved collections are unique and resolvable", () => {
  assert.equal(collections.length, 8);
  assert.equal(new Set(collections.map((entry) => entry.slug)).size, 8);

  for (const collection of collections) {
    assert.ok(collection.name.trim().length > 0);
    assert.ok(collection.summary.trim().length > 0);
    assert.equal(getCollection(collection.slug), collection);
    assert.equal(getCollectionHref(collection.slug), `/collections/${collection.slug}`);
  }

  assert.equal(getCollection("not-a-collection"), undefined);
});

test("navigation links are unique, site-relative, and match the collection catalogue", () => {
  for (const group of [primaryLinks, shopLinks, collectionLinks, policyLinks]) {
    assert.ok(group.length > 0);
    assert.equal(new Set(group.map((item) => item.href)).size, group.length);

    for (const item of group) {
      assert.ok(item.label.trim().length > 0);
      assert.ok(item.href.startsWith("/"));
      assert.equal(item.href.startsWith("//"), false);
    }
  }

  assert.deepEqual(
    collectionLinks,
    collections.map((collection) => ({
      label: collection.name,
      href: `/collections/${collection.slug}`,
    })),
  );

  const primaryHrefs = primaryLinks.map((item) => item.href);
  assert.ok(primaryHrefs.includes("/cart"));
  assert.ok(primaryHrefs.includes("/search"));
  assert.ok(primaryHrefs.includes("/collections/customized-name-jewellery"));

  assert.deepEqual(
    policyLinks.map((item) => item.href),
    ["/privacy", "/terms", "/returns", "/shipping"],
  );
});

test("the public catalogue stays empty until approved supplier data exists", () => {
  // Guards against invented demo listings being published in production.
  assert.deepEqual(getAllProducts(), []);
  assert.equal(getProductBySlug("gold-ring"), undefined);
  assert.deepEqual(getProductsByCollection("rings"), []);
});

test("discount display requires a genuine higher same-currency original price", () => {
  assert.equal(hasValidDiscount(product()), false);
  assert.equal(
    hasValidDiscount(
      product({ originalPrice: { amountMinor: 300000, currency: "PKR" } }),
    ),
    true,
  );
  assert.equal(
    hasValidDiscount(
      product({ originalPrice: { amountMinor: 250000, currency: "PKR" } }),
    ),
    false,
  );
  assert.equal(
    hasValidDiscount(
      product({ originalPrice: { amountMinor: 200000, currency: "PKR" } }),
    ),
    false,
  );
  assert.equal(
    hasValidDiscount(
      product({ originalPrice: { amountMinor: 300000, currency: "USD" } }),
    ),
    false,
  );
});

test("prices are formatted as PKR from stored minor units", () => {
  const formatted = formatPkr({ amountMinor: 250000, currency: "PKR" });

  assert.match(formatted, /2,500/);
  assert.match(formatted, /PKR|Rs/);
  assert.equal(/\.[0-9]{3}/.test(formatted), false);
  assert.match(formatPkr({ amountMinor: 0, currency: "PKR" }), /0/);
});

test("catalogue query parsing rejects unknown values and normalises search text", () => {
  assert.deepEqual(parseCatalogueQuery({}), {
    q: "",
    collection: "all",
    sort: "default",
    availability: "all",
  });

  assert.deepEqual(
    parseCatalogueQuery({
      q: "  gold   ring ",
      collection: "rings",
      sort: "price-asc",
      availability: "in_stock",
    }),
    {
      q: "gold ring",
      collection: "rings",
      sort: "price-asc",
      availability: "in_stock",
    },
  );

  assert.deepEqual(
    parseCatalogueQuery({
      q: ["first", "second"],
      collection: "not-a-collection",
      sort: "cheapest",
      availability: "maybe",
    }),
    {
      q: "first",
      collection: "all",
      sort: "default",
      availability: "all",
    },
  );

  assert.equal(hasActiveCatalogueQuery(parseCatalogueQuery({})), false);
  assert.equal(hasActiveCatalogueQuery(parseCatalogueQuery({ q: "ring" })), true);
  assert.equal(
    hasActiveCatalogueQuery(parseCatalogueQuery({ sort: "price-desc" })),
    true,
  );
});

test("search is case-insensitive and matches collapsed whitespace", () => {
  const catalogue = [
    product({ id: "p1", slug: "gold-ring", name: "Gold Ring" }),
    product({ id: "p2", slug: "silver-ring", name: "Silver  Ring" }),
    product({ id: "p3", slug: "gold-necklace", name: "Gold Necklace" }),
  ];

  const result = filterAndSortProducts(
    catalogue,
    parseCatalogueQuery({ q: "  GOLD   RING " }),
  );

  assert.deepEqual(
    result.map((entry) => entry.slug),
    ["gold-ring"],
  );
});

test("collection and availability filters combine with search", () => {
  const catalogue = [
    product({ id: "p1", slug: "gold-ring", name: "Gold Ring" }),
    product({
      id: "p2",
      slug: "gold-earring",
      name: "Gold Earring",
      collectionSlugs: ["earrings"],
    }),
    product({
      id: "p3",
      slug: "gold-pending",
      name: "Gold Pending",
      availability: { status: "verification_pending" },
    }),
  ];

  const ringsOnly = filterAndSortProducts(
    catalogue,
    parseCatalogueQuery({ q: "gold", collection: "rings" }),
  );
  assert.deepEqual(ringsOnly.map((entry) => entry.slug), ["gold-ring", "gold-pending"]);

  const confirmedOnly = filterAndSortProducts(
    catalogue,
    parseCatalogueQuery({ q: "gold", availability: "in_stock" }),
  );
  assert.deepEqual(
    confirmedOnly.map((entry) => entry.slug),
    ["gold-ring", "gold-earring"],
  );
});

test("sorting is price-based with a stable name and slug tie-break, without mutating input", () => {
  const catalogue = [
    product({ id: "p1", slug: "b-ring", name: "B Ring", price: { amountMinor: 300000, currency: "PKR" } }),
    product({ id: "p2", slug: "a-ring", name: "A Ring", price: { amountMinor: 300000, currency: "PKR" } }),
    product({ id: "p3", slug: "c-ring", name: "C Ring", price: { amountMinor: 100000, currency: "PKR" } }),
  ];
  const originalOrder = catalogue.map((entry) => entry.slug);

  const ascending = filterAndSortProducts(
    catalogue,
    parseCatalogueQuery({ sort: "price-asc" }),
  );
  assert.deepEqual(
    ascending.map((entry) => entry.slug),
    ["c-ring", "a-ring", "b-ring"],
  );

  const descending = filterAndSortProducts(
    catalogue,
    parseCatalogueQuery({ sort: "price-desc" }),
  );
  assert.deepEqual(
    descending.map((entry) => entry.slug),
    ["a-ring", "b-ring", "c-ring"],
  );

  const defaultOrder = filterAndSortProducts(catalogue, parseCatalogueQuery({}));
  assert.deepEqual(
    defaultOrder.map((entry) => entry.slug),
    originalOrder,
  );

  assert.deepEqual(
    catalogue.map((entry) => entry.slug),
    originalOrder,
  );
});

test("product images must be supported local raster paths with meaningful alt text", () => {
  for (const src of [
    "/images/products/rings/example.webp",
    "/images/products/necklaces/example-2.jpg",
    "/images/products/bracelets/example.jpeg",
    "/images/products/earrings/example.png",
    "/images/products/pearls/example.avif",
  ]) {
    assert.equal(isSupportedProductImagePath(src), true, src);
  }

  for (const src of [
    "/images/products/../secret.webp",
    "/images/products/rings/example.svg",
    "/images/products/rings/example.gif",
    "https://example.com/rings/example.webp",
    "/uploads/rings/example.webp",
    "",
  ]) {
    assert.equal(isSupportedProductImagePath(src), false, src);
  }

  assert.deepEqual(
    getDisplayProductImage({
      src: "/images/products/rings/example.webp",
      alt: "  Gold ring  ",
    }),
    { src: "/images/products/rings/example.webp", alt: "Gold ring" },
  );
  assert.equal(
    getDisplayProductImage({
      src: "/images/products/rings/example.webp",
      alt: "   ",
    }),
    undefined,
  );
  assert.equal(
    getDisplayProductImage({
      src: "https://example.com/example.webp",
      alt: "Gold ring",
    }),
    undefined,
  );

  assert.deepEqual(
    getDisplayProductImages([
      { src: "/images/products/rings/one.webp", alt: "One" },
      { src: "https://example.com/two.webp", alt: "Two" },
      { src: "/images/products/rings/three.webp", alt: "" },
      { src: "/images/products/rings/four.png", alt: "Four" },
    ]),
    [
      { src: "/images/products/rings/one.webp", alt: "One" },
      { src: "/images/products/rings/four.png", alt: "Four" },
    ],
  );
});
