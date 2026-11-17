import { getDb } from "@/lib/db";
import {
  getPaymentConfigurationStatus,
  type PaymentMethodId,
} from "@/lib/payments/config";
import {
  deriveCourierCode,
  isCourierAccountVerification,
  isCourierScope,
  isCourierStatus,
  isJewelleryAcceptance,
  validateTrackingUrlTemplate,
} from "@/lib/couriers/config";
import {
  checkCourierDestinationEligibility,
  scopeForCountry,
  type CourierConfigLike,
  type CourierDestinationLike,
} from "@/lib/couriers/selection";

import { recordAdminAudit } from "./audit";

/**
 * Business, payment-method, and shipping settings.
 *
 * Payment account numbers and account-holder names are never stored here and
 * cannot be edited in the CMS. Only the public label, public instructions, and
 * the enabled flag are stored. Enabling a method requires its server-only
 * credentials to be configured first.
 */

export class SettingsError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "SettingsError";
    this.field = field;
  }
}

export const BUSINESS_SETTING_KEYS = {
  "store.name": { group: "business", label: "Store name", max: 120 },
  "store.currency": { group: "business", label: "Currency code", max: 8 },
  "store.countryCode": { group: "business", label: "Country code", max: 2 },
  "store.contactEmail": { group: "business", label: "Contact email", max: 254 },
  "store.contactPhone": { group: "business", label: "Contact phone", max: 40 },
  "store.whatsappNumber": { group: "business", label: "WhatsApp number", max: 40 },
  "store.address": { group: "business", label: "Business address", max: 500 },
  "store.openingHours": { group: "business", label: "Opening hours", max: 300 },
  "returns.windowDays": { group: "returns", label: "Return window (days)", max: 3 },
  "returns.changeOfMindDeductionPercent": {
    group: "returns",
    label: "Change-of-mind deduction (%)",
    max: 2,
  },
  "returns.returnAddress": { group: "returns", label: "Return address", max: 500 },
  "returns.legalReviewStatus": {
    group: "returns",
    label: "Legal review status",
    max: 60,
  },
  "homepage.heroEyebrow": {
    group: "homepage",
    label: "Hero eyebrow",
    max: 120,
  },
  "homepage.heroHeading": {
    group: "homepage",
    label: "Hero heading",
    max: 200,
  },
  "homepage.heroDescription": {
    group: "homepage",
    label: "Hero description",
    max: 1000,
  },
  "homepage.heroImageSrc": {
    group: "homepage",
    label: "Hero image path",
    max: 300,
  },
  "homepage.heroImageAlt": {
    group: "homepage",
    label: "Hero image alternative text",
    max: 250,
  },
  "homepage.heroPrimaryLabel": {
    group: "homepage",
    label: "Primary button label",
    max: 80,
  },
  "homepage.heroPrimaryHref": {
    group: "homepage",
    label: "Primary button destination",
    max: 500,
  },
  "homepage.heroSecondaryLabel": {
    group: "homepage",
    label: "Secondary button label",
    max: 80,
  },
  "homepage.heroSecondaryHref": {
    group: "homepage",
    label: "Secondary button destination",
    max: 500,
  },
  "notifications.recipientEmail": {
    group: "notifications",
    label: "Notification email",
    max: 254,
  },
  "notifications.newOrder": {
    group: "notifications",
    label: "New order",
    max: 5,
  },
  "notifications.paymentSubmitted": {
    group: "notifications",
    label: "Payment submitted",
    max: 5,
  },
  "notifications.returnRequested": {
    group: "notifications",
    label: "Return requested",
    max: 5,
  },
  "notifications.lowStock": {
    group: "notifications",
    label: "Low stock",
    max: 5,
  },
} as const;

export type BusinessSettingKey = keyof typeof BUSINESS_SETTING_KEYS;

export function isBusinessSettingKey(value: string): value is BusinessSettingKey {
  return value in BUSINESS_SETTING_KEYS;
}

