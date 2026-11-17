import assert from "node:assert/strict";
import test from "node:test";

import {
  canTransitionOrder,
  getAllowedOrderTransitions,
  isCancellableStatus,
  isOrderState,
  orderStatusLabel,
} from "../lib/orders/status.ts";
import {
  generateOrderAccessToken,
  generateOrderNumber,
} from "../lib/orders/order-number.ts";

const FIXED_DATE = new Date("2026-11-08T12:00:00.000Z");

test("order numbers are date-stamped and deterministic when entropy is injected", () => {
  assert.equal(
    generateOrderNumber(FIXED_DATE, () => 0),
    "JS-20261108-000000",
  );
  assert.equal(
    generateOrderNumber(FIXED_DATE, () => 31),
    "JS-20261108-ZZZZZZ",
  );
});

test("order numbers use the UTC date", () => {
  assert.equal(
    generateOrderNumber(new Date("2026-01-01T23:30:00.000Z"), () => 1),
    "JS-20260101-111111",
  );
});

test("order numbers are unique across distinct entropy", () => {
  const numbers = new Set(
    Array.from({ length: 50 }, () => generateOrderNumber()),
  );

  assert.equal(numbers.size, 50);

  for (const number of numbers) {
    assert.match(number, /^JS-\d{8}-[0-9A-HJKMNP-TV-Z]{6}$/);
  }
});

test("order access tokens are unguessable and not derived from the order number", () => {
  const first = generateOrderAccessToken();
  const second = generateOrderAccessToken();

  assert.notEqual(first, second);
  assert.ok(first.length >= 40);
  assert.match(first, /^[A-Za-z0-9_-]+$/);
});

test("order status transitions follow the operational sequence", () => {
  assert.equal(canTransitionOrder("PENDING_CONFIRMATION", "CONFIRMED"), true);
  assert.equal(canTransitionOrder("PENDING_CONFIRMATION", "CANCELLED"), true);
  assert.equal(canTransitionOrder("CONFIRMED", "FORWARDED"), true);
  assert.equal(canTransitionOrder("CONFIRMED", "CANCELLED"), true);
  assert.equal(canTransitionOrder("FORWARDED", "SUPPLIER_PROCESSING"), true);
  assert.equal(canTransitionOrder("SUPPLIER_PROCESSING", "SHIPPED"), true);
  assert.equal(canTransitionOrder("SHIPPED", "DELIVERED"), true);
  assert.equal(canTransitionOrder("SHIPPED", "RETURNED"), true);
  assert.equal(canTransitionOrder("DELIVERED", "RETURNED"), true);
});

test("order status transitions cannot skip steps or leave terminal states", () => {
  assert.equal(canTransitionOrder("PENDING_CONFIRMATION", "SHIPPED"), false);
  assert.equal(canTransitionOrder("CONFIRMED", "DELIVERED"), false);
  assert.equal(canTransitionOrder("CANCELLED", "CONFIRMED"), false);
  assert.equal(canTransitionOrder("RETURNED", "DELIVERED"), false);
  assert.deepEqual(getAllowedOrderTransitions("CANCELLED"), []);
  assert.deepEqual(getAllowedOrderTransitions("DELIVERED"), ["RETURNED"]);
});

test("cancellation is only offered before dispatch", () => {
  assert.equal(isCancellableStatus("PENDING_CONFIRMATION"), true);
  assert.equal(isCancellableStatus("CONFIRMED"), true);
  assert.equal(isCancellableStatus("FORWARDED"), false);
  assert.equal(isCancellableStatus("SHIPPED"), false);
});

test("order state guards and labels are stable", () => {
  assert.equal(isOrderState("SHIPPED"), true);
  assert.equal(isOrderState("PAID"), false);
  assert.equal(orderStatusLabel("PENDING_CONFIRMATION"), "Pending confirmation");
  assert.equal(orderStatusLabel("FORWARDED"), "Forwarded to supplier");
});
