"use client";

import { useState } from "react";

import {
  getCountryReturnPolicy,
  returnPolicyCountryOptions,
} from "@/lib/returns-policy";

const fieldClass =
  "font-body mt-1.5 min-h-11 w-full rounded-brand border border-gold/30 bg-obsidian/60 px-3 py-2.5 text-base text-white focus-visible:outline-focus";
const labelClass = "font-nav text-sm font-semibold not-italic text-champagne";

/**
 * Country-aware return-term display. It reads the maintained configuration in
 * `lib/returns-policy.ts` and never invents a window, deduction, or refund rule
 * for a destination that has not been reviewed. Selecting a country here shows
 * published return terms only; it does not confirm delivery serviceability.
 */
export function CountryReturnPolicy() {
  const [countryCode, setCountryCode] = useState("PK");
  const policy = getCountryReturnPolicy(countryCode);
  const selectedCountryName =
    returnPolicyCountryOptions.find((option) => option.code === countryCode)
      ?.name ?? policy.name;

  return (
    <div className="surface-panel rounded-card border border-gold/20 p-4 sm:p-5">
      <label htmlFor="returns-country" className={labelClass}>
        Your delivery country
      </label>
      <select
        id="returns-country"
        value={countryCode}
        onChange={(event) => setCountryCode(event.target.value)}
        className={fieldClass}
      >
        {returnPolicyCountryOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-champagne/60">
        This selector shows the published return terms for a destination. It
        does not confirm that we currently deliver there.
      </p>

      <div aria-live="polite" className="mt-4">
        {policy.status === "configured" ? (
          <>
            <h3 className="font-nav text-base font-semibold not-italic text-accent">
              Published return terms for {selectedCountryName}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-champagne/80">
              <li>
                Change-of-mind return window:{" "}
                <strong className="font-semibold text-champagne">
                  {policy.changeOfMindWindowDays} days from delivery
                </strong>
                .
              </li>
              <li>
                Deduction from the customer&apos;s paid amount for eligible
                change-of-mind returns:{" "}
                <strong className="font-semibold text-champagne">
                  {policy.changeOfMindDeductionPercent}%
                </strong>
                .
              </li>
              <li>
                Refund after an eligible deduction:{" "}
                <strong className="font-semibold text-champagne">
                  {policy.changeOfMindRefundPercent}%
                </strong>{" "}
                of the paid amount.
              </li>
            </ul>
            <p className="mt-2 text-sm text-champagne/70">
              {policy.deductionAppliesTo} The deduction does not apply to
              defective, faulty, damaged, incorrect, or legally protected
              returns.
            </p>
            {policy.lastReviewed && (
              <p className="mt-1 text-xs text-champagne/60">
                Last reviewed: {policy.lastReviewed}. Formal legal review is
                still pending.
              </p>
            )}
          </>
        ) : (
          <>
            <h3 className="font-nav text-base font-semibold not-italic text-accent">
              Return terms require confirmation for {selectedCountryName}
            </h3>
            <p className="mt-2 text-sm text-champagne/80">
              We have not researched or configured the return terms for this
              destination. Please contact us before ordering or returning an
              item so we can confirm the applicable terms.
            </p>
            <p className="mt-2 text-xs text-champagne/60">
              We will not apply a deduction before the applicable local rules
              have been reviewed and disclosed before purchase.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
