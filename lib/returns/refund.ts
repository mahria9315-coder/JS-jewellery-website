/**
 * Return and refund calculation rules.
 *
 * The client-approved Pakistan terms are a 3-day change-of-mind window and a
 * 25% deduction / 75% refund, but only where the applicable law permits the
 * deduction and it was disclosed before purchase. Defective, faulty, damaged,
 * incorrect, and otherwise legally protected returns never lose the 25%.
 *
 * The calculation is always server-side. A customer or browser cannot choose
 * the deduction. Dependency-free for unit tests.
 */

export const RETURN_REASON_CATEGORIES = [
  "CHANGE_OF_MIND",
  "DEFECTIVE",
  "DAMAGED",
  "INCORRECT",
  "OTHER",
] as const;

export type ReturnReason = (typeof RETURN_REASON_CATEGORIES)[number];

export const PROTECTED_RETURN_REASONS: readonly ReturnReason[] = [
  "DEFECTIVE",
  "DAMAGED",
  "INCORRECT",
  "OTHER",
];

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  CHANGE_OF_MIND: "Change of mind",
  DEFECTIVE: "Defective or faulty item",
  DAMAGED: "Damaged in transit",
  INCORRECT: "Incorrect item received",
  OTHER: "Other protected issue",
};

export function isReturnReason(value: string): value is ReturnReason {
  return (RETURN_REASON_CATEGORIES as readonly string[]).includes(value);
}

export function isProtectedReturnReason(reason: ReturnReason): boolean {
  return PROTECTED_RETURN_REASONS.includes(reason);
}

export type RefundCalculationInput = {
  /** Amount the customer actually paid, in minor units. */
  amountPaidMinor: number;
  reason: ReturnReason;
  /** Approved deduction for eligible change-of-mind returns, 0-100. */
  deductionPercent: number;
  /**
   * True only when the deduction is legally permitted and was disclosed before
   * purchase for the destination country. Protected cases ignore this.
   */
  deductionPermitted: boolean;
};

export type RefundCalculation = {
  protectedCase: boolean;
  eligibleForDeduction: boolean;
  deductionPercent: number;
  deductionMinor: number;
  refundAmountMinor: number;
};

export function calculateRefund(
  input: RefundCalculationInput,
): RefundCalculation {
  const amount = Math.max(0, Math.floor(input.amountPaidMinor));
  const protectedCase = isProtectedReturnReason(input.reason);

  if (protectedCase) {
    return {
      protectedCase: true,
      eligibleForDeduction: false,
      deductionPercent: 0,
      deductionMinor: 0,
      refundAmountMinor: amount,
    };
  }

  const rawPercent = Number.isFinite(input.deductionPercent)
    ? input.deductionPercent
    : 0;
  const percent = input.deductionPermitted
    ? Math.min(100, Math.max(0, Math.round(rawPercent)))
    : 0;

  const deductionMinor = Math.round((amount * percent) / 100);

  return {
    protectedCase: false,
    eligibleForDeduction: percent > 0,
    deductionPercent: percent,
    deductionMinor,
    refundAmountMinor: Math.max(0, amount - deductionMinor),
  };
}

export type CountryDeductionRule = {
  status: "configured" | "requires-confirmation";
  changeOfMindDeductionPercent: number | null;
};

/**
 * Resolve the deduction that may be applied for a return. Unconfigured
 * destinations never receive an invented rule.
 */
export function resolveDeduction(
  rule: CountryDeductionRule,
  reason: ReturnReason,
): { percent: number; permitted: boolean } {
  if (isProtectedReturnReason(reason)) {
    return { percent: 0, permitted: false };
  }

  if (
    rule.status !== "configured" ||
    rule.changeOfMindDeductionPercent === null
  ) {
    return { percent: 0, permitted: false };
  }

  return {
    percent: rule.changeOfMindDeductionPercent,
    permitted: true,
  };
}
