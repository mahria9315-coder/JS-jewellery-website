/**
 * Pure courier selection and gating logic (T026A/T026B, T060).
 *
 * This module decides which courier, if any, may be used for a delivery
 * country. It is the single source of truth shared by checkout, order
 * creation, and the admin shipping page, so a courier can never appear in the
 * storefront unless every approval gate below passes.
 *
 * Safety rules enforced here:
 * - Pakistan orders attach the first fully approved domestic courier (couriers
 *   are owner-created records tried in a deterministic order): the courier must
 *   be ACTIVE with a VERIFIED account, recorded jewellery acceptance, and an
 *   active, verified Pakistan destination with an approved charge. Otherwise
 *   Pakistan orders keep the existing behaviour: no courier is named and no
 *   shipping is charged.
 * - International orders use the first fully approved international courier
 *   for the destination country under the same gates. If no courier is
 *   eligible, the destination is not offered at checkout and order creation
 *   fails.
 * - Charges are applied only from approved, non-null destination values.
 *   A missing charge means "not approved yet", never an invented price.
 * - Estimates are advisory text only and are never a delivery promise.
 * - Jewellery category approval is checked per order item for courier
 *   shipments: an empty approved list approves nothing.
 *
 * Dependency-free so it can be unit-tested directly.
 */

import {
  DOMESTIC_COUNTRY_CODE,
  type CourierAccountVerificationValue,
  type CourierScopeValue,
  type CourierStatusValue,
  type JewelleryAcceptanceValue,
} from "./config";

export type CourierConfigLike = {
  code: string;
  displayName: string;
  scope: CourierScopeValue;
  status: CourierStatusValue;
  accountVerification: CourierAccountVerificationValue;
  jewelleryAcceptance: JewelleryAcceptanceValue;
  approvedJewelleryCategories: readonly string[];
};

export type CourierDestinationLike = {
  courierCode: string;
  countryCode: string;
  isActive: boolean;
  verified: boolean;
  chargeMinor: number | null;
  estimateMinDays: number | null;
  estimateMaxDays: number | null;
};

export type CourierEligibilityReason =
  | "COURIER_NOT_CONFIGURED"
  | "COURIER_NOT_ACTIVE"
  | "ACCOUNT_UNVERIFIED"
  | "JEWELLERY_NOT_ACCEPTED"
  | "DESTINATION_NOT_CONFIGURED"
  | "DESTINATION_INACTIVE"
  | "DESTINATION_UNVERIFIED"
  | "CHARGE_NOT_APPROVED"
  | "ESTIMATE_NOT_APPROVED";

export type CourierResolution =
  | {
      ok: true;
      courier: CourierConfigLike;
      destination: CourierDestinationLike;
    }
  | {
      ok: false;
      reason: CourierEligibilityReason;
      courierCode?: string;
      countryCode: string;
    };

/** Pakistan is domestic; every other destination is international. */
export function scopeForCountry(
  countryCode: string,
): Extract<CourierScopeValue, "DOMESTIC_PK" | "INTERNATIONAL"> {
  return countryCode.trim().toUpperCase() === DOMESTIC_COUNTRY_CODE
    ? "DOMESTIC_PK"
    : "INTERNATIONAL";
}

/**
 * Couriers that may serve a delivery scope, in a deterministic order.
 *
 * The registry is owner-managed, so precedence cannot be a hardcoded provider
 * list: in-scope couriers are tried by company name (then code) so the result
 * is stable and explainable when several couriers are fully approved. The
 * order never widens eligibility: every courier must still pass every gate.
 */
export function couriersForScope(
  couriers: readonly CourierConfigLike[],
  scope: "DOMESTIC_PK" | "INTERNATIONAL",
): CourierConfigLike[] {
  return couriers
    .filter((courier) => courier.scope === scope)
    .slice()
    .sort(
      (a, b) =>
        a.displayName.trim().localeCompare(b.displayName.trim()) ||
        a.code.localeCompare(b.code),
    );
}