export async function getBusinessSettings(): Promise<
  Record<BusinessSettingKey, string>
> {
  const rows = await getDb().businessSetting.findMany({
    where: { key: { in: Object.keys(BUSINESS_SETTING_KEYS) } },
    select: { key: true, value: true },
  });
  const map = new Map(rows.map((row) => [row.key, row.value]));

  return Object.fromEntries(
    Object.keys(BUSINESS_SETTING_KEYS).map((key) => [key, map.get(key) ?? ""]),
  ) as Record<BusinessSettingKey, string>;
}

export function validateSettingValue(
  key: BusinessSettingKey,
  raw: string,
): string {
  const definition = BUSINESS_SETTING_KEYS[key];
  const value = raw.trim();

  if (value.length > definition.max) {
    throw new SettingsError(key, `${definition.label} is too long.`);
  }

  if (key === "store.currency" && !/^[A-Z]{3}$/.test(value)) {
    throw new SettingsError(key, "Use a three-letter currency code such as PKR.");
  }

  if (key === "store.countryCode" && !/^[A-Z]{2}$/.test(value)) {
    throw new SettingsError(key, "Use a two-letter country code such as PK.");
  }

  if (key === "store.contactEmail" && value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new SettingsError(key, "Enter a valid email address.");
    }
  }

  if (key === "returns.windowDays" && (!/^\d+$/.test(value) || Number(value) > 30)) {
    throw new SettingsError(key, "Enter a whole number of days (0-30).");
  }

  if (
    key === "returns.changeOfMindDeductionPercent" &&
    (!/^\d+$/.test(value) || Number(value) > 100)
  ) {
    throw new SettingsError(key, "Enter a whole percentage (0-100).");
  }

  if (key === "homepage.heroImageSrc" && value) {
    if (
      !/^\/[A-Za-z0-9._\-/]+\.(avif|jpe?g|png|webp)$/i.test(value) ||
      value.startsWith("//") ||
      value.includes("..")
    ) {
      throw new SettingsError(
        key,
        "Use a local image path ending in .avif, .jpg, .jpeg, .png, or .webp.",
      );
    }
  }

  if (key.endsWith("Href") && value) {
    const isSitePath = value.startsWith("/") && !value.startsWith("//");
    const isHttps = /^https:\/\/[A-Za-z0-9.-]+(?:\/|$)/.test(value);

    if (!isSitePath && !isHttps) {
      throw new SettingsError(
        key,
        "Use a site path starting with / or a complete https:// address.",
      );
    }
  }

  if (key === "notifications.recipientEmail" && value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new SettingsError(key, "Enter a valid notification email address.");
    }
  }

  if (
    key.startsWith("notifications.") &&
    key !== "notifications.recipientEmail" &&
    value !== "true" &&
    value !== "false"
  ) {
    throw new SettingsError(key, "Choose whether this notification is enabled.");
  }

  return value;
}

export async function updateBusinessSettings(
  entries: Array<{ key: string; value: string }>,
  actor: string,
) {
  const valid = entries.filter(
    (entry) =>
      entry.key.startsWith("store.") ||
      entry.key.startsWith("returns.") ||
      entry.key.startsWith("homepage.") ||
      entry.key.startsWith("notifications."),
  );

  if (valid.length === 0) {
    throw new SettingsError("settings", "No settings were submitted.");
  }

  const cleaned: Array<{ key: BusinessSettingKey; value: string }> = [];

  for (const entry of valid) {
    if (!isBusinessSettingKey(entry.key)) {
      continue;
    }

    cleaned.push({
      key: entry.key,
      value: validateSettingValue(entry.key, entry.value),
    });
  }

  if (cleaned.length === 0) {
    throw new SettingsError("settings", "No valid settings were submitted.");
  }

  const db = getDb();

  await db.$transaction(
    cleaned.map((entry) =>
      db.businessSetting.upsert({
        where: { key: entry.key },
        update: { value: entry.value, updatedBy: actor },
        create: {
          key: entry.key,
          value: entry.value,
          group: BUSINESS_SETTING_KEYS[entry.key].group,
          updatedBy: actor,
        },
      }),
    ),
  );

  await recordAdminAudit({
    actor,
    action: "settings.business.update",
    entityType: "BusinessSetting",
    entityId: "business",
    summary: "Updated business or returns settings.",
    metadata: { keys: cleaned.map((entry) => entry.key) },
  });
}

