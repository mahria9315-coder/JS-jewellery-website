import { StatusPill, formatDate } from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  Notice,
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  updateCourierAccountAction,
  updateCourierDestinationAction,
  updateCourierJewelleryAction,
  updateCourierStatusAction,
} from "@/lib/actions/admin-content";
import type { AdminCourierSettings } from "@/lib/admin/settings";
import { formatPkr } from "@/lib/catalogue";
import {
  COURIER_ACCOUNT_VERIFICATIONS,
  COURIER_ACCOUNT_VERIFICATION_LABELS,
  COURIER_SCOPE_LABELS,
  COURIER_STATUSES,
  COURIER_STATUS_LABELS,
  JEWELLERY_ACCEPTANCE_STATES,
  JEWELLERY_ACCEPTANCE_LABELS,
  TRACKING_PLACEHOLDER,
} from "@/lib/couriers/config";

/**
 * Courier configuration section for the admin shipping page (T026A/T026B, T060).
 *
 * Every control writes through the server-side settings functions, which
 * enforce the activation guards and evidence requirements. Nothing here can
 * approve a courier on its own: adding or selecting a courier company is never
 * treated as the courier's own approval.
 */

function statusTone(status: string) {
  if (status === "ACTIVE") {
    return "success" as const;
  }

  if (status === "APPROVED") {
    return "info" as const;
  }

  if (status === "SUSPENDED") {
    return "danger" as const;
  }

  return "warning" as const;
}

/**
 * Jewellery restriction notice for every courier. Many courier companies
 * restrict or prohibit jewellery under their standard terms, so acceptance is
 * recorded only with the courier's own written confirmation. This text is
 * guidance for administrators only; the actual approval gates live in the
 * server-side settings functions.
 */
const COURIER_JEWELLERY_NOTICE =
  "Many courier companies restrict or prohibit jewellery under their standard terms. Do not record jewellery acceptance without written confirmation from this courier company that it will carry this store's jewellery. Jewellery acceptance is PENDING OWNER CONFIRMATION for every courier.";