/** All approval gates for one courier + destination pair. */
export function checkCourierDestinationEligibility(
  courier: CourierConfigLike | undefined,
  destination: CourierDestinationLike | undefined,
): { ok: boolean; reason?: CourierEligibilityReason } {
  if (!courier) {
    return { ok: false, reason: "COURIER_NOT_CONFIGURED" };
  }

  if (courier.status !== "ACTIVE") {
    return { ok: false, reason: "COURIER_NOT_ACTIVE" };
  }

  if (courier.accountVerification !== "VERIFIED") {
    return { ok: false, reason: "ACCOUNT_UNVERIFIED" };
  }

  if (courier.jewelleryAcceptance !== "ACCEPTED") {
    return { ok: false, reason: "JEWELLERY_NOT_ACCEPTED" };
  }

  if (!destination) {
    return { ok: false, reason: "DESTINATION_NOT_CONFIGURED" };
  }

  if (!destination.isActive) {
    return { ok: false, reason: "DESTINATION_INACTIVE" };
  }

  if (!destination.verified) {
    return { ok: false, reason: "DESTINATION_UNVERIFIED" };
  }

  // No approved charge means the destination must not be offered or charged.
  // Charges only ever come from explicit, owner-entered approved values.
  if (
    destination.chargeMinor === null ||
    destination.chargeMinor === undefined ||
    destination.chargeMinor < 0
  ) {
    return { ok: false, reason: "CHARGE_NOT_APPROVED" };
  }

  // Without approved estimate days there would be nothing truthful to show, so
  // the destination must stay off the storefront rather than inherit the
  // domestic estimate. Estimates remain advisory text, never a promise.
  if (!validEstimate(destination.estimateMinDays, destination.estimateMaxDays)) {
    return { ok: false, reason: "ESTIMATE_NOT_APPROVED" };
  }

  return { ok: true };
}

/**
 * Resolve the courier that may ship to a country.
 *
 * Every courier record in the country's scope is tried in the deterministic
 * order from couriersForScope, and every courier must pass every gate. If no
 * courier is eligible, the first configured courier's failure reason is
 * returned for diagnostics, so an unapproved courier never widens delivery and
 * an empty registry reports COURIER_NOT_CONFIGURED.
 */
export function resolveCourierForCountry(input: {
  countryCode: string;
  couriers: readonly CourierConfigLike[];
  destinations: readonly CourierDestinationLike[];
}): CourierResolution {
  const countryCode = input.countryCode.trim().toUpperCase();
  const scope = scopeForCountry(countryCode);
  const candidates = couriersForScope(input.couriers, scope);

  let primaryReason: CourierEligibilityReason | null = null;
  let primaryCourierCode: string | undefined;

  for (const courier of candidates) {
    const destination = input.destinations.find(
      (row) =>
        row.courierCode === courier.code &&
        row.countryCode.trim().toUpperCase() === countryCode,
    );

    const check = checkCourierDestinationEligibility(courier, destination);

    if (check.ok) {
      return { ok: true, courier, destination: destination! };
    }

    // Prefer the first configured courier's failure, so the reported reason
    // explains a real gate that failed rather than an empty registry.
    if (primaryReason === null) {
      primaryReason = check.reason!;
      primaryCourierCode = courier.code;
    }
  }

  return {
    ok: false,
    reason: primaryReason ?? "COURIER_NOT_CONFIGURED",
    courierCode: primaryCourierCode,
    countryCode,
  };
}

/**
 * Are the ordered jewellery categories approved for this courier?
 *
 * An empty approved list approves nothing, and an empty submitted category
 * list fails closed for international shipments.
 */
export function areJewelleryCategoriesApproved(
  courier: CourierConfigLike,
  itemCategories: readonly string[],
): boolean {
  const approved = new Set(
    courier.approvedJewelleryCategories
      .map((category) => category.trim().toLowerCase())
      .filter((category) => category !== ""),
  );

  if (approved.size === 0 || itemCategories.length === 0) {
    return false;
  }

  return itemCategories.every((category) => {
    const clean = category.trim().toLowerCase();
    return clean !== "" && approved.has(clean);
  });
}

/**
 * The delivery countries checkout may offer.
 *
 * Pakistan is always offered first so existing domestic behaviour is
 * preserved even before any courier is configured. International countries
 * appear only through a fully approved international courier destination.
 */
export function resolveDeliveryCountries(input: {
  couriers: readonly CourierConfigLike[];
  destinations: readonly CourierDestinationLike[];
}): string[] {
  const countries = [DOMESTIC_COUNTRY_CODE];

  const international = input.destinations.filter((destination) => {
    const courier = input.couriers.find(
      (row) => row.code === destination.courierCode,
    );

    return (
      scopeForCountry(destination.countryCode) === "INTERNATIONAL" &&
      checkCourierDestinationEligibility(courier, destination).ok
    );
  });

  const seen = new Set<string>(countries);

  for (const destination of international) {
    const code = destination.countryCode.trim().toUpperCase();

    if (!seen.has(code)) {
      seen.add(code);
      countries.push(code);
    }
  }

  return countries;
}

