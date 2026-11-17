import {
  BUSINESS_EMAIL,
  BUSINESS_LEGAL_NAME,
  BUSINESS_LOCATION,
  DELIVERY_ESTIMATE_DAYS_MAX,
  DELIVERY_ESTIMATE_DAYS_MIN,
  SITE_NAME,
  WHATSAPP_NUMBER_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/site";

/**
 * Pure resolvers for public storefront settings.
 *
 * Database values are used when an administrator has saved a valid value;
 * otherwise the owner-confirmed values in `lib/site.ts` remain the fallback.
 * Keeping the fallback logic pure makes it testable without a database.
 */

export type BusinessContact = {
  storeName: string;
  legalName: string;
  location: string;
  email: string;
  emailUrl: string;
  phoneDisplay: string;
  whatsappDisplay: string;
  whatsappUrl: string;
  openingHours: string;
};

export type PublicDeliveryEstimate = {
  minDays: number;
  maxDays: number;
  display: string;
  note: string;
  chargeMinor: number;
  currency: string;
  internationalEnabled: boolean;
};

export const DEFAULT_BUSINESS_CONTACT: BusinessContact = {
  storeName: SITE_NAME,
  legalName: BUSINESS_LEGAL_NAME,
  location: BUSINESS_LOCATION,
  email: BUSINESS_EMAIL,
  emailUrl: `mailto:${BUSINESS_EMAIL}`,
  phoneDisplay: WHATSAPP_NUMBER_DISPLAY,
  whatsappDisplay: WHATSAPP_NUMBER_DISPLAY,
  whatsappUrl: WHATSAPP_URL,
  openingHours: "",
};

export const DEFAULT_DELIVERY_ESTIMATE: PublicDeliveryEstimate = {
  minDays: DELIVERY_ESTIMATE_DAYS_MIN,
  maxDays: DELIVERY_ESTIMATE_DAYS_MAX,
  display: `${DELIVERY_ESTIMATE_DAYS_MIN}–${DELIVERY_ESTIMATE_DAYS_MAX} days`,
  note: "Delivery timing is an estimate, not a guarantee.",
  chargeMinor: 0,
  currency: "PKR",
  internationalEnabled: false,
};

function clean(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

/** Convert an owner-entered phone number into a wa.me-compatible number. */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");

  if (digits === "") {
    return "";
  }

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }

  if (digits.startsWith("0")) {
    return `92${digits.slice(1)}`;
  }

  return digits;
}

export function buildWhatsAppUrl(raw: string): string {
  const number = normalizeWhatsAppNumber(raw);

  if (!number) {
    return WHATSAPP_URL;
  }

  return `https://wa.me/${number}`;
}

export function resolveBusinessContact(
  settings: Partial<Record<string, string>>,
): BusinessContact {
  const storeName = clean(settings["store.name"]) || SITE_NAME;
  const legalName = BUSINESS_LEGAL_NAME;
  const location = clean(settings["store.address"]) || BUSINESS_LOCATION;
  const email = clean(settings["store.contactEmail"]) || BUSINESS_EMAIL;
  const phoneDisplay =
    clean(settings["store.contactPhone"]) || WHATSAPP_NUMBER_DISPLAY;
  const whatsappDisplay =
    clean(settings["store.whatsappNumber"]) || WHATSAPP_NUMBER_DISPLAY;
  const whatsappUrl = buildWhatsAppUrl(whatsappDisplay);

  return {
    storeName,
    legalName,
    location,
    email,
    emailUrl: `mailto:${email}`,
    phoneDisplay,
    whatsappDisplay,
    whatsappUrl,
    openingHours: clean(settings["store.openingHours"]),
  };
}

function validDays(min: number | null | undefined, max: number | null | undefined) {
  return (
    typeof min === "number" &&
    typeof max === "number" &&
    Number.isInteger(min) &&
    Number.isInteger(max) &&
    min >= 1 &&
    max <= 30 &&
    min <= max
  );
}

export function resolveDeliveryEstimate(
  setting: {
    estimateMinDays?: number | null;
    estimateMaxDays?: number | null;
    deliveryNote?: string | null;
    internationalEnabled?: boolean | null;
  } | null,
  zone: {
    estimateMinDays?: number | null;
    estimateMaxDays?: number | null;
    chargeMinor?: number | null;
    isActive?: boolean | null;
  } | null,
): PublicDeliveryEstimate {
  const zoneUsable =
    zone?.isActive === true &&
    validDays(zone?.estimateMinDays, zone?.estimateMaxDays);
  const settingUsable = validDays(
    setting?.estimateMinDays,
    setting?.estimateMaxDays,
  );

  const minDays = zoneUsable
    ? Number(zone?.estimateMinDays)
    : settingUsable
      ? Number(setting?.estimateMinDays)
      : DEFAULT_DELIVERY_ESTIMATE.minDays;
  const maxDays = zoneUsable
    ? Number(zone?.estimateMaxDays)
    : settingUsable
      ? Number(setting?.estimateMaxDays)
      : DEFAULT_DELIVERY_ESTIMATE.maxDays;

  return {
    minDays,
    maxDays,
    display: `${minDays}–${maxDays} days`,
    note: clean(setting?.deliveryNote) || DEFAULT_DELIVERY_ESTIMATE.note,
    chargeMinor:
      zoneUsable &&
      typeof zone?.chargeMinor === "number" &&
      zone.chargeMinor >= 0
        ? zone.chargeMinor
        : 0,
    currency: DEFAULT_DELIVERY_ESTIMATE.currency,
    internationalEnabled: Boolean(setting?.internationalEnabled),
  };
}