export type AdminPaymentSetting = {
  method: PaymentMethodId;
  enabled: boolean;
  displayLabel: string;
  publicInstructions: string | null;
  configured: boolean;
  missingEnvKeys: string[];
  accountHolderConfigured: boolean;
  updatedAt: Date | null;
};

export async function getPaymentSettingsForAdmin(): Promise<
  AdminPaymentSetting[]
> {
  const [rows, status] = await Promise.all([
    getDb().paymentSetting.findMany(),
    Promise.resolve(getPaymentConfigurationStatus()),
  ]);
  const byMethod = new Map(rows.map((row) => [row.method, row]));

  const bank = byMethod.get("BANK_TRANSFER");
  const easypaisa = byMethod.get("EASYPAISA");

  return [
    {
      method: "bank-transfer",
      enabled: bank?.enabled ?? false,
      displayLabel: bank?.displayLabel ?? "Bank Transfer (Islamic Bank)",
      publicInstructions: bank?.publicInstructions ?? null,
      configured: status.bankTransfer.configured,
      missingEnvKeys: status.bankTransfer.missingEnvKeys,
      accountHolderConfigured: status.bankTransfer.accountHolderConfigured,
      updatedAt: bank?.updatedAt ?? null,
    },
    {
      method: "easypaisa",
      enabled: easypaisa?.enabled ?? false,
      displayLabel: easypaisa?.displayLabel ?? "Easypaisa",
      publicInstructions: easypaisa?.publicInstructions ?? null,
      configured: status.easypaisa.configured,
      missingEnvKeys: status.easypaisa.missingEnvKeys,
      accountHolderConfigured: status.easypaisa.accountHolderConfigured,
      updatedAt: easypaisa?.updatedAt ?? null,
    },
  ];
}

export async function updatePaymentSetting(
  input: {
    method: string;
    enabled: boolean;
    displayLabel: string;
    publicInstructions: string;
  },
  actor: string,
) {
  if (input.method !== "BANK_TRANSFER" && input.method !== "EASYPAISA") {
    throw new SettingsError("method", "Choose an approved payment method.");
  }

  const label = input.displayLabel.trim();
  const instructions = input.publicInstructions.trim();

  if (label.length < 2 || label.length > 80) {
    throw new SettingsError("displayLabel", "Use a label of 2-80 characters.");
  }

  if (instructions.length > 1000) {
    throw new SettingsError(
      "publicInstructions",
      "Use 1000 characters or fewer for public instructions.",
    );
  }

  if (
    /account\s*(number|no)|iban|\b\d{10,}\b/i.test(instructions) &&
    instructions.length > 0
  ) {
    throw new SettingsError(
      "publicInstructions",
      "Do not put bank, IBAN, or wallet account numbers in a CMS field. Account details come from server-only environment variables.",
    );
  }

  if (input.enabled) {
    const status = getPaymentConfigurationStatus();
    const configured =
      input.method === "BANK_TRANSFER"
        ? status.bankTransfer.configured
        : status.easypaisa.configured;

    if (!configured) {
      throw new SettingsError(
        "enabled",
        "This method cannot be enabled until its server-only account details are configured.",
      );
    }
  }

  await getDb().paymentSetting.upsert({
    where: { method: input.method },
    update: {
      enabled: input.enabled,
      displayLabel: label,
      publicInstructions: instructions || null,
      updatedBy: actor,
    },
    create: {
      method: input.method,
      enabled: input.enabled,
      displayLabel: label,
      publicInstructions: instructions || null,
      updatedBy: actor,
    },
  });

  await recordAdminAudit({
    actor,
    action: "settings.payment.update",
    entityType: "PaymentSetting",
    entityId: input.method,
    summary: input.enabled
      ? "Enabled a manually verified payment method."
      : "Updated or disabled a payment method.",
    metadata: { method: input.method, enabled: input.enabled },
  });
}

