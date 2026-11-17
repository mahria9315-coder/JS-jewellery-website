import assert from "node:assert/strict";
import test from "node:test";

import {
  RETURN_REASON_CATEGORIES,
  calculateRefund,
  isProtectedReturnReason,
  isReturnReason,
  resolveDeduction,
} from "../lib/returns/refund.ts";

test("the five approved return reasons are recognised", () => {
  assert.deepEqual(RETURN_REASON_CATEGORIES, [
    "CHANGE_OF_MIND",
    "DEFECTIVE",
    "DAMAGED",
    "INCORRECT",
    "OTHER",
  ]);
  assert.equal(isReturnReason("DAMAGED"), true);
  assert.equal(isReturnReason("LATE"), false);
});

test("change of mind with a permitted 25% deduction refunds 75%", () => {
  const result = calculateRefund({
    amountPaidMinor: 10000,
    reason: "CHANGE_OF_MIND",
    deductionPercent: 25,
    deductionPermitted: true,
  });

  assert.deepEqual(result, {
    protectedCase: false,
    eligibleForDeduction: true,
    deductionPercent: 25,
    deductionMinor: 2500,
    refundAmountMinor: 7500,
  });
});

test("change of mind without legal permission is refunded in full", () => {
  const result = calculateRefund({
    amountPaidMinor: 10000,
    reason: "CHANGE_OF_MIND",
    deductionPercent: 25,
    deductionPermitted: false,
  });

  assert.equal(result.deductionPercent, 0);
  assert.equal(result.deductionMinor, 0);
  assert.equal(result.refundAmountMinor, 10000);
});

test("protected return cases never lose the deduction", () => {
  for (const reason of ["DEFECTIVE", "DAMAGED", "INCORRECT", "OTHER"]) {
    assert.equal(isProtectedReturnReason(reason), true);

    const result = calculateRefund({
      amountPaidMinor: 10000,
      reason,
      deductionPercent: 25,
      deductionPermitted: true,
    });

    assert.equal(result.protectedCase, true);
    assert.equal(result.eligibleForDeduction, false);
    assert.equal(result.deductionPercent, 0);
    assert.equal(result.deductionMinor, 0);
    assert.equal(result.refundAmountMinor, 10000);
  }
});

test("deduction percentages are clamped and rounded", () => {
  const over = calculateRefund({
    amountPaidMinor: 10000,
    reason: "CHANGE_OF_MIND",
    deductionPercent: 250,
    deductionPermitted: true,
  });
  assert.equal(over.deductionPercent, 100);
  assert.equal(over.refundAmountMinor, 0);

  const negative = calculateRefund({
    amountPaidMinor: 10000,
    reason: "CHANGE_OF_MIND",
    deductionPercent: -25,
    deductionPermitted: true,
  });
  assert.equal(negative.deductionPercent, 0);
  assert.equal(negative.refundAmountMinor, 10000);

  const rounded = calculateRefund({
    amountPaidMinor: 9999,
    reason: "CHANGE_OF_MIND",
    deductionPercent: 25,
    deductionPermitted: true,
  });
  assert.equal(rounded.deductionMinor, 2500);
  assert.equal(rounded.refundAmountMinor, 7499);
});

test("negative payments never produce a negative refund", () => {
  const result = calculateRefund({
    amountPaidMinor: -500,
    reason: "CHANGE_OF_MIND",
    deductionPercent: 25,
    deductionPermitted: true,
  });

  assert.equal(result.refundAmountMinor, 0);
});

test("unconfigured countries never receive an invented deduction", () => {
  assert.deepEqual(
    resolveDeduction(
      { status: "requires-confirmation", changeOfMindDeductionPercent: 25 },
      "CHANGE_OF_MIND",
    ),
    { percent: 0, permitted: false },
  );

  assert.deepEqual(
    resolveDeduction(
      { status: "configured", changeOfMindDeductionPercent: null },
      "CHANGE_OF_MIND",
    ),
    { percent: 0, permitted: false },
  );
});

test("configured Pakistan rules allow the 25% change-of-mind deduction", () => {
  assert.deepEqual(
    resolveDeduction(
      { status: "configured", changeOfMindDeductionPercent: 25 },
      "CHANGE_OF_MIND",
    ),
    { percent: 25, permitted: true },
  );

  assert.deepEqual(
    resolveDeduction(
      { status: "configured", changeOfMindDeductionPercent: 25 },
      "DAMAGED",
    ),
    { percent: 0, permitted: false },
  );
});
