import assert from "node:assert/strict";
import test from "node:test";

import {
  PRODUCTION_STATUSES,
  PRODUCTION_STATUS_LABELS,
  canTransitionProduction,
  getAllowedProductionTransitions,
  isProductionState,
  productionStatusLabel,
} from "../lib/orders/production-status.ts";
import {
  ORDER_STATUSES,
  canTransitionOrder,
} from "../lib/orders/status.ts";

test("production statuses are exactly the four approved states", () => {
  assert.deepEqual([...PRODUCTION_STATUSES], [
    "PENDING",
    "CONFIRMED",
    "IN_PRODUCTION",
    "COMPLETED",
  ]);
});

test("production status labels are stable and customer-readable", () => {
  assert.deepEqual(PRODUCTION_STATUS_LABELS, {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    IN_PRODUCTION: "In production",
    COMPLETED: "Completed",
  });
  assert.equal(productionStatusLabel("IN_PRODUCTION"), "In production");
});

test("production transitions are linear and cannot skip steps", () => {
  assert.equal(canTransitionProduction("PENDING", "CONFIRMED"), true);
  assert.equal(canTransitionProduction("CONFIRMED", "IN_PRODUCTION"), true);
  assert.equal(canTransitionProduction("IN_PRODUCTION", "COMPLETED"), true);

  assert.equal(canTransitionProduction("PENDING", "IN_PRODUCTION"), false);
  assert.equal(canTransitionProduction("PENDING", "COMPLETED"), false);
  assert.equal(canTransitionProduction("CONFIRMED", "COMPLETED"), false);
});

test("completed production is terminal", () => {
  assert.deepEqual(getAllowedProductionTransitions("COMPLETED"), []);
  assert.deepEqual(getAllowedProductionTransitions("PENDING"), ["CONFIRMED"]);
  assert.deepEqual(getAllowedProductionTransitions("CONFIRMED"), [
    "IN_PRODUCTION",
  ]);
  assert.deepEqual(getAllowedProductionTransitions("IN_PRODUCTION"), [
    "COMPLETED",
  ]);
});

test("production state guard rejects unknown values", () => {
  assert.equal(isProductionState("PENDING"), true);
  assert.equal(isProductionState("SHIPPED"), false);
  assert.equal(isProductionState("pending"), false);
});

test("production and fulfilment workflows remain separate", () => {
  // The two vocabularies may share the word CONFIRMED, but the production
  // workflow must not carry fulfilment-only states, and order status must not
  // carry the production-only state.
  for (const status of ["SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"]) {
    assert.equal(
      PRODUCTION_STATUSES.includes(status),
      false,
      `${status} must not be a production status`,
    );
  }

  assert.equal(ORDER_STATUSES.includes("IN_PRODUCTION"), false);
});

test("verifying payment cannot auto-complete production", () => {
  // Production starts at PENDING, and the only legal first move is CONFIRMED.
  // There is no payment edge in the production workflow, so a verified payment
  // can never produce COMPLETED directly.
  assert.equal(canTransitionProduction("PENDING", "COMPLETED"), false);
  assert.equal(canTransitionProduction("PENDING", "IN_PRODUCTION"), false);

  // Order status transitions also do not include production states.
  assert.equal(
    canTransitionOrder("PENDING_CONFIRMATION", "COMPLETED"),
    false,
  );
});
