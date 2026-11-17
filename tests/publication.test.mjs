import assert from "node:assert/strict";
import test from "node:test";

import {
  getOrderabilityBlockers,
  getPublicationBlockers,
  isOrderable,
  isPublishable,
} from "../lib/suppliers/publication.ts";

function evidence(overrides = {}) {
  return {
    supplierVerificationStatus: "VERIFIED",
    supplierStatus: "ACTIVE",
    agreementStatus: "APPROVED",
    supplyAuthorized: true,
    agreementImageRightsGranted: true,
    sku: "SKU-001",
    skuConfirmed: true,
    sellingPriceMinor: 250000,
    priceApproved: true,
    contentApproved: true,
    imageRightsStatus: "CONFIRMED",
    imageRightsApproved: true,
    imageCount: 2,
    availabilityVerifiedAt: new Date(),
    ...overrides,
  };
}

function orderEvidence(overrides = {}) {
  return {
    ...evidence(),
    publicationStatus: "PUBLISHED",
    availability: "IN_STOCK",
    stockQuantity: 3,
    ...overrides,
  };
}

test("fully evidenced products are publishable", () => {
  assert.equal(isPublishable(evidence()), true);
  assert.deepEqual(getPublicationBlockers(evidence()), []);
});

test("publication is blocked without supplier verification and approval", () => {
  assert.match(
    getPublicationBlockers(evidence({ supplierStatus: "DRAFT" })).join(" "),
    /not active/,
  );
  assert.match(
    getPublicationBlockers(evidence({ supplierVerificationStatus: "PENDING" })).join(" "),
    /not verified/,
  );
  assert.match(
    getPublicationBlockers(evidence({ agreementStatus: "DRAFT" })).join(" "),
    /agreement is not approved/,
  );
  assert.match(
    getPublicationBlockers(evidence({ supplyAuthorized: false })).join(" "),
    /Supply authorization/,
  );
  assert.match(
    getPublicationBlockers(evidence({ agreementImageRightsGranted: false })).join(" "),
    /Image usage rights/,
  );
});

test("publication is blocked without SKU, price, content, rights, and evidence", () => {
  assert.match(
    getPublicationBlockers(evidence({ sku: "   " })).join(" "),
    /SKU is missing/,
  );
  assert.match(
    getPublicationBlockers(evidence({ skuConfirmed: false })).join(" "),
    /SKU is missing/,
  );
  assert.match(
    getPublicationBlockers(evidence({ sellingPriceMinor: 0 })).join(" "),
    /Selling price/,
  );
  assert.match(
    getPublicationBlockers(evidence({ priceApproved: false })).join(" "),
    /Selling price/,
  );
  assert.match(
    getPublicationBlockers(evidence({ contentApproved: false })).join(" "),
    /content is not approved/,
  );
  assert.match(
    getPublicationBlockers(evidence({ imageRightsStatus: "PENDING" })).join(" "),
    /Image rights/,
  );
  assert.match(
    getPublicationBlockers(evidence({ imageRightsApproved: false })).join(" "),
    /Image rights/,
  );
  assert.match(
    getPublicationBlockers(evidence({ imageCount: 0 })).join(" "),
    /approved product image/,
  );
  assert.match(
    getPublicationBlockers(evidence({ availabilityVerifiedAt: null })).join(" "),
    /availability has not been verified/,
  );
});

test("ordering additionally requires publication and confirmed stock", () => {
  assert.equal(isOrderable(orderEvidence()), true);
  assert.match(
    getOrderabilityBlockers(orderEvidence({ publicationStatus: "DRAFT" })).join(" "),
    /not published/,
  );
  assert.match(
    getOrderabilityBlockers(orderEvidence({ availability: "OUT_OF_STOCK" })).join(" "),
    /not confirmed as in stock/,
  );
  assert.match(
    getOrderabilityBlockers(orderEvidence({ stockQuantity: 0 })).join(" "),
    /out of stock/,
  );
  assert.match(
    getOrderabilityBlockers(orderEvidence({ stockQuantity: -1 })).join(" "),
    /out of stock/,
  );
});

test("null stock is allowed only when availability is confirmed in stock", () => {
  assert.equal(isOrderable(orderEvidence({ stockQuantity: null })), true);
  assert.equal(
    isOrderable(orderEvidence({ stockQuantity: null, availability: "UNKNOWN" })),
    false,
  );
});

test("a product that fails publication can never be orderable", () => {
  assert.equal(
    isOrderable(orderEvidence({ supplierVerificationStatus: "UNVERIFIED" })),
    false,
  );
});

test("demo records are never publishable, even with full evidence", () => {
  const blockers = getPublicationBlockers(
    evidence({ slug: "demo-gold-ring", name: "DEMO Gold Ring" }),
  );

  assert.match(blockers.join(" "), /Demo products/);
  assert.equal(isPublishable(evidence({ slug: "demo-gold-ring" })), false);
  assert.equal(isPublishable(evidence({ name: "DEMO Gold Ring" })), false);
  assert.equal(isPublishable(evidence({ sku: "DEMO-SKU-1" })), false);
});

test("demo records are never orderable, even when published and in stock", () => {
  const blockers = getOrderabilityBlockers(
    orderEvidence({ slug: "demo-gold-ring" }),
  );

  assert.match(blockers.join(" "), /Demo products/);
  assert.equal(isOrderable(orderEvidence({ slug: "demo-gold-ring" })), false);
  assert.equal(isOrderable(orderEvidence({ name: "DEMO Gold Ring" })), false);
  assert.equal(isOrderable(orderEvidence({ sku: "DEMO-SKU-1" })), false);
});