export function CourierSettingsSection({
  courier,
  defaultOpen,
}: {
  courier: AdminCourierSettings;
  defaultOpen: boolean;
}) {
  const fieldId = (field: string) => `${courier.code.toLowerCase()}-${field}`;
  const eligibleCountries =
    courier.eligibleCountries.length > 0
      ? courier.eligibleCountries.join(", ")
      : "None yet";

  return (
    <section
      className={panelClass}
      aria-labelledby={`courier-${courier.code}-heading`}
    >
      <details open={defaultOpen}>
        <summary className="cursor-pointer list-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3
                id={`courier-${courier.code}-heading`}
                className="heading-editorial heading-champagne text-xl"
              >
                {courier.displayName}{" "}
                <span className="text-sm font-normal text-champagne/60">
                  ({COURIER_SCOPE_LABELS[courier.scope]})
                </span>
              </h3>
              <p className="mt-1 text-xs text-champagne/50">
                Code {courier.code} · Account:{" "}
                {COURIER_ACCOUNT_VERIFICATION_LABELS[courier.accountVerification]} ·
                Jewellery:{" "}
                {JEWELLERY_ACCEPTANCE_LABELS[courier.jewelleryAcceptance]} ·
                Checkout-eligible destinations: {eligibleCountries}
                {courier.updatedAt
                  ? ` · Last updated ${formatDate(courier.updatedAt)}${
                      courier.updatedBy ? ` by ${courier.updatedBy}` : ""
                    }`
                  : " · No record yet"}
              </p>
            </div>
            <StatusPill
              status={COURIER_STATUS_LABELS[courier.status]}
              tone={statusTone(courier.status)}
            />
          </div>
        </summary>

        <Notice tone="warning">
          {COURIER_JEWELLERY_NOTICE}
        </Notice>

        <h4 className="mt-6 font-nav text-sm font-semibold uppercase tracking-[0.18em] text-champagne">
          Courier status
        </h4>
        <form
          action={updateCourierStatusAction}
          className="mt-3 grid gap-4 sm:grid-cols-2"
        >
          <input type="hidden" name="code" value={courier.code} />
          <div>
            <label htmlFor={fieldId("status")} className={labelClass}>
              Status
            </label>
            <select
              id={fieldId("status")}
              name="status"
              defaultValue={courier.status}
              className={inputClass}
            >
              {COURIER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {COURIER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-champagne/50">
              Activation is refused until the account is verified, jewellery
              acceptance is recorded, and at least one destination is active,
              verified, and carries an approved charge and estimate.
            </p>
          </div>
          <div>
            <label htmlFor={fieldId("tracking")} className={labelClass}>
              Tracking URL template (optional)
            </label>
            <input
              id={fieldId("tracking")}
              name="trackingUrlTemplate"
              defaultValue={courier.trackingUrlTemplate ?? ""}
              maxLength={500}
              placeholder={`https://www.example.com/track/${TRACKING_PLACEHOLDER}`}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-champagne/50">
              Use the courier company&apos;s complete https:// tracking URL with
              the {TRACKING_PLACEHOLDER} placeholder where the tracking
              reference belongs.
            </p>
          </div>
          <div>
            <label htmlFor={fieldId("terms")} className={labelClass}>
              Courier terms URL (optional)
            </label>
            <input
              id={fieldId("terms")}
              name="termsUrl"
              defaultValue={courier.termsUrl ?? ""}
              maxLength={500}
              placeholder="https://"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={fieldId("contact")} className={labelClass}>
              Contact details (optional)
            </label>
            <input
              id={fieldId("contact")}
              name="contactDetails"
              maxLength={500}
              defaultValue={courier.contactDetails ?? ""}
              placeholder="Phone, email, or branch address"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-champagne/50">
              Optional internal reference for reaching this courier company.
            </p>
          </div>
          <div>
            <label htmlFor={fieldId("notes")} className={labelClass}>
              Internal notes (optional)
            </label>
            <input
              id={fieldId("notes")}
              name="notes"
              maxLength={1000}
              defaultValue={courier.notes ?? ""}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Save courier status</SubmitButton>
          </div>
        </form>

        <h4 className="mt-6 font-nav text-sm font-semibold uppercase tracking-[0.18em] text-champagne">
          Account verification
        </h4>
        <form
          action={updateCourierAccountAction}
          className="mt-3 grid gap-4 sm:grid-cols-2"
        >
          <input type="hidden" name="code" value={courier.code} />
          <div>
            <label htmlFor={fieldId("account")} className={labelClass}>
              Account verification state
            </label>
            <select
              id={fieldId("account")}
              name="accountVerification"
              defaultValue={courier.accountVerification}
              className={inputClass}
            >
              {COURIER_ACCOUNT_VERIFICATIONS.map((state) => (
                <option key={state} value={state}>
                  {COURIER_ACCOUNT_VERIFICATION_LABELS[state]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={fieldId("account-evidence")} className={labelClass}>
              Evidence reference (required to mark verified)
            </label>
            <input
              id={fieldId("account-evidence")}
              name="evidence"
              maxLength={500}
              placeholder="Account number, agreement, or written confirmation"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-champagne/50">
              A verified account cannot be withdrawn while the courier is
              active; suspend the courier first.
            </p>
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Record account verification</SubmitButton>
          </div>
        </form>

        <h4 className="mt-6 font-nav text-sm font-semibold uppercase tracking-[0.18em] text-champagne">
          Jewellery acceptance
        </h4>
        <form
          action={updateCourierJewelleryAction}
          className="mt-3 grid gap-4 sm:grid-cols-2"
        >
          <input type="hidden" name="code" value={courier.code} />
          <div>
            <label htmlFor={fieldId("jewellery")} className={labelClass}>
              Jewellery acceptance state
            </label>
            <select
              id={fieldId("jewellery")}
              name="jewelleryAcceptance"
              defaultValue={courier.jewelleryAcceptance}
              className={inputClass}
            >
              {JEWELLERY_ACCEPTANCE_STATES.map((state) => (
                <option key={state} value={state}>
                  {JEWELLERY_ACCEPTANCE_LABELS[state]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={fieldId("categories")} className={labelClass}>
              Approved jewellery categories (comma separated)
            </label>
            <input
              id={fieldId("categories")}
              name="approvedCategories"
              defaultValue={courier.approvedJewelleryCategories.join(", ")}
              maxLength={2000}
              placeholder="e.g. rings, necklaces, earrings"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-champagne/50">
              An empty list approves nothing. Categories must match the
              catalogue category names. International orders are rejected at
              checkout unless every ordered item&apos;s category is listed.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={fieldId("jewellery-evidence")} className={labelClass}>
              Evidence reference (required to mark accepted)
            </label>
            <input
              id={fieldId("jewellery-evidence")}
              name="evidence"
              maxLength={500}
              placeholder="Written courier confirmation or approval reference"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Record jewellery acceptance</SubmitButton>
          </div>
        </form>

        <h4 className="mt-6 font-nav text-sm font-semibold uppercase tracking-[0.18em] text-champagne">
          Destinations
        </h4>

        {courier.destinations.length > 0 ? (
          <ul className="mt-3 divide-y divide-gold/10 text-sm">
            {courier.destinations.map((destination) => (
              <li
                key={destination.countryCode}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <span className="font-semibold text-white">
                  {destination.countryCode}
                </span>
                <span className="text-xs text-champagne/60">
                  {destination.isActive ? "Active" : "Inactive"} ·{" "}
                  {destination.verified ? "Verified" : "Unverified"} ·{" "}
                  {destination.chargeMinor === null
                    ? "No approved charge"
                    : formatPkr({
                        amountMinor: destination.chargeMinor,
                        currency: "PKR",
                      })}{" "}
                  ·{" "}
                  {destination.estimateMinDays !== null &&
                  destination.estimateMaxDays !== null
                    ? `${destination.estimateMinDays}–${destination.estimateMaxDays} days`
                    : "No approved estimate"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-champagne/70">
            No destinations recorded yet.
          </p>
        )}

        <form
          action={updateCourierDestinationAction}
          className="mt-4 grid gap-4 sm:grid-cols-2"
        >
          <input type="hidden" name="code" value={courier.code} />
          <div>
            <label htmlFor={fieldId("destination-country")} className={labelClass}>
              Country code to add or update
            </label>
            <input
              id={fieldId("destination-country")}
              name="countryCode"
              maxLength={2}
              required
              placeholder={courier.scope === "DOMESTIC_PK" ? "PK" : "GB"}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-champagne/50">
              {courier.scope === "DOMESTIC_PK"
                ? "This courier serves Pakistan only; only PK can be configured for it."
                : "This courier serves destinations outside Pakistan only."}
            </p>
          </div>
          <div>
            <label htmlFor={fieldId("destination-charge")} className={labelClass}>
              Approved charge (PKR, blank = not approved)
            </label>
            <input
              id={fieldId("destination-charge")}
              name="charge"
              placeholder="e.g. 250"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-champagne/50">
              A destination without an approved charge is never offered at
              checkout and is never charged.
            </p>
          </div>
          <div>
            <label htmlFor={fieldId("destination-min")} className={labelClass}>
              Estimate minimum days (blank = not approved)
            </label>
            <input
              id={fieldId("destination-min")}
              name="estimateMinDays"
              type="number"
              min={1}
              max={60}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={fieldId("destination-max")} className={labelClass}>
              Estimate maximum days (blank = not approved)
            </label>
            <input
              id={fieldId("destination-max")}
              name="estimateMaxDays"
              type="number"
              min={1}
              max={60}
              className={inputClass}
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-champagne sm:col-span-2">
            <input
              type="checkbox"
              name="isActive"
              className={checkboxClass}
            />
            Destination is active
          </label>
          <label className="flex items-start gap-2 text-sm text-champagne sm:col-span-2">
            <input
              type="checkbox"
              name="verified"
              className={checkboxClass}
            />
            Destination verified against courier confirmation
          </label>
          <div className="sm:col-span-2">
            <label
              htmlFor={fieldId("destination-evidence")}
              className={labelClass}
            >
              Evidence reference (required to mark verified)
            </label>
            <input
              id={fieldId("destination-evidence")}
              name="evidence"
              maxLength={500}
              placeholder="Rate sheet, service guide, or written confirmation"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={fieldId("destination-notes")} className={labelClass}>
              Internal note (optional)
            </label>
            <input
              id={fieldId("destination-notes")}
              name="notes"
              maxLength={500}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Save destination</SubmitButton>
          </div>
        </form>
      </details>
    </section>
  );
}
