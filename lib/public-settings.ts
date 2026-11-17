import { cache } from "react";

import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  DEFAULT_HOME_HERO,
  resolveHomeHero,
  type HomeHeroContent,
} from "@/lib/home-hero";

import {
  DEFAULT_BUSINESS_CONTACT,
  DEFAULT_DELIVERY_ESTIMATE,
  resolveBusinessContact,
  resolveDeliveryEstimate,
  type BusinessContact,
  type PublicDeliveryEstimate,
} from "./public-settings-core";

/**
 * Public storefront settings reads.
 *
 * These functions never throw: a missing database, an unconfigured value, or a
 * failed query falls back to the owner-confirmed constants in `lib/site.ts`.
 * Only public contact and delivery fields are selected; no payment credentials,
 * supplier details, or customer data are ever read here.
 */

const PUBLIC_HERO_KEYS = [
  "homepage.heroEyebrow",
  "homepage.heroHeading",
  "homepage.heroDescription",
  "homepage.heroImageSrc",
  "homepage.heroImageAlt",
  "homepage.heroPrimaryLabel",
  "homepage.heroPrimaryHref",
  "homepage.heroSecondaryLabel",
  "homepage.heroSecondaryHref",
] as const;

const PUBLIC_CONTACT_KEYS = [
  "store.name",
  "store.contactEmail",
  "store.contactPhone",
  "store.whatsappNumber",
  "store.address",
  "store.openingHours",
] as const;

export const getPublicBusinessContact = cache(
  async (): Promise<BusinessContact> => {
    if (!isDatabaseConfigured()) {
      return DEFAULT_BUSINESS_CONTACT;
    }

    try {
      const rows = await getDb().businessSetting.findMany({
        where: { key: { in: [...PUBLIC_CONTACT_KEYS] } },
        select: { key: true, value: true },
      });
      const values = Object.fromEntries(
        rows.map((row) => [row.key, row.value]),
      );

      return resolveBusinessContact(values);
    } catch {
      return DEFAULT_BUSINESS_CONTACT;
    }
  },
);

export const getPublicHomeHero = cache(async (): Promise<HomeHeroContent> => {
  if (!isDatabaseConfigured()) {
    return DEFAULT_HOME_HERO;
  }

  try {
    const rows = await getDb().businessSetting.findMany({
      where: { key: { in: [...PUBLIC_HERO_KEYS] } },
      select: { key: true, value: true },
    });
    const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));

    return resolveHomeHero(values);
  } catch {
    return DEFAULT_HOME_HERO;
  }
});

export const getPublicDeliveryEstimate = cache(
  async (): Promise<PublicDeliveryEstimate> => {
    if (!isDatabaseConfigured()) {
      return DEFAULT_DELIVERY_ESTIMATE;
    }

    try {
      const db = getDb();
      const [setting, zone] = await Promise.all([
        db.shippingSetting.findUnique({ where: { id: "default" } }),
        db.shippingZone.findUnique({ where: { countryCode: "PK" } }),
      ]);

      return resolveDeliveryEstimate(setting, zone);
    } catch {
      return DEFAULT_DELIVERY_ESTIMATE;
    }
  },
);
