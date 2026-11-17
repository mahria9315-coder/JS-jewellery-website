/**
 * Maintainable return-policy configuration.
 *
 * The client has approved the Pakistan commercial terms: a 3-day
 * change-of-mind window measured from delivery, a 25% deduction from the
 * customer's paid amount, and a 75% refund for eligible returns. Those terms
 * apply only to eligible change-of-mind returns, only where the applicable law
 * permits the deduction, and never to defective, faulty, damaged, incorrect, or
 * otherwise legally protected returns.
 *
 * No country outside Pakistan has been legally reviewed or enabled. Every
 * other destination deliberately resolves to `requires-confirmation`, which
 * means the site must not invent a window, deduction, or refund rule for it.
 *
 * To enable a new destination later, add a reviewed entry to
 * `countryReturnPolicies`. Do not enable a country until its rules have been
 * checked, approved, and disclosed before purchase.
 */

export type ReturnPolicyStatus = "configured" | "requires-confirmation";

export type CountryReturnPolicy = {
  /** ISO 3166-1 alpha-2 code, or "XX" for the unconfigured fallback. */
  code: string;
  name: string;
  status: ReturnPolicyStatus;
  /** Change-of-mind window in calendar days, or null when not configured. */
  changeOfMindWindowDays: number | null;
  /** Deduction from the customer's paid amount, or null when not configured. */
  changeOfMindDeductionPercent: number | null;
  /** Refund after an eligible deduction, or null when not configured. */
  changeOfMindRefundPercent: number | null;
  /** Scope note that keeps the deduction away from protected returns. */
  deductionAppliesTo: string | null;
  lastReviewed: string | null;
  notes: string[];
};

export const PAKISTAN_RETURN_POLICY: CountryReturnPolicy = {
  code: "PK",
  name: "Pakistan",
  status: "configured",
  changeOfMindWindowDays: 3,
  changeOfMindDeductionPercent: 25,
  changeOfMindRefundPercent: 75,
  deductionAppliesTo:
    "Eligible change-of-mind returns only, where the applicable law permits the deduction and the term was disclosed before purchase.",
  lastReviewed: "7 November 2026",
  notes: [
    "Client-approved commercial terms.",
    "The 25% deduction does not apply to defective, faulty, damaged, incorrect, or legally protected returns.",
    "Statutory consumer remedies remain separate and are not reduced by these terms.",
    "Formal legal review is still pending.",
  ],
};

export const UNCONFIGURED_RETURN_POLICY: CountryReturnPolicy = {
  code: "XX",
  name: "Other destinations",
  status: "requires-confirmation",
  changeOfMindWindowDays: null,
  changeOfMindDeductionPercent: null,
  changeOfMindRefundPercent: null,
  deductionAppliesTo: null,
  lastReviewed: null,
  notes: [
    "We have not researched or configured the return terms for this destination.",
    "Return terms require confirmation before any order or return is accepted.",
    "No deduction will be applied until the applicable local rules have been reviewed and disclosed before purchase.",
  ],
};

/**
 * Reviewed country policies. Pakistan is the only configured destination.
 * Adding a country here is a legal and operational decision, not a copy change.
 */
export const countryReturnPolicies: Record<string, CountryReturnPolicy> = {
  PK: PAKISTAN_RETURN_POLICY,
};

/**
 * Countries offered in the public policy selector so customers can see which
 * rule applies to them. Listing a country does not confirm that JS Jewellers
 * delivers there; unconfigured destinations deliberately show the fallback.
 */
export const returnPolicyCountryOptions: { code: string; name: string }[] = [
  { code: "PK", name: "Pakistan" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "XX", name: "Other country / not listed" },
];

/** Resolve the published return terms for a destination. */
export function getCountryReturnPolicy(
  countryCode: string | null | undefined,
): CountryReturnPolicy {
  if (!countryCode) {
    return UNCONFIGURED_RETURN_POLICY;
  }

  return (
    countryReturnPolicies[countryCode.toUpperCase()] ??
    UNCONFIGURED_RETURN_POLICY
  );
}

/** Client-approved Pakistan change-of-mind figures, for display and tests. */
export const PAKISTAN_RETURN_EXAMPLE = {
  paidAmount: 10000,
  deduction: 2500,
  refund: 7500,
  currency: "PKR",
} as const;