export async function getShippingSettings() {
  const db = getDb();
  const [setting, zones] = await Promise.all([
    db.shippingSetting.findUnique({ where: { id: "default" } }),
    db.shippingZone.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return { setting, zones };
}

function parseDays(raw: string, field: string): number {
  const value = raw.trim();

  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 30) {
    throw new SettingsError(field, "Enter a whole number of days (1-30).");
  }

  return Number(value);
}

function parseMoneyMinor(raw: string, field: string): number {
  const cleaned = raw.trim().replace(/,/g, "");

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new SettingsError(field, "Enter an amount such as 0 or 250.");
  }

  return Math.round(Number(cleaned) * 100);
}

export async function updateShippingSetting(
  input: {
    estimateMinDays: string;
    estimateMaxDays: string;
    deliveryNote: string;
  },
  actor: string,
) {
  const min = parseDays(input.estimateMinDays, "estimateMinDays");
  const max = parseDays(input.estimateMaxDays, "estimateMaxDays");

  if (min > max) {
    throw new SettingsError(
      "estimateMaxDays",
      "The maximum delivery estimate cannot be shorter than the minimum.",
    );
  }

  const note = input.deliveryNote.trim();

  if (note.length < 5 || note.length > 500) {
    throw new SettingsError("deliveryNote", "Use 5-500 characters.");
  }

  await getDb().shippingSetting.upsert({
    where: { id: "default" },
    update: {
      estimateMinDays: min,
      estimateMaxDays: max,
      deliveryNote: note,
      internationalEnabled: false,
      updatedBy: actor,
    },
    create: {
      id: "default",
      estimateMinDays: min,
      estimateMaxDays: max,
      deliveryNote: note,
      internationalEnabled: false,
      updatedBy: actor,
    },
  });

  await recordAdminAudit({
    actor,
    action: "settings.shipping.update",
    entityType: "ShippingSetting",
    entityId: "default",
    summary: "Updated the Pakistan delivery estimate.",
  });
}

export async function updatePakistanShippingZone(
  input: {
    countryCode: string;
    charge: string;
    estimateMinDays: string;
    estimateMaxDays: string;
    notes: string;
    isActive: boolean;
  },
  actor: string,
) {
  if (input.countryCode.trim().toUpperCase() !== "PK") {
    throw new SettingsError(
      "countryCode",
      "Only Pakistan delivery is approved. International destinations are not configured.",
    );
  }

  const min = parseDays(input.estimateMinDays, "estimateMinDays");
  const max = parseDays(input.estimateMaxDays, "estimateMaxDays");

  if (min > max) {
    throw new SettingsError(
      "estimateMaxDays",
      "The maximum estimate cannot be shorter than the minimum.",
    );
  }

  const chargeMinor = parseMoneyMinor(input.charge, "charge");
  const notes = input.notes.trim().slice(0, 500);

  await getDb().shippingZone.upsert({
    where: { countryCode: "PK" },
    update: {
      chargeMinor,
      estimateMinDays: min,
      estimateMaxDays: max,
      notes,
      isActive: input.isActive,
    },
    create: {
      countryCode: "PK",
      name: "Pakistan",
      chargeMinor,
      estimateMinDays: min,
      estimateMaxDays: max,
      notes,
      isActive: input.isActive,
      sortOrder: 0,
    },
  });

  await recordAdminAudit({
    actor,
    action: "settings.shipping.zone",
    entityType: "ShippingZone",
    entityId: "PK",
    summary: "Updated the Pakistan delivery zone.",
    metadata: { active: input.isActive, chargeMinor },
  });
}

/* ----------------------------------------------------------------- couriers */

