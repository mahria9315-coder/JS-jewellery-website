import assert from "node:assert/strict";
import test from "node:test";

import {
  addCartItem,
  normaliseCartItems,
  updateCartItemQuantity,
  validateCart,
} from "../lib/cart/calculations.ts";
import {
  CUSTOMIZATION_COLOURS,
  CUSTOMIZATION_FONTS,
  MAX_CUSTOMIZATION_INSTRUCTIONS_LENGTH,
  MAX_CUSTOMIZATION_TEXT_LENGTH,
  approvedColoursOnly,
  approvedFontsOnly,
  hasCustomizationInput,
  normaliseStoredCustomization,
  resolveCustomizationConfig,
  validateCustomization,
} from "../lib/customization/config.ts";

const ENABLED = {
  enabled: true,
  fonts: [...CUSTOMIZATION_FONTS],
  colours: [...CUSTOMIZATION_COLOURS],
};

function selection(overrides = {}) {
  return {
    text: "Ayesha",
    font: "Classic",
    colour: "Gold",
    instructions: null,
    ...overrides,
  };
}

test("only the owner-approved customization options exist", () => {
  assert.deepEqual([...CUSTOMIZATION_FONTS], [
    "Classic",
    "Elegant",
    "Script",
    "Modern",
    "Bold",
    "Handwriting / Calligraphy",
  ]);
  assert.deepEqual([...CUSTOMIZATION_COLOURS], [
    "Gold",
    "Silver",
    "Rose Gold",
    "Platinum",
    "Antique Gold",
  ]);
  assert.equal(MAX_CUSTOMIZATION_TEXT_LENGTH, 20);
});

test("approved option filters drop unknown values and duplicates", () => {
  assert.deepEqual(
    approvedFontsOnly(["Classic", "Nope", "Classic", "Modern"]),
    ["Classic", "Modern"],
  );
  assert.deepEqual(
    approvedColoursOnly(["Gold", "Blue", "Gold", "Silver"]),
    ["Gold", "Silver"],
  );
});

test("customization stays disabled without a toggle, confirmation, or matching supplier", () => {
  const confirmation = {
    supplierId: "supplier-1",
    approvedFonts: ["Classic"],
    approvedColours: ["Gold"],
  };

  assert.equal(
    resolveCustomizationConfig({
      productCustomizationEnabled: false,
      productSupplierId: "supplier-1",
      confirmation,
    }).enabled,
    false,
  );

  assert.equal(
    resolveCustomizationConfig({
      productCustomizationEnabled: true,
      productSupplierId: "supplier-1",
      confirmation: null,
    }).enabled,
    false,
  );

  assert.equal(
    resolveCustomizationConfig({
      productCustomizationEnabled: true,
      productSupplierId: "supplier-1",
      confirmation: { ...confirmation, supplierId: "supplier-2" },
    }).enabled,
    false,
  );

  assert.equal(
    resolveCustomizationConfig({
      productCustomizationEnabled: true,
      productSupplierId: "supplier-1",
      confirmation: {
        ...confirmation,
        approvedFonts: ["Not a font"],
        approvedColours: ["Gold"],
      },
    }).enabled,
    false,
  );
});

test("a valid confirmation exposes only the approved supplier options", () => {
  const config = resolveCustomizationConfig({
    productCustomizationEnabled: true,
    productSupplierId: "supplier-1",
    confirmation: {
      supplierId: "supplier-1",
      approvedFonts: ["Classic", "Nope"],
      approvedColours: ["Gold", "Silver"],
    },
  });

  assert.deepEqual(config, {
    enabled: true,
    fonts: ["Classic"],
    colours: ["Gold", "Silver"],
  });
});

test("validateCustomization enforces required text, approved options, and length", () => {
  assert.equal(validateCustomization(null, ENABLED).ok, false);
  assert.equal(
    validateCustomization(selection({ text: "   " }), ENABLED).ok,
    false,
  );
  assert.equal(
    validateCustomization(selection({ text: "x".repeat(21) }), ENABLED).ok,
    false,
  );
  assert.equal(
    validateCustomization(selection({ text: "x".repeat(20) }), ENABLED).ok,
    true,
  );
  assert.equal(
    validateCustomization(selection({ font: "Comic Sans" }), ENABLED).ok,
    false,
  );
  assert.equal(
    validateCustomization(selection({ colour: "Blue" }), ENABLED).ok,
    false,
  );
});

