/**
 * Generic courier registry constants and validation (T026A/T026B, T060).
 *
 * The store does not hardcode any courier company. Courier records exist only
 * after an authorised administrator creates them, so an empty registry is the
 * honest default on a fresh database and never means "approved".
 *
 * No courier is trusted by default: every record starts NOT_CONFIGURED with an
 * UNVERIFIED account and NOT_ACCEPTED jewellery, because many courier companies
 * restrict or prohibit jewellery under their standard terms. Each state changes
 * only when an authorised administrator records evidence, and no courier
 * company name, rate, tracking format, or approval is ever assumed or invented
 * here.
 *
 * Dependency-free so it can be unit-tested directly.
 */

/** Pakistan is the domestic scope; every other destination is international. */
export const DOMESTIC_COUNTRY_CODE = "PK";

export const COURIER_STATUS_LABELS = {
  NOT_CONFIGURED: "Not configured",
  PENDING_VERIFICATION: "Pending verification",
  APPROVED: "Approved",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
} as const;

export type CourierStatusValue = keyof typeof COURIER_STATUS_LABELS;

export const COURIER_STATUSES = Object.keys(
  COURIER_STATUS_LABELS,
) as CourierStatusValue[];

export function isCourierStatus(value: string): value is CourierStatusValue {
  return (COURIER_STATUSES as readonly string[]).includes(value);
}

export const COURIER_ACCOUNT_VERIFICATION_LABELS = {
  UNVERIFIED: "Unverified",
  PENDING: "Pending",
  VERIFIED: "Verified",
} as const;

export type CourierAccountVerificationValue =
  keyof typeof COURIER_ACCOUNT_VERIFICATION_LABELS;

export const COURIER_ACCOUNT_VERIFICATIONS = Object.keys(
  COURIER_ACCOUNT_VERIFICATION_LABELS,
) as CourierAccountVerificationValue[];

export function isCourierAccountVerification(
  value: string,
): value is CourierAccountVerificationValue {
  return (
    COURIER_ACCOUNT_VERIFICATIONS as readonly string[]
  ).includes(value);
}

export const JEWELLERY_ACCEPTANCE_LABELS = {
  NOT_ACCEPTED: "Not accepted",
  PENDING_CONFIRMATION: "Pending confirmation",
  ACCEPTED: "Accepted",
} as const;

export type JewelleryAcceptanceValue = keyof typeof JEWELLERY_ACCEPTANCE_LABELS;

export const JEWELLERY_ACCEPTANCE_STATES = Object.keys(
  JEWELLERY_ACCEPTANCE_LABELS,
) as JewelleryAcceptanceValue[];

export function isJewelleryAcceptance(
  value: string,
): value is JewelleryAcceptanceValue {
  return (JEWELLERY_ACCEPTANCE_STATES as readonly string[]).includes(value);
}

export const COURIER_SCOPE_LABELS = {
  DOMESTIC_PK: "Pakistan domestic",
  INTERNATIONAL: "International",
} as const;

export type CourierScopeValue = keyof typeof COURIER_SCOPE_LABELS;

export function isCourierScope(value: string): value is CourierScopeValue {
  return (Object.keys(COURIER_SCOPE_LABELS) as string[]).includes(value);
}

export const TRACKING_PLACEHOLDER = "{trackingNumber}";

/**
 * Derive a stable courier code from an administrator-entered company name.
 *
 * The code identifies the courier on orders, destinations, and audit records,
 * so it is deterministic (the same name yields the same base code) and is made
 * unique with a numeric suffix when the base code is already taken. Codes are
 * derived from the owner-entered name only; no provider list exists.
 */
export function deriveCourierCode(
  displayName: string,
  takenCodes: readonly string[],
): string {
  const base =
    displayName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 36) || "COURIER";

  const taken = new Set(
    takenCodes.map((code) => code.trim().toUpperCase()).filter(Boolean),
  );

  if (!taken.has(base)) {
    return base;
  }

  let suffix = 2;

  while (taken.has(`${base}_${suffix}`)) {
    suffix += 1;
  }

  return `${base}_${suffix}`;
}

/**
 * Build a public tracking URL from a courier template.
 *
 * The template must be a complete https:// URL containing the
 * {trackingNumber} placeholder. Returns null when either part is missing so a
 * broken template can never produce a misleading link.
 */
export function buildTrackingUrl(
  template: string | null | undefined,
  trackingNumber: string | null | undefined,
): string | null {
  const cleanTemplate = template?.trim() ?? "";
  const cleanNumber = trackingNumber?.trim() ?? "";

  if (!cleanTemplate || !cleanNumber) {
    return null;
  }

  if (!/^https:\/\/[A-Za-z0-9.-]+/.test(cleanTemplate)) {
    return null;
  }

  if (!cleanTemplate.includes(TRACKING_PLACEHOLDER)) {
    return null;
  }

  return cleanTemplate.replaceAll(TRACKING_PLACEHOLDER, cleanNumber);
}

/**
 * Validate a courier tracking reference before it is stored on an order.
 *
 * Tracking-reference formats differ per courier company and are rarely
 * published, so no specific format is assumed or invented. Only generic
 * guardrails are enforced: 4-40 characters of letters, digits, spaces, and
 * dashes, exactly as printed on the consignment or booking receipt.
 */
export function validateTrackingReference(
  courierName: string,
  raw: string,
): { ok: true; value: string } | { ok: false; error: string } {
  const value = raw.trim().replace(/\s+/g, " ");

  if (!/^[A-Za-z0-9- ]{4,40}$/.test(value)) {
    return {
      ok: false,
      error: `Use the ${courierName || "courier"} tracking reference exactly as printed on the consignment or booking receipt (4-40 characters).`,
    };
  }

  return { ok: true, value };
}

/**
 * Validate an admin-entered tracking URL template. The template must be a
 * complete https:// address containing the {trackingNumber} placeholder.
 */
export function validateTrackingUrlTemplate(
  raw: string,
): { ok: true; value: string | null } | { ok: false; error: string } {
  const value = raw.trim();

  if (value === "") {
    return { ok: true, value: null };
  }

  if (!/^https:\/\/[A-Za-z0-9.-]+(?:\/|$)/.test(value)) {
    return {
      ok: false,
      error: "Use a complete https:// tracking URL.",
    };
  }

  if (!value.includes(TRACKING_PLACEHOLDER)) {
    return {
      ok: false,
      error: `Include the ${TRACKING_PLACEHOLDER} placeholder where the tracking number belongs.`,
    };
  }

  if (value.replaceAll(TRACKING_PLACEHOLDER, "").includes("{")) {
    return {
      ok: false,
      error: `Use only the ${TRACKING_PLACEHOLDER} placeholder in the tracking URL.`,
    };
  }

  return { ok: true, value };
}