export type AdminCourierSettings = CourierConfigLike & {
  accountVerifiedAt: Date | null;
  jewelleryAcceptedAt: Date | null;
  trackingUrlTemplate: string | null;
  termsUrl: string | null;
  contactDetails: string | null;
  notes: string | null;
  updatedBy: string | null;
  updatedAt: Date | null;
  destinations: Array<
    CourierDestinationLike & {
      notes: string | null;
      updatedAt: Date | null;
    }
  >;
  eligibleCountries: string[];
};

/**
 * Courier configuration for the admin shipping page.
 *
 * Rows are only created by an authorised administrator through createCourier,
 * so an empty result is expected on a fresh database and never means
 * "approved".
 */
export async function getCourierSettingsForAdmin(): Promise<
  AdminCourierSettings[]
> {
  const db = getDb();
  const rows = await db.courier.findMany({
    orderBy: { code: "asc" },
    include: {
      destinations: { orderBy: { countryCode: "asc" } },
    },
  });

  return rows.map((row) => {
    const courier: CourierConfigLike = {
      code: row.code,
      displayName: row.displayName,
      scope: row.scope,
      status: row.status,
      accountVerification: row.accountVerification,
      jewelleryAcceptance: row.jewelleryAcceptance,
      approvedJewelleryCategories: row.approvedJewelleryCategories,
    };

    const destinations = row.destinations.map((destination) => ({
      courierCode: row.code,
      countryCode: destination.countryCode,
      isActive: destination.isActive,
      verified: destination.verified,
      chargeMinor: destination.chargeMinor,
      estimateMinDays: destination.estimateMinDays,
      estimateMaxDays: destination.estimateMaxDays,
      notes: destination.notes,
      updatedAt: destination.updatedAt,
    }));

    const eligibleCountries = destinations
      .filter((destination) =>
        checkCourierDestinationEligibility(courier, destination).ok,
      )
      .map((destination) => destination.countryCode);

    return {
      ...courier,
      accountVerifiedAt: row.accountVerifiedAt,
      jewelleryAcceptedAt: row.jewelleryAcceptedAt,
      trackingUrlTemplate: row.trackingUrlTemplate,
      termsUrl: row.termsUrl,
      contactDetails: row.contactDetails,
      notes: row.notes,
      updatedBy: row.updatedBy,
      updatedAt: row.updatedAt,
      destinations,
      eligibleCountries,
    };
  });
}

/**
 * Create a courier company record (T060).
 *
 * The registry is owner-managed: no courier company is predefined, seeded, or
 * implied here. Creating a record is configuration, never approval: the
 * courier starts NOT_CONFIGURED with an UNVERIFIED account and no jewellery
 * acceptance, and it can only reach the storefront after the activation gates
 * in updateCourierStatus are satisfied with recorded evidence.
 */
export async function createCourier(
  input: { displayName: string; scope: string; contactDetails: string },
  actor: string,
) {
  const displayName = input.displayName.trim().replace(/\s+/g, " ").slice(0, 80);

  if (displayName.length < 2) {
    throw new SettingsError(
      "displayName",
      "Enter the courier company name (at least 2 characters).",
    );
  }

  if (!isCourierScope(input.scope)) {
    throw new SettingsError("scope", "Choose a valid delivery scope.");
  }

  const scope = input.scope;
  const contactDetails = input.contactDetails.trim().slice(0, 500) || null;

  const db = getDb();
  const existing = await db.courier.findMany({ select: { code: true } });

  const code = deriveCourierCode(
    displayName,
    existing.map((row) => row.code),
  );

  const courier = await db.courier.create({
    data: {
      code,
      displayName,
      scope,
      contactDetails,
      status: "NOT_CONFIGURED",
      accountVerification: "UNVERIFIED",
      jewelleryAcceptance: "NOT_ACCEPTED",
      approvedJewelleryCategories: [],
    },
  });

  await recordAdminAudit({
    actor,
    action: "settings.courier.create",
    entityType: "Courier",
    entityId: code,
    summary: `Courier company ${displayName} added to the registry (not approved).`,
    metadata: { code, displayName, scope },
  });

  return courier;
}

