import assert from "node:assert/strict";
import test from "node:test";

import {
  BUSINESS_SETTING_KEYS,
  SettingsError,
  isBusinessSettingKey,
  validateSettingValue,
} from "../lib/admin/settings.ts";
import { supplierArchiveBlocker } from "../lib/admin/suppliers.ts";
import {
  DEFAULT_HOME_HERO,
  isSafeHeroHref,
  isSafeHeroImage,
  resolveHomeHero,
} from "../lib/home-hero.ts";
import {
  DEFAULT_BUSINESS_CONTACT,
  DEFAULT_DELIVERY_ESTIMATE,
  buildWhatsAppUrl,
  normalizeWhatsAppNumber,
  resolveBusinessContact,
  resolveDeliveryEstimate,
} from "../lib/public-settings-core.ts";
import {
  MAX_PRODUCT_IMAGE_BYTES,
  ProductImageUploadError,
  hasValidImageSignature,
  validateProductImageUpload,
} from "../lib/product-image-upload.ts";
import { isSupportedProductImagePath } from "../lib/product-images.ts";

/* ------------------------------------------------------------ public contact */

test("business contact falls back to the owner-confirmed constants", () => {
  assert.deepEqual(resolveBusinessContact({}), DEFAULT_BUSINESS_CONTACT);
  assert.deepEqual(resolveBusinessContact({ "store.name": "   " }), DEFAULT_BUSINESS_CONTACT);
});

test("business contact uses saved values and builds WhatsApp links", () => {
  const contact = resolveBusinessContact({
    "store.name": "JS Jewellers Test",
    "store.address": "Lahore",
    "store.contactEmail": "hello@example.com",
    "store.contactPhone": "+92 300 1112223",
    "store.whatsappNumber": "0300 1112223",
    "store.openingHours": "Mon-Sat 11:00-20:00",
  });

  assert.equal(contact.storeName, "JS Jewellers Test");
  assert.equal(contact.location, "Lahore");
  assert.equal(contact.emailUrl, "mailto:hello@example.com");
  assert.equal(contact.whatsappDisplay, "0300 1112223");
  assert.equal(contact.whatsappUrl, "https://wa.me/923001112223");
  assert.equal(contact.openingHours, "Mon-Sat 11:00-20:00");
  assert.equal(contact.legalName, DEFAULT_BUSINESS_CONTACT.legalName);
});

test("WhatsApp numbers are normalized without inventing a number", () => {
  assert.equal(normalizeWhatsAppNumber(""), "");
  assert.equal(normalizeWhatsAppNumber("0300-111-2223"), "923001112223");
  assert.equal(normalizeWhatsAppNumber("+92 300 1112223"), "923001112223");
  assert.equal(normalizeWhatsAppNumber("0092 300 1112223"), "923001112223");
  assert.equal(buildWhatsAppUrl(""), DEFAULT_BUSINESS_CONTACT.whatsappUrl);
});

/* --------------------------------------------------------- delivery estimate */

test("delivery estimate uses a valid active Pakistan zone before the default", () => {
  const estimate = resolveDeliveryEstimate(
    { estimateMinDays: 5, estimateMaxDays: 9, deliveryNote: "Allow extra time." },
    { isActive: true, estimateMinDays: 2, estimateMaxDays: 4, chargeMinor: 25000 },
  );

  assert.equal(estimate.display, "2–4 days");
  assert.equal(estimate.chargeMinor, 25000);
  assert.equal(estimate.note, "Allow extra time.");
});

test("delivery estimate ignores inactive or invalid zones", () => {
  const inactive = resolveDeliveryEstimate(null, {
    isActive: false,
    estimateMinDays: 1,
    estimateMaxDays: 2,
    chargeMinor: 100,
  });
  assert.equal(inactive.display, DEFAULT_DELIVERY_ESTIMATE.display);
  assert.equal(inactive.chargeMinor, 0);

  const invalid = resolveDeliveryEstimate(
    { estimateMinDays: 9, estimateMaxDays: 3 },
    null,
  );
  assert.equal(invalid.display, DEFAULT_DELIVERY_ESTIMATE.display);
});

/* ----------------------------------------------------------------- hero copy */

test("home hero falls back to the approved defaults", () => {
  assert.deepEqual(resolveHomeHero({}), DEFAULT_HOME_HERO);
});

test("home hero accepts safe overrides", () => {
  const hero = resolveHomeHero({
    "homepage.heroEyebrow": "New season",
    "homepage.heroHeading": "Golden hour",
    "homepage.heroDescription": "A new collection.",
    "homepage.heroImageSrc": "/images/products/uploads/hero.png",
    "homepage.heroImageAlt": "Gold rings on silk",
    "homepage.heroPrimaryLabel": "Explore",
    "homepage.heroPrimaryHref": "/collections",
    "homepage.heroSecondaryLabel": "Visit https",
    "homepage.heroSecondaryHref": "https://example.com/contact",
  });

  assert.equal(hero.heading, "Golden hour");
  assert.equal(hero.imageSrc, "/images/products/uploads/hero.png");
  assert.equal(hero.secondaryHref, "https://example.com/contact");
});

