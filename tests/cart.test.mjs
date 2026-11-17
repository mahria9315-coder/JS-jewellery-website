import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_CART_LINES,
  MAX_QUANTITY_PER_ITEM,
  addCartItem,
  normaliseCartItems,
  removeCartItem,
  updateCartItemQuantity,
  validateCart,
} from "../lib/cart/calculations.ts";

function product(overrides = {}) {
  return {
    productId: "p1",
    name: "Gold Ring",
    unitPriceMinor: 250000,
    currency: "PKR",
    available: true,
    stockQuantity: 5,
    ...overrides,
  };
}

function productMap(...products) {
  return new Map(products.map((entry) => [entry.productId, entry]));
}

test("normaliseCartItems reads arrays and { items } objects", () => {
  assert.deepEqual(
    normaliseCartItems([
      { productId: "p1", quantity: 2 },
      { productId: "p2", quantity: "3" },
    ]),
    [
      { productId: "p1", quantity: 2 },
      { productId: "p2", quantity: 3 },
    ],
  );

  assert.deepEqual(
    normaliseCartItems({ items: [{ productId: "p3", quantity: "4" }] }),
    [{ productId: "p3", quantity: 4 }],
  );
});

test("normaliseCartItems drops invalid entries, duplicates, and clamps quantity", () => {
  const items = normaliseCartItems([
    null,
    "nope",
    { productId: "", quantity: 1 },
    { productId: "p1", quantity: 0 },
    { productId: "p1", quantity: -3 },
    { productId: "p2", quantity: 999 },
    { productId: "p2", quantity: 4 },
    { productId: "x".repeat(65), quantity: 1 },
    { quantity: 2 },
  ]);

  assert.deepEqual(items, [{ productId: "p2", quantity: MAX_QUANTITY_PER_ITEM }]);
});

test("normaliseCartItems caps the number of cart lines", () => {
  const raw = Array.from({ length: MAX_CART_LINES + 5 }, (_, index) => ({
    productId: `p${index}`,
    quantity: 1,
  }));

  assert.equal(normaliseCartItems(raw).length, MAX_CART_LINES);
});

test("normaliseCartItems treats malformed input as an empty cart", () => {
  assert.deepEqual(normaliseCartItems(undefined), []);
  assert.deepEqual(normaliseCartItems("string"), []);
  assert.deepEqual(normaliseCartItems({ items: "no" }), []);
});

test("addCartItem merges an existing line and clamps at the item maximum", () => {
  const result = addCartItem([{ productId: "p1", quantity: 8 }], "p1", 5);

  assert.deepEqual(result, [{ productId: "p1", quantity: MAX_QUANTITY_PER_ITEM }]);
});

test("addCartItem ignores invalid quantities and respects the line cap", () => {
  assert.deepEqual(addCartItem([], "p1", 0), []);
  assert.deepEqual(addCartItem([], "  ", 2), []);

  const full = Array.from({ length: MAX_CART_LINES }, (_, index) => ({
    productId: `p${index}`,
    quantity: 1,
  }));

  assert.equal(addCartItem(full, "new", 1).length, MAX_CART_LINES);
});

test("updateCartItemQuantity removes a line when the quantity is below one", () => {
  const items = [
    { productId: "p1", quantity: 1 },
    { productId: "p2", quantity: 2 },
  ];

  assert.deepEqual(updateCartItemQuantity(items, "p1", 0), [
    { productId: "p2", quantity: 2 },
  ]);
  assert.deepEqual(updateCartItemQuantity(items, "p2", 4), [
    { productId: "p1", quantity: 1 },
    { productId: "p2", quantity: 4 },
  ]);
});

test("removeCartItem removes only the requested product", () => {
  const items = [
    { productId: "p1", quantity: 1 },
    { productId: "p2", quantity: 2 },
  ];

  assert.deepEqual(removeCartItem(items, "p1"), [
    { productId: "p2", quantity: 2 },
  ]);
});

test("validateCart prices from server records only", () => {
  const result = validateCart(
    [{ productId: "p1", quantity: 2 }],
    productMap(product()),
  );

  assert.equal(result.hasIssues, false);
  assert.equal(result.subtotalMinor, 500000);
  assert.equal(result.itemCount, 2);
  assert.equal(result.currency, "PKR");
  assert.deepEqual(result.lines, [
    {
      productId: "p1",
      quantity: 2,
      name: "Gold Ring",
      unitPriceMinor: 250000,
      currency: "PKR",
      lineTotalMinor: 500000,
    },
  ]);
});

test("validateCart reports missing, unavailable, and unpriced products", () => {
  const missing = validateCart([{ productId: "gone", quantity: 1 }], productMap());
  assert.equal(missing.hasIssues, true);
  assert.equal(missing.subtotalMinor, 0);
  assert.match(missing.errors[0], /no longer available/);

  const unavailable = validateCart(
    [{ productId: "p1", quantity: 1 }],
    productMap(product({ available: false, unavailableReason: "Supplier paused." })),
  );
  assert.deepEqual(unavailable.errors, ["Supplier paused."]);

  const unpriced = validateCart(
    [{ productId: "p1", quantity: 1 }],
    productMap(product({ unitPriceMinor: 0 })),
  );
  assert.match(unpriced.errors[0], /valid price/);
});

test("validateCart rejects quantities beyond confirmed stock", () => {
  const result = validateCart(
    [{ productId: "p1", quantity: 6 }],
    productMap(product({ stockQuantity: 1 })),
  );

  assert.equal(result.lines.length, 0);
  assert.equal(result.hasIssues, true);
  assert.match(result.errors[0], /Only 1 of Gold Ring is currently available/);
});

test("validateCart allows null stock and clamps browser quantities", () => {
  const result = validateCart(
    [{ productId: "p1", quantity: 99 }],
    productMap(product({ stockQuantity: null })),
  );

  assert.equal(result.hasIssues, false);
  assert.equal(result.lines[0].quantity, MAX_QUANTITY_PER_ITEM);
});