async function readCourier(code: string) {
  const courier = await getDb().courier.findUnique({ where: { code } });

  if (!courier) {
    throw new SettingsError(
      "code",
      "This courier company does not exist in the registry. Add it with the courier form first.",
    );
  }

  return courier;
}

/**
 * Change the overall courier status (T026A/T026B, T060).
 *
 * Approving or activating a courier is an owner decision recorded as evidence,
 * never a default. The server refuses to mark a courier ACTIVE until its
 * account is verified, jewellery acceptance is recorded, and at least one
 * destination passes every gate — so an unapproved courier can never reach
 * the storefront by form tampering.
 */
export async function updateCourierStatus(
  input: {
    code: string;
    status: string;
    trackingUrlTemplate: string;
    termsUrl: string;
    notes: string;
    contactDetails: string;
  },
  actor: string,
) {
  if (!isCourierStatus(input.status)) {
    throw new SettingsError("status", "Choose a valid courier status.");
  }

  const status = input.status;
  const tracking = validateTrackingUrlTemplate(input.trackingUrlTemplate);

  if (!tracking.ok) {
    throw new SettingsError("trackingUrlTemplate", tracking.error);
  }

  const terms = input.termsUrl.trim();

  if (terms !== "" && !/^https:\/\/[A-Za-z0-9.-]+(?:\/|$)/.test(terms)) {
    throw new SettingsError("termsUrl", "Use a complete https:// address.");
  }

  const notes = input.notes.trim().slice(0, 1000);
  const contactDetails = input.contactDetails.trim().slice(0, 500) || null;
  const code = input.code;

  const courier = await readCourier(code);

  if (status === "APPROVED" && courier.accountVerification !== "VERIFIED") {
    throw new SettingsError(
      "status",
      "Record the courier account verification before approving this courier.",
    );
  }

  if (status === "ACTIVE") {
    if (courier.accountVerification !== "VERIFIED") {
      throw new SettingsError(
        "status",
        "This courier cannot be activated until its account is verified.",
      );
    }

    if (courier.jewelleryAcceptance !== "ACCEPTED") {
      throw new SettingsError(
        "status",
        "This courier cannot be activated until jewellery acceptance is recorded with the courier's written confirmation.",
      );
    }

    const destinations = await getDb().courierDestination.findMany({
      where: { courierId: courier.id },
    });

    // The eligibility helper also checks courier-level gates, but this block
    // only runs while transitioning TO ACTIVE, so the courier is not yet
    // ACTIVE in the database. Evaluate the destination against the target
    // status: the account-verification and jewellery-acceptance gates were
    // already enforced explicitly above, and the destination gates below
    // remain fully fail-closed. Using the stored (pre-activation) status
    // here would make activation impossible for every courier.
    const courierConfig: CourierConfigLike = {
      code: courier.code,
      displayName: courier.displayName,
      scope: courier.scope,
      status,
      accountVerification: courier.accountVerification,
      jewelleryAcceptance: courier.jewelleryAcceptance,
      approvedJewelleryCategories: courier.approvedJewelleryCategories,
    };

    const usable = destinations.some((destination) =>
      checkCourierDestinationEligibility(
        courierConfig,
        {
          courierCode: courier.code,
          countryCode: destination.countryCode,
          isActive: destination.isActive,
          verified: destination.verified,
          chargeMinor: destination.chargeMinor,
          estimateMinDays: destination.estimateMinDays,
          estimateMaxDays: destination.estimateMaxDays,
        },
      ).ok,
    );

    if (!usable) {
      throw new SettingsError(
        "status",
        "This courier cannot be activated until at least one destination is active, verified, and carries an approved charge.",
      );
    }
  }

  await getDb().courier.update({
    where: { code },
    data: {
      status,
      trackingUrlTemplate: tracking.value,
      termsUrl: terms || null,
      notes: notes || null,
      contactDetails,
      updatedBy: actor,
    },
  });

  await recordAdminAudit({
    actor,
    action: "settings.courier.status",
    entityType: "Courier",
    entityId: code,
    summary: `Courier status set to ${status}.`,
    metadata: {
      status,
      trackingUrlTemplate: tracking.value,
      fromStatus: courier.status,
    },
  });
}

