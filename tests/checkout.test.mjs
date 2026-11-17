import assert from "node:assert/strict";
import test from "node:test";

import {
  ALLOWED_DELIVERY_COUNTRY_CODES,
  validateCheckout,
} from "../lib/checkout/validation.ts";

const IDEMPOTENCY_KEY = "checkout-key-1234567890";

function validInput(overrides = {}) {
  return {
    fullName: "Ayesha Khan",
    email: "Ayesha@Example.com",
    phone: "+92 300 1234567",
    countryCode: "pk",
    city: "Lahore",
    addressLine1: "House 1, Street 2, Gulberg",
    addressLine2: "Near the park",
    postalCode: "54000",
    customerNotes: "Please call before delivery.",
    paymentMethod: "bank-transfer",
    idempotencyKey: IDEMPOTENCY_KEY,
    acceptedPolicy: "true",
    ...overrides,
  };
}

test("only Pakistan is enabled for delivery", () => {
  assert.deepEqual(ALLOWED_DELIVERY_COUNTRY_CODES, ["PK"]);
});

test("validateCheckout accepts and normalises a valid submission", () => {
  const result = validateCheckout(validInput());

  assert.equal(result.ok, true);

  if (!result.ok) {
    assert.fail("expected valid checkout");
  }

  assert.equal(result.value.email, "ayesha@example.com");
  assert.equal(result.value.countryCode, "PK");
  assert.equal(result.value.fullName, "Ayesha Khan");
  assert.equal(result.value.addressLine2, "Near the park");
  assert.equal(result.value.paymentMethod, "bank-transfer");
});

test("validateCheckout collapses whitespace and returns null for empty optional fields", () => {
  const result = validateCheckout(
    validInput({
      fullName: "  Ayesha   Khan  ",
      city: "  Lahore ",
      addressLine2: "",
      postalCode: "",
      customerNotes: "",
    }),
  );

  assert.equal(result.ok, true);

  if (!result.ok) {
    assert.fail("expected valid checkout");
  }

  assert.equal(result.value.fullName, "Ayesha Khan");
  assert.equal(result.value.city, "Lahore");
  assert.equal(result.value.addressLine2, null);
  assert.equal(result.value.postalCode, null);
  assert.equal(result.value.customerNotes, null);
});

test("validateCheckout rejects a non-Pakistan destination", () => {
  const result = validateCheckout(validInput({ countryCode: "AE" }));

  assert.equal(result.ok, false);

  if (result.ok) {
    assert.fail("expected invalid checkout");
  }

  assert.match(result.errors.countryCode, /not currently available to that country/);
});

test("validateCheckout rejects missing and malformed contact details", () => {
  const result = validateCheckout(
    validInput({
      fullName: "A",
      email: "not-an-email",
      phone: "12",
      city: "L",
      addressLine1: "abc",
    }),
  );

  assert.equal(result.ok, false);

  if (result.ok) {
    assert.fail("expected invalid checkout");
  }

  for (const field of ["fullName", "email", "phone", "city", "addressLine1"]) {
    assert.equal(typeof result.errors[field], "string", `expected ${field} error`);
  }
});

test("validateCheckout rejects unsupported payment methods", () => {
  const result = validateCheckout(validInput({ paymentMethod: "card" }));

  assert.equal(result.ok, false);

  if (result.ok) {
    assert.fail("expected invalid checkout");
  }

  assert.match(result.errors.paymentMethod, /Select a payment method/);
});

test("validateCheckout requires a well-formed idempotency key", () => {
  const result = validateCheckout(validInput({ idempotencyKey: "short" }));

  assert.equal(result.ok, false);

  if (result.ok) {
    assert.fail("expected invalid checkout");
  }

  assert.match(result.errors.idempotencyKey, /expired/);
});

test("validateCheckout requires policy acceptance unless explicitly waived", () => {
  const rejected = validateCheckout(validInput({ acceptedPolicy: "false" }));

  assert.equal(rejected.ok, false);

  if (rejected.ok) {
    assert.fail("expected invalid checkout");
  }

  assert.equal(typeof rejected.errors.acceptedPolicy, "string");

  const missing = validateCheckout(validInput({ acceptedPolicy: undefined }));

  assert.equal(missing.ok, false);

  if (missing.ok) {
    assert.fail("expected invalid checkout");
  }

  assert.equal(typeof missing.errors.acceptedPolicy, "string");

  const allowed = validateCheckout(validInput({ acceptedPolicy: undefined }), {
    requirePolicyAcceptance: false,
  });

  assert.equal(allowed.ok, true);
});

test("validateCheckout rejects control characters and bad postal codes", () => {
  const result = validateCheckout(
    validInput({ fullName: "Ayesha\u0000Khan", postalCode: "!!" }),
  );

  assert.equal(result.ok, false);

  if (result.ok) {
    assert.fail("expected invalid checkout");
  }

  assert.equal(typeof result.errors.fullName, "string");
  assert.equal(typeof result.errors.postalCode, "string");
});

test("validateCheckout rejects an empty submission", () => {
  const result = validateCheckout({});

  assert.equal(result.ok, false);

  if (result.ok) {
    assert.fail("expected invalid checkout");
  }

  assert.ok(Object.keys(result.errors).length >= 8);
});