test("home hero rejects unsafe image paths and destinations", () => {
  const hero = resolveHomeHero({
    "homepage.heroImageSrc": "//evil.example/x.png",
    "homepage.heroPrimaryHref": "javascript:alert(1)",
    "homepage.heroSecondaryHref": "//evil.example",
  });

  assert.equal(hero.imageSrc, DEFAULT_HOME_HERO.imageSrc);
  assert.equal(hero.primaryHref, DEFAULT_HOME_HERO.primaryHref);
  assert.equal(hero.secondaryHref, DEFAULT_HOME_HERO.secondaryHref);
  assert.equal(isSafeHeroImage("/images/../secret.png"), false);
  assert.equal(isSafeHeroHref("http://example.com"), false);
  assert.equal(isSafeHeroHref("/collections"), true);
});

/* --------------------------------------------------------------- admin rules */

test("supplier archiving is refused while published products exist", () => {
  assert.equal(supplierArchiveBlocker(0), null);
  assert.match(supplierArchiveBlocker(1), /Unpublish 1 published product/);
  assert.match(supplierArchiveBlocker(3), /Unpublish 3 published products/);
});

test("new setting keys are registered and validated", () => {
  assert.equal(isBusinessSettingKey("homepage.heroHeading"), true);
  assert.equal(isBusinessSettingKey("notifications.newOrder"), true);
  assert.equal(isBusinessSettingKey("store.name"), true);
  assert.equal(isBusinessSettingKey("not.a.setting"), false);
  assert.equal(BUSINESS_SETTING_KEYS["notifications.lowStock"].max, 5);

  assert.equal(validateSettingValue("notifications.newOrder", "true"), "true");
  assert.equal(validateSettingValue("notifications.newOrder", "false"), "false");
  assert.throws(
    () => validateSettingValue("notifications.newOrder", "yes"),
    SettingsError,
  );
  assert.throws(
    () => validateSettingValue("notifications.recipientEmail", "not-an-email"),
    SettingsError,
  );
  assert.throws(
    () => validateSettingValue("homepage.heroImageSrc", "/images/../x.png"),
    SettingsError,
  );
  assert.throws(
    () => validateSettingValue("homepage.heroPrimaryHref", "javascript:alert(1)"),
    SettingsError,
  );
  assert.throws(
    () => validateSettingValue("returns.windowDays", "31"),
    SettingsError,
  );
});

/* ------------------------------------------------------------- image uploads */

function bytes(values) {
  return new Uint8Array(values);
}

test("product image upload validation normalizes safe files", () => {
  const validated = validateProductImageUpload({
    fileName: "Gold Ring (front).PNG",
    mimeType: "image/png",
    sizeBytes: 2048,
    alt: "Gold ring on a white background",
  });

  assert.equal(validated.extension, "png");
  assert.equal(validated.baseName, "gold-ring-front");
  assert.equal(validated.alt, "Gold ring on a white background");
});

test("product image upload validation rejects unsafe input", () => {
  assert.throws(
    () =>
      validateProductImageUpload({
        fileName: "ring.gif",
        mimeType: "image/gif",
        sizeBytes: 10,
        alt: "A ring",
      }),
    ProductImageUploadError,
  );
  assert.throws(
    () =>
      validateProductImageUpload({
        fileName: "ring.png",
        mimeType: "image/png",
        sizeBytes: MAX_PRODUCT_IMAGE_BYTES + 1,
        alt: "A ring",
      }),
    ProductImageUploadError,
  );
  assert.throws(
    () =>
      validateProductImageUpload({
        fileName: "ring.png",
        mimeType: "image/png",
        sizeBytes: 10,
        alt: "x",
      }),
    ProductImageUploadError,
  );
});

test("image signatures must match the declared format", () => {
  const png = bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const jpeg = bytes([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const webp = bytes([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
  const avif = bytes([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]);

  assert.equal(hasValidImageSignature(png, "image/png"), true);
  assert.equal(hasValidImageSignature(jpeg, "image/jpeg"), true);
  assert.equal(hasValidImageSignature(webp, "image/webp"), true);
  assert.equal(hasValidImageSignature(avif, "image/avif"), true);
  assert.equal(hasValidImageSignature(png, "image/jpeg"), false);
  assert.equal(hasValidImageSignature(bytes([1, 2, 3]), "image/png"), false);
  assert.equal(hasValidImageSignature(avif, "image/gif"), false);
});

test("uploaded image URLs are valid product image paths", () => {
  assert.equal(
    isSupportedProductImagePath("/images/products/uploads/ring-abc123.png"),
    true,
  );
  assert.equal(
    isSupportedProductImagePath("/images/products/uploads/../secret.png"),
    false,
  );
  assert.equal(isSupportedProductImagePath("https://example.com/ring.png"), false);
});