/**
 * Record the courier account verification state (T026A/T026B).
 *
 * Marking the account verified requires an evidence reference, and the
 * verification cannot be withdrawn while the courier is ACTIVE: suspend the
 * courier first.
 */
export async function updateCourierAccount(
  input: { code: string; accountVerification: string; evidence: string },
  actor: string,
) {
  if (!isCourierAccountVerification(input.accountVerification)) {
    throw new SettingsError(
      "accountVerification",
      "Choose a valid account verification state.",
    );
  }

  const state = input.accountVerification;
  const evidence = input.evidence.trim().slice(0, 500);

  if (state === "VERIFIED" && evidence.length < 3) {
    throw new SettingsError(
      "evidence",
      "Record the account number, agreement, or written confirmation reference that proves the courier account is verified.",
    );
  }

  const courier = await readCourier(input.code);

  if (
    courier.status === "ACTIVE" &&
    courier.accountVerification === "VERIFIED" &&
    state !== "VERIFIED"
  ) {
    throw new SettingsError(
      "accountVerification",
      "Suspend this courier before withdrawing a verified account status.",
    );
  }

  await getDb().courier.update({
    where: { code: courier.code },
    data: {
      accountVerification: state,
      accountVerifiedAt: state === "VERIFIED" ? new Date() : null,
      updatedBy: actor,
    },
  });

  await recordAdminAudit({
    actor,
    action: "settings.courier.account",
    entityType: "Courier",
    entityId: courier.code,
    summary: `Courier account verification set to ${state}.`,
    metadata: { state, evidence: evidence || null },
  });
}

/**
 * Record jewellery acceptance and the approved jewellery categories for a
 * courier (T026A/T026B, T060).
 *
 * Many courier companies restrict or prohibit jewellery under their standard
 * terms, so acceptance is recorded only with an evidence reference from the
 * courier's own written confirmation. An empty category list approves nothing.
 */
export async function updateCourierJewelleryAcceptance(
  input: {
    code: string;
    jewelleryAcceptance: string;
    approvedCategories: string;
    evidence: string;
  },
  actor: string,
) {
  if (!isJewelleryAcceptance(input.jewelleryAcceptance)) {
    throw new SettingsError(
      "jewelleryAcceptance",
      "Choose a valid jewellery acceptance state.",
    );
  }

  const state = input.jewelleryAcceptance;
  const evidence = input.evidence.trim().slice(0, 500);

  if (state === "ACCEPTED" && evidence.length < 3) {
    throw new SettingsError(
      "evidence",
      "Record the written courier confirmation that proves this courier company accepts jewellery shipments for this store.",
    );
  }

  const categories = input.approvedCategories
    .split(",")
    .map((category) => category.trim())
    .filter((category) => category !== "")
    .map((category) => category.slice(0, 60));

  if (new Set(categories).size !== categories.length) {
    throw new SettingsError(
      "approvedCategories",
      "Each jewellery category may only be listed once.",
    );
  }

  if (categories.length > 40) {
    throw new SettingsError(
      "approvedCategories",
      "List at most 40 jewellery categories.",
    );
  }

  const courier = await readCourier(input.code);

  if (
    courier.status === "ACTIVE" &&
    courier.jewelleryAcceptance === "ACCEPTED" &&
    state !== "ACCEPTED"
  ) {
    throw new SettingsError(
      "jewelleryAcceptance",
      "Suspend this courier before withdrawing jewellery acceptance.",
    );
  }

  await getDb().courier.update({
    where: { code: courier.code },
    data: {
      jewelleryAcceptance: state,
      jewelleryAcceptedAt: state === "ACCEPTED" ? new Date() : null,
      approvedJewelleryCategories: categories,
      updatedBy: actor,
    },
  });

  await recordAdminAudit({
    actor,
    action: "settings.courier.jewellery",
    entityType: "Courier",
    entityId: courier.code,
    summary: `Courier jewellery acceptance set to ${state}.`,
    metadata: { state, categories, evidence: evidence || null },
  });
}