test("validateCustomization rejects options the supplier did not approve", () => {
  const limited = {
    enabled: true,
    fonts: ["Modern"],
    colours: ["Platinum"],
  };

  assert.equal(
    validateCustomization(selection({ font: "Classic" }), limited).ok,
    false,
  );
  assert.equal(
    validateCustomization(selection({ colour: "Gold" }), limited).ok,
    false,
  );
  assert.equal(
    validateCustomization(
      selection({ font: "Modern", colour: "Platinum" }),
      limited,
    ).ok,
    true,
  );
});

test("validateCustomization trims text and treats blank instructions as null", () => {
  const result = validateCustomization(
    selection({ text: "  Ayesha  ", instructions: "   " }),
    ENABLED,
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    text: "Ayesha",
    font: "Classic",
    colour: "Gold",
    instructions: null,
  });
});

test("validateCustomization rejects overlong or control-character instructions", () => {
  assert.equal(
    validateCustomization(
      selection({ instructions: "x".repeat(MAX_CUSTOMIZATION_INSTRUCTIONS_LENGTH + 1) }),
      ENABLED,
    ).ok,
    false,
  );
  assert.equal(
    validateCustomization(selection({ instructions: "cut\u0000here" }), ENABLED).ok,
    false,
  );
});

test("normaliseStoredCustomization drops malformed and overlong stored values", () => {
  assert.equal(normaliseStoredCustomization(null), undefined);
  assert.equal(normaliseStoredCustomization({ text: "Ayesha" }), undefined);
  assert.equal(
    normaliseStoredCustomization({ ...selection(), text: "x".repeat(21) }),
    undefined,
  );
  assert.equal(
    normaliseStoredCustomization({ ...selection(), font: "Unknown" }),
    undefined,
  );
  assert.deepEqual(normaliseStoredCustomization(selection()), selection());
});

test("hasCustomizationInput detects any supplied field", () => {
  assert.equal(hasCustomizationInput({}), false);
  assert.equal(hasCustomizationInput({ text: "   " }), false);
  assert.equal(hasCustomizationInput({ text: "A" }), true);
  assert.equal(hasCustomizationInput({ instructions: "note" }), true);
});

test("cart normalisation keeps valid customization and drops invalid customization", () => {
  const items = normaliseCartItems([
    { productId: "p1", quantity: 1, customization: selection() },
    { productId: "p2", quantity: 1, customization: { text: "x" } },
  ]);

  assert.deepEqual(items, [
    { productId: "p1", quantity: 1, customization: selection() },
    { productId: "p2", quantity: 1 },
  ]);
});

test("adding or updating quantity preserves the stored customization", () => {
  const first = addCartItem([], "p1", 1, selection());
  assert.deepEqual(first[0].customization, selection());

  const merged = addCartItem(first, "p1", 2);
  assert.equal(merged[0].quantity, 3);
  assert.deepEqual(merged[0].customization, selection());

  const updated = updateCartItemQuantity(merged, "p1", 5);
  assert.equal(updated[0].quantity, 5);
  assert.deepEqual(updated[0].customization, selection());
});

test("validateCart revalidates customization against live product configuration", () => {
  const product = {
    productId: "p1",
    name: "Gold Ring",
    unitPriceMinor: 250000,
    currency: "PKR",
    available: true,
    stockQuantity: 5,
    customization: ENABLED,
  };
  const products = new Map([["p1", product]]);

  const valid = validateCart(
    [{ productId: "p1", quantity: 1, customization: selection() }],
    products,
  );
  assert.equal(valid.hasIssues, false);
  assert.deepEqual(valid.lines[0].customization, selection());

  const unapproved = validateCart(
    [
      {
        productId: "p1",
        quantity: 1,
        customization: selection({ font: "Comic Sans" }),
      },
    ],
    products,
  );
  assert.equal(unapproved.hasIssues, true);
  assert.equal(unapproved.lines.length, 0);

  const nowDisabled = validateCart(
    [{ productId: "p1", quantity: 1, customization: selection() }],
    new Map([
      [
        "p1",
        {
          ...product,
          customization: { enabled: false, fonts: [], colours: [] },
        },
      ],
    ]),
  );
  assert.equal(nowDisabled.hasIssues, true);
  assert.equal(nowDisabled.lines.length, 0);
});
