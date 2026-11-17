import assert from "node:assert/strict";
import test from "node:test";

import {
  absoluteUrl,
  pageMetadata,
  SITE_NAME,
} from "../lib/site.ts";
import {
  buildProductStructuredData,
  serializeJsonLd,
} from "../lib/structured-data.ts";

function product(overrides = {}) {
  return {
    id: "p1",
    slug: "gold-ring",
    name: "Gold Ring",
    description: "A hand-finished gold ring.",
    images: [
      { src: "/images/products/rings/example.webp", alt: "Gold ring" },
    ],
    collectionSlugs: ["rings"],
    price: { amountMinor: 250000, currency: "PKR" },
    availability: { status: "in_stock" },
    stockQuantity: 3,
    ...overrides,
  };
}

test("an in-stock product emits a truthful offer with no invented claims", () => {
  const data = buildProductStructuredData(product());

  assert.equal(data["@context"], "https://schema.org");
  assert.equal(data["@type"], "Product");
  assert.equal(data.name, "Gold Ring");
  assert.equal(data.description, "A hand-finished gold ring.");
  assert.equal(data.url, absoluteUrl("/products/gold-ring"));
  assert.deepEqual(data.brand, { "@type": "Brand", name: SITE_NAME });

  const offer = data.offers;
  assert.equal(offer["@type"], "Offer");
  assert.equal(offer.priceCurrency, "PKR");
  assert.equal(offer.price, "2500.00");
  assert.equal(offer.availability, "https://schema.org/InStock");
  assert.equal(offer.itemCondition, "https://schema.org/NewCondition");
  assert.equal(offer.seller.name, SITE_NAME);

  for (const invented of [
    "aggregateRating",
    "review",
    "priceValidUntil",
    "shippingDetails",
    "hasMerchantReturnPolicy",
  ]) {
    assert.equal(invented in data, false, `must not invent ${invented}`);
  }
});

test("out-of-stock products are described without a purchase promise", () => {
  const data = buildProductStructuredData(
    product({ availability: { status: "out_of_stock" } }),
  );

  assert.equal(
    data.offers.availability,
    "https://schema.org/OutOfStock",
  );
});

test("products with unverified availability emit no offer at all", () => {
  const data = buildProductStructuredData(
    product({
      availability: {
        status: "verification_pending",
        lastVerifiedAt: "2026-11-01T00:00:00.000Z",
      },
    }),
  );

  assert.equal("offers" in data, false);
  assert.equal(data.name, "Gold Ring");
});

test("unsafe or external images are excluded from structured data", () => {
  const data = buildProductStructuredData(
    product({
      images: [
        { src: "/images/products/rings/valid.webp", alt: "Valid" },
        { src: "https://example.com/external.webp", alt: "External" },
        { src: "/images/products/../escape.webp", alt: "Traversal" },
        { src: "/images/products/rings/no-alt.webp", alt: "  " },
      ],
    }),
  );

  assert.deepEqual(data.image, [
    absoluteUrl("/images/products/rings/valid.webp"),
  ]);
});

test("products without a safe image omit the image field", () => {
  const data = buildProductStructuredData(
    product({ images: [{ src: "https://example.com/x.webp", alt: "External" }] }),
  );

  assert.equal("image" in data, false);
});

test("JSON-LD serialisation cannot break out of the script element", () => {
  const data = buildProductStructuredData(
    product({ name: '</script><script>alert("x")</script>' }),
  );
  const serialized = serializeJsonLd(data);

  assert.equal(serialized.includes("</script>"), false);
  assert.equal(serialized.includes("<"), false);
  assert.match(serialized, /\\u003c/);

  const parsed = JSON.parse(serialized);
  assert.equal(parsed.name, '</script><script>alert("x")</script>');
});

test("page metadata sets canonical, brand suffix, social fields, and optional noindex", () => {
  const indexed = pageMetadata({
    title: "Rings",
    description: "Browse rings.",
    path: "/collections/rings",
  });

  assert.equal(indexed.title, "Rings");
  assert.equal(indexed.description, "Browse rings.");
  assert.deepEqual(indexed.alternates, { canonical: "/collections/rings" });
  assert.equal(indexed.openGraph.title, `Rings | ${SITE_NAME}`);
  assert.equal(indexed.openGraph.url, absoluteUrl("/collections/rings"));
  assert.equal(indexed.twitter.title, `Rings | ${SITE_NAME}`);
  assert.equal(indexed.robots, undefined);

  const noIndex = pageMetadata({
    title: "Privacy Policy",
    description: "How we handle data.",
    path: "/privacy",
    noIndex: true,
  });

  assert.deepEqual(noIndex.robots, { index: false, follow: true });
  assert.equal(noIndex.alternates.canonical, "/privacy");
});

test("absolute titles bypass the brand suffix", () => {
  const metadata = pageMetadata({
    title: "JS Jewellers",
    description: "Home",
    path: "/",
    absoluteTitle: true,
  });

  assert.deepEqual(metadata.title, { absolute: "JS Jewellers" });
  assert.equal(metadata.openGraph.title, "JS Jewellers");
});