/** True only when the destination carries usable estimate days. */
function validEstimate(
  min: number | null | undefined,
  max: number | null | undefined,
): boolean {
  return (
    typeof min === "number" &&
    typeof max === "number" &&
    Number.isInteger(min) &&
    Number.isInteger(max) &&
    min >= 1 &&
    max <= 60 &&
    min <= max
  );
}

/**
 * Shipping charge and estimate text for a resolved courier destination.
 *
 * The charge is the approved destination value only. The estimate is advisory
 * display text; when the destination has no usable estimates the caller falls
 * back to the store-level estimate. Estimates are never delivery promises.
 */
export function resolveCourierShipping(
  resolution: CourierResolution,
): {
  shippingMinor: number;
  estimateDisplay: string | null;
} {
  if (!resolution.ok) {
    return { shippingMinor: 0, estimateDisplay: null };
  }

  const { destination } = resolution;
  const estimateDisplay = validEstimate(
    destination.estimateMinDays,
    destination.estimateMaxDays,
  )
    ? `${destination.estimateMinDays}–${destination.estimateMaxDays} days`
    : null;

  return {
    shippingMinor: destination.chargeMinor ?? 0,
    estimateDisplay,
  };
}

export type OrderCourierDecisionReason =
  | CourierEligibilityReason
  | "JEWELLERY_CATEGORY_NOT_APPROVED";

export type OrderCourierDecision =
  | {
      ok: true;
      scope: "DOMESTIC_PK" | "INTERNATIONAL";
      /** The approved courier, or null when no courier may be attached. */
      courier: CourierConfigLike | null;
      shippingMinor: number;
      estimateDisplay: string | null;
    }
  | {
      ok: false;
      reason: OrderCourierDecisionReason;
      courierCode?: string;
      countryCode: string;
    };

/**
 * The courier shipment decision for one order (T026A/T026B, T060).
 *
 * This is the single composition used by order creation:
 * - Domestic (Pakistan) never rejects. It keeps the pre-courier behaviour
 *   (no courier recorded, no shipping charge, store-level estimate) unless
 *   the first fully approved domestic courier passes every gate AND every
 *   ordered jewellery category is approved for that courier. So an unapproved
 *   or partially approved courier can never change existing Pakistan ordering.
 * - International fails closed. It is deliverable only through a fully
 *   approved international courier destination whose approved jewellery
 *   categories cover every ordered item; otherwise the order must not be
 *   created.
 *
 * Charges only ever come from the approved destination value, and estimates
 * are advisory text that is never inherited from the store-level estimate.
 */
export function resolveOrderCourierDecision(input: {
  countryCode: string;
  itemCategories: readonly string[];
  couriers: readonly CourierConfigLike[];
  destinations: readonly CourierDestinationLike[];
}): OrderCourierDecision {
  const countryCode = input.countryCode.trim().toUpperCase();
  const scope = scopeForCountry(countryCode);
  const resolution = resolveCourierForCountry(input);

  if (scope === "DOMESTIC_PK") {
    const approved =
      resolution.ok &&
      areJewelleryCategoriesApproved(resolution.courier, input.itemCategories)
        ? resolution
        : null;

    const shipping = approved
      ? resolveCourierShipping(approved)
      : { shippingMinor: 0, estimateDisplay: null as string | null };

    return {
      ok: true,
      scope,
      courier: approved ? approved.courier : null,
      shippingMinor: shipping.shippingMinor,
      estimateDisplay: shipping.estimateDisplay,
    };
  }

  if (!resolution.ok) {
    return {
      ok: false,
      reason: resolution.reason,
      courierCode: resolution.courierCode,
      countryCode,
    };
  }

  if (!areJewelleryCategoriesApproved(resolution.courier, input.itemCategories)) {
    return {
      ok: false,
      reason: "JEWELLERY_CATEGORY_NOT_APPROVED",
      courierCode: resolution.courier.code,
      countryCode,
    };
  }

  const shipping = resolveCourierShipping(resolution);

  return {
    ok: true,
    scope,
    courier: resolution.courier,
    shippingMinor: shipping.shippingMinor,
    estimateDisplay: shipping.estimateDisplay,
  };
}
