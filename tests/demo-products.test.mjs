import assert from "node:assert/strict";
import test from "node:test";

import {
  DEMO_PRODUCT_BADGE,
  DEMO_PRODUCT_ORDER_BLOCKER,
  DEMO_PRODUCT_PUBLICATION_BLOCKER,
  isDemoProduct,
} from "../lib/demo-products.ts";

test("explicit DEMO markers are detected in slug, SKU, or name", () => {
  assert.equal(isDemoProduct({ slug: "demo-ring-01" }), true);
  assert.equal(isDemoProduct({ slug: "DEMO-ring-01" }), true);
  assert.equal(isDemoProduct({ sku: "DEMO-SKU-1" }), true);
  assert.equal(isDemoProduct({ name: "DEMO Gold Ring" }), true);
  assert.equal(isDemoProduct({ name: "[DEMO] Gold Ring" }), true);
  assert.equal(isDemoProduct({ name: "Demo_Gold Ring" }), true);
});

test("genuine products are not mistaken for demo content", () => {
  assert.equal(isDemoProduct({}), false);
  assert.equal(isDemoProduct({ slug: "", sku: "   ", name: null }), false);
  assert.equal(isDemoProduct({ slug: "gold-ring-01", name: "Gold Ring" }), false);
  assert.equal(isDemoProduct({ name: "Demolition Charm" }), false);
  assert.equal(isDemoProduct({ slug: "demonstration-ring" }), false);
  assert.equal(isDemoProduct({ name: "Gold Ring (demo piece)" }), false);
});

test("demo content has fixed, honest labels", () => {
  assert.match(DEMO_PRODUCT_BADGE, /DEMO/);
  assert.match(DEMO_PRODUCT_BADGE, /preview/i);
  assert.match(DEMO_PRODUCT_PUBLICATION_BLOCKER, /cannot be published/i);
  assert.match(DEMO_PRODUCT_ORDER_BLOCKER, /cannot be ordered/i);
});
