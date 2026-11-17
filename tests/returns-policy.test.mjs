import assert from "node:assert/strict";
import test from "node:test";

import {
  PAKISTAN_RETURN_EXAMPLE,
  PAKISTAN_RETURN_POLICY,
  UNCONFIGURED_RETURN_POLICY,
  countryReturnPolicies,
  getCountryReturnPolicy,
  returnPolicyCountryOptions,
} from "../lib/returns-policy.ts";

test("Pakistan is the only legally reviewed and configured destination", () => {
  assert.deepEqual(Object.keys(countryReturnPolicies), ["PK"]);
  assert.deepEqual(getCountryReturnPolicy("PK"), PAKISTAN_RETURN_POLICY);
});

test("the approved Pakistan change-of-mind terms are exactly 3 / 25 / 75", () => {
  const policy = getCountryReturnPolicy("PK");

  assert.equal(policy.status, "configured");
  assert.equal(policy.changeOfMindWindowDays, 3);
  assert.equal(policy.changeOfMindDeductionPercent, 25);
  assert.equal(policy.changeOfMindRefundPercent, 75);
  assert.equal(policy.lastReviewed, "7 November 2026");
  assert.match(policy.deductionAppliesTo ?? "", /change-of-mind/i);
  assert.equal(
    policy.notes.some((note) => /does not apply/i.test(note)),
    true,
    "the protected-return carve-out must stay documented",
  );
});

test("country lookup is case-insensitive and trims nothing it should not invent", () => {
  assert.deepEqual(getCountryReturnPolicy("pk"), PAKISTAN_RETURN_POLICY);
  assert.deepEqual(getCountryReturnPolicy("Pk"), PAKISTAN_RETURN_POLICY);

  // Surrounding whitespace is not a real ISO code and must not be accepted.
  assert.equal(getCountryReturnPolicy(" PK "), UNCONFIGURED_RETURN_POLICY);
});

test("missing and unlisted destinations fall back without inventing terms", () => {
  for (const value of [null, undefined, "", "AE", "GB", "US", "ZZ"]) {
    const policy = getCountryReturnPolicy(value);

    assert.equal(policy, UNCONFIGURED_RETURN_POLICY, String(value));
    assert.equal(policy.status, "requires-confirmation");
    assert.equal(policy.changeOfMindWindowDays, null);
    assert.equal(policy.changeOfMindDeductionPercent, null);
    assert.equal(policy.changeOfMindRefundPercent, null);
    assert.equal(policy.deductionAppliesTo, null);
    assert.equal(policy.lastReviewed, null);
  }
});

test("the published country selector is unique and marks only PK as configured", () => {
  const codes = returnPolicyCountryOptions.map((option) => option.code);

  assert.equal(new Set(codes).size, codes.length);
  assert.ok(codes.includes("PK"));
  assert.ok(codes.includes("XX"));

  for (const option of returnPolicyCountryOptions) {
    assert.ok(option.name.trim().length > 0);
    const policy = getCountryReturnPolicy(option.code);
    assert.equal(
      policy.status,
      option.code === "PK" ? "configured" : "requires-confirmation",
      option.code,
    );
  }
});

test("the published example arithmetic matches the approved 25% deduction", () => {
  assert.equal(
    PAKISTAN_RETURN_EXAMPLE.deduction,
    PAKISTAN_RETURN_EXAMPLE.paidAmount * 0.25,
  );
  assert.equal(
    PAKISTAN_RETURN_EXAMPLE.refund,
    PAKISTAN_RETURN_EXAMPLE.paidAmount - PAKISTAN_RETURN_EXAMPLE.deduction,
  );
  assert.equal(PAKISTAN_RETURN_EXAMPLE.currency, "PKR");
});
