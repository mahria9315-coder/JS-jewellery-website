import { cache } from "react";

import { getDb, isDatabaseConfigured } from "@/lib/db";
import { DOMESTIC_COUNTRY_CODE } from "@/lib/couriers/config";
import {
  resolveCourierForCountry,
  resolveCourierShipping,
  resolveDeliveryCountries,
  type CourierConfigLike,
  type CourierDestinationLike,
} from "@/lib/couriers/selection";
import { DELIVERY_COUNTRIES } from "@/lib/checkout/validation";

/**
 * Public storefront courier reads.
 *
 * These functions never throw: a missing database or a failed query falls back
 * to Pakistan-only delivery, which is the owner-confirmed state before any
 * courier is approved. Only public courier fields are selected; no account
 * evidence, notes, or internal configuration is ever read here.
 */

/** Fallback when no database is available: Pakistan only. */
function fallbackCountryList(): Array<{ code: string; name: string }> {
  return DELIVERY_COUNTRIES.map((country) => ({
    code: country.code,
    name: country.name,
  }));
}

/** ISO country name lookup so no destination names are invented. */
export function countryDisplayName(code: string): string {
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Public courier/destination rows mapped to the pure selection types. */
async function loadCourierSelectionRows(): Promise<{
  couriers: CourierConfigLike[];
  destinations: CourierDestinationLike[];
} | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const db = getDb();
    const [couriers, destinations] = await Promise.all([
      db.courier.findMany({
        select: {
          code: true,
          displayName: true,
          scope: true,
          status: true,
          accountVerification: true,
          jewelleryAcceptance: true,
          approvedJewelleryCategories: true,
        },
      }),
      db.courierDestination.findMany({
        select: {
          courier: { select: { code: true } },
          countryCode: true,
          isActive: true,
          verified: true,
          chargeMinor: true,
          estimateMinDays: true,
          estimateMaxDays: true,
        },
      }),
    ]);

    return {
      couriers,
      destinations: destinations.map((destination) => ({
        courierCode: destination.courier.code,
        countryCode: destination.countryCode,
        isActive: destination.isActive,
        verified: destination.verified,
        chargeMinor: destination.chargeMinor,
        estimateMinDays: destination.estimateMinDays,
        estimateMaxDays: destination.estimateMaxDays,
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Countries checkout may offer.
 *
 * Pakistan is always offered (existing domestic behaviour). Every other
 * country appears only when a fully approved international courier
 * destination exists, so an unapproved courier never widens the delivery
 * list.
 */
export const getCheckoutDeliveryCountries = cache(
  async (): Promise<Array<{ code: string; name: string }>> => {
    const rows = await loadCourierSelectionRows();

    if (!rows) {
      return fallbackCountryList();
    }

    const codes = resolveDeliveryCountries(rows);

    return codes.map((code) => ({
      code,
      name: code === DOMESTIC_COUNTRY_CODE ? "Pakistan" : countryDisplayName(code),
    }));
  },
);

/**
 * Allowed delivery country codes for checkout validation.
 *
 * Re-read at order placement so a courier suspended between the draft and the
 * final submission can no longer be used.
 */
export async function getAllowedDeliveryCountryCodes(): Promise<string[]> {
  const countries = await getCheckoutDeliveryCountries();

  return countries.map((country) => country.code);
}

/** Indicative courier shipping shown on the checkout review page. */
export type IndicativeCourierShipping =
  | {
      available: true;
      courierDisplayName: string;
      shippingMinor: number;
      estimateDisplay: string | null;
    }
  | { available: false };

/**
 * Indicative shipping for one delivery country.
 *
 * Uses the same approval gates as order creation, but the values are display
 * hints only: the authoritative charge and estimate are recomputed inside the
 * order transaction when the order is placed, so a courier reconfigured or
 * suspended in between is never charged from this preview.
 */
export const getIndicativeCourierShippingForCountry = cache(
  async (countryCode: string): Promise<IndicativeCourierShipping> => {
    const rows = await loadCourierSelectionRows();

    if (!rows) {
      return { available: false };
    }

    const resolution = resolveCourierForCountry({
      countryCode,
      couriers: rows.couriers,
      destinations: rows.destinations,
    });

    if (!resolution.ok) {
      return { available: false };
    }

    const shipping = resolveCourierShipping(resolution);

    return {
      available: true,
      courierDisplayName: resolution.courier.displayName,
      shippingMinor: shipping.shippingMinor,
      estimateDisplay: shipping.estimateDisplay,
    };
  },
);

/**
 * Public courier display data for an order page. Only the customer-safe
 * display name and tracking URL template are returned.
 */
export const getPublicCourierByCode = cache(
  async (
    code: string | null | undefined,
  ): Promise<{ displayName: string; trackingUrlTemplate: string | null } | null> => {
    const cleanCode = code?.trim();

    if (!cleanCode || !isDatabaseConfigured()) {
      return null;
    }

    try {
      const courier = await getDb().courier.findUnique({
        where: { code: cleanCode },
        select: { displayName: true, trackingUrlTemplate: true },
      });

      return courier ?? null;
    } catch {
      return null;
    }
  },
);