function parseOptionalMoneyMinor(
  raw: string,
  field: string,
): number | null {
  const value = raw.trim().replace(/,/g, "");

  if (value === "") {
    return null;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    throw new SettingsError(field, "Enter an amount such as 0 or 250, or leave it empty.");
  }

  return Math.round(Number(value) * 100);
}

function parseOptionalDays(raw: string, field: string): number | null {
  const value = raw.trim();

  if (value === "") {
    return null;
  }

  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 60) {
    throw new SettingsError(field, "Enter a whole number of days (1-60), or leave it empty.");
  }

  return Number(value);
}

/**
 * Upsert one courier destination country (T026A/T026B, T060).
 *
 * Each courier record carries its own scope: domestic couriers accept only
 * Pakistan, and international couriers never accept Pakistan. Marking a
 * destination verified requires an evidence reference. A destination without
 * an approved charge is never offered and is never charged.
 */
export async function updateCourierDestination(
  input: {
    code: string;
    countryCode: string;
    isActive: boolean;
    verified: boolean;
    charge: string;
    estimateMinDays: string;
    estimateMaxDays: string;
    evidence: string;
    notes: string;
  },
  actor: string,
) {
  const code = input.code;
  const countryCode = input.countryCode.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    throw new SettingsError("countryCode", "Use a two-letter country code.");
  }

  const chargeMinor = parseOptionalMoneyMinor(input.charge, "charge");
  const minDays = parseOptionalDays(input.estimateMinDays, "estimateMinDays");
  const maxDays = parseOptionalDays(input.estimateMaxDays, "estimateMaxDays");

  if (minDays !== null && maxDays !== null && minDays > maxDays) {
    throw new SettingsError(
      "estimateMaxDays",
      "The maximum estimate cannot be shorter than the minimum.",
    );
  }

  const evidence = input.evidence.trim().slice(0, 500);

  if (input.verified && evidence.length < 3) {
    throw new SettingsError(
      "evidence",
      "Record the courier confirmation that proves this destination is served (rate sheet, service guide, or written confirmation).",
    );
  }

  const notes = input.notes.trim().slice(0, 500);

  const courier = await readCourier(code);

  if (scopeForCountry(countryCode) !== courier.scope) {
    throw new SettingsError(
      "countryCode",
      courier.scope === "DOMESTIC_PK"
        ? "This courier is a Pakistan domestic courier; only PK can be configured for it."
        : "This courier is an international courier; Pakistan delivery is handled by the domestic couriers.",
    );
  }

  await getDb().courierDestination.upsert({
    where: {
      courierId_countryCode: { courierId: courier.id, countryCode },
    },
    update: {
      isActive: input.isActive,
      verified: input.verified,
      chargeMinor,
      estimateMinDays: minDays,
      estimateMaxDays: maxDays,
      notes: notes || null,
    },
    create: {
      courierId: courier.id,
      countryCode,
      isActive: input.isActive,
      verified: input.verified,
      chargeMinor,
      estimateMinDays: minDays,
      estimateMaxDays: maxDays,
      notes: notes || null,
    },
  });

  await recordAdminAudit({
    actor,
    action: "settings.courier.destination",
    entityType: "CourierDestination",
    entityId: `${code}:${countryCode}`,
    summary: `Courier destination ${countryCode} saved for ${code}.`,
    metadata: {
      isActive: input.isActive,
      verified: input.verified,
      chargeMinor,
      estimateMinDays: minDays,
      estimateMaxDays: maxDays,
      evidence: evidence || null,
    },
  });
}
