import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTrackingUrl,
  deriveCourierCode,
  validateTrackingReference,
  validateTrackingUrlTemplate,
} from "../lib/couriers/config.ts";
import {
  areJewelleryCategoriesApproved,
  checkCourierDestinationEligibility,
  couriersForScope,
  resolveCourierForCountry,
  resolveCourierShipping,
  resolveDeliveryCountries,
  resolveOrderCourierDecision,
  scopeForCountry,
} from "../lib/couriers/selection.ts";
import {
  canTransitionCourierFulfilment,
  COURIER_FULFILMENT_STATUSES,
  getAllowedCourierFulfilmentTransitions,
} from "../lib/orders/courier-status.ts";
import {
  ADMIN_PERMISSIONS,
  hasPermission,
} from "../lib/admin/permissions.ts";
import {
  ALLOWED_DELIVERY_COUNTRY_CODES,
  validateCheckout,
} from "../lib/checkout/validation.ts";

/* ---------------------------------------------------------------- fixtures */

// Generic fixture couriers only: no real courier company is referenced in
// tests, because the registry is owner-managed and provider-independent.

function courierFixture(overrides = {}) {
  return {
    code: "ALPHA_COURIER",
    displayName: "Alpha Courier",
    scope: "DOMESTIC_PK",
    status: "ACTIVE",
    accountVerification: "VERIFIED",
    jewelleryAcceptance: "ACCEPTED",
    approvedJewelleryCategories: ["rings", "necklaces"],
    ...overrides,
  };
}

function destinationFixture(overrides = {}) {
  return {
    courierCode: "ALPHA_COURIER",
    countryCode: "PK",
    isActive: true,
    verified: true,
    chargeMinor: 25000,
    estimateMinDays: 2,
    estimateMaxDays: 4,
    ...overrides,
  };
}

function internationalFixture(overrides = {}) {
  return courierFixture({
    code: "OMEGA_COURIER",
    displayName: "Omega Courier",
    scope: "INTERNATIONAL",
    ...overrides,
  });
}

function secondInternationalFixture(overrides = {}) {
  return courierFixture({
    code: "ZETA_COURIER",
    displayName: "Zeta Courier",
    scope: "INTERNATIONAL",
    ...overrides,
  });
}

function secondDomesticFixture(overrides = {}) {
  return courierFixture({
    code: "BETA_COURIER",
    displayName: "Beta Courier",
    ...overrides,
  });
}

/* ------------------------------------------------------- scope and routing */

test("Pakistan is domestic and every other country is international", () => {
  assert.equal(scopeForCountry("PK"), "DOMESTIC_PK");
  assert.equal(scopeForCountry("pk"), "DOMESTIC_PK");
  assert.equal(scopeForCountry("GB"), "INTERNATIONAL");
  assert.equal(scopeForCountry("AE"), "INTERNATIONAL");
});

test("courier codes are derived from the company name and made unique", () => {
  assert.equal(deriveCourierCode("Alpha Courier", []), "ALPHA_COURIER");
  assert.equal(
    deriveCourierCode("Example Courier Co. (Pvt) Ltd.", []),
    "EXAMPLE_COURIER_CO_PVT_LTD",
  );
  assert.equal(deriveCourierCode("Alpha Courier", ["ALPHA_COURIER"]), "ALPHA_COURIER_2");
  assert.equal(
    deriveCourierCode("Alpha Courier", ["ALPHA_COURIER", "ALPHA_COURIER_2"]),
    "ALPHA_COURIER_3",
  );
  assert.equal(
    deriveCourierCode("Alpha Courier", ["alpha_courier"]),
    "ALPHA_COURIER_2",
  );
  assert.equal(deriveCourierCode("   ", []), "COURIER");
  assert.equal(deriveCourierCode("!!!", []), "COURIER");
  assert.equal(
    deriveCourierCode(`${"A".repeat(50)} Courier`, []).length <= 40,
    true,
  );
});

test("couriers are filtered by scope in a deterministic order", () => {
  const alpha = courierFixture();
  const beta = secondDomesticFixture();
  const omega = internationalFixture();

  assert.deepEqual(couriersForScope([omega, beta, alpha], "DOMESTIC_PK"), [
    alpha,
    beta,
  ]);
  assert.deepEqual(couriersForScope([beta, omega, alpha], "INTERNATIONAL"), [
    omega,
  ]);
  assert.deepEqual(couriersForScope([], "DOMESTIC_PK"), []);

  // Same company name falls back to the code for a stable order.
  const first = courierFixture({ code: "AAA_COURIER" });
  const second = courierFixture({ code: "BBB_COURIER" });

  assert.deepEqual(
    couriersForScope([second, first], "DOMESTIC_PK"),
    [first, second],
  );
});

test("Pakistan resolves a domestic courier and other countries an international one", () => {
  const couriers = [courierFixture(), internationalFixture()];
  const destinations = [
    destinationFixture(),
    destinationFixture({
      courierCode: "OMEGA_COURIER",
      countryCode: "GB",
    }),
  ];

  const domestic = resolveCourierForCountry({
    countryCode: "PK",
    couriers,
    destinations,
  });
  const international = resolveCourierForCountry({
    countryCode: "gb",
    couriers,
    destinations,
  });

  assert.equal(domestic.ok, true);
  if (domestic.ok) {
    assert.equal(domestic.courier.code, "ALPHA_COURIER");
    assert.equal(domestic.destination.countryCode, "PK");
  }

  assert.equal(international.ok, true);
  if (international.ok) {
    assert.equal(international.courier.code, "OMEGA_COURIER");
    assert.equal(international.destination.countryCode, "GB");
  }
});

test("an empty courier registry reports COURIER_NOT_CONFIGURED", () => {
  const resolution = resolveCourierForCountry({
    countryCode: "PK",
    couriers: [],
    destinations: [],
  });

  assert.equal(resolution.ok, false);
  if (!resolution.ok) {
    assert.equal(resolution.reason, "COURIER_NOT_CONFIGURED");
    assert.equal(resolution.courierCode, undefined);
  }
});

/* ---------------------------------------------------------- approval gates */

test("a fully approved courier destination is eligible", () => {
  const check = checkCourierDestinationEligibility(
    courierFixture(),
    destinationFixture(),
  );

  assert.deepEqual(check, { ok: true });
});

test("a disabled or unverified courier is never eligible", () => {
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture({ status: "SUSPENDED" }),
      destinationFixture(),
    ).reason,
    "COURIER_NOT_ACTIVE",
  );
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture({ status: "NOT_CONFIGURED" }),
      destinationFixture(),
    ).reason,
    "COURIER_NOT_ACTIVE",
  );
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture({ status: "PENDING_VERIFICATION" }),
      destinationFixture(),
    ).reason,
    "COURIER_NOT_ACTIVE",
  );
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture({ accountVerification: "UNVERIFIED" }),
      destinationFixture(),
    ).reason,
    "ACCOUNT_UNVERIFIED",
  );
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture({ accountVerification: "PENDING" }),
      destinationFixture(),
    ).reason,
    "ACCOUNT_UNVERIFIED",
  );
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture({ jewelleryAcceptance: "NOT_ACCEPTED" }),
      destinationFixture(),
    ).reason,
    "JEWELLERY_NOT_ACCEPTED",
  );
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture({ jewelleryAcceptance: "PENDING_CONFIRMATION" }),
      destinationFixture(),
    ).reason,
    "JEWELLERY_NOT_ACCEPTED",
  );
  assert.equal(
    checkCourierDestinationEligibility(courierFixture(), undefined).reason,
    "DESTINATION_NOT_CONFIGURED",
  );
  assert.equal(
    checkCourierDestinationEligibility(undefined, destinationFixture()).reason,
    "COURIER_NOT_CONFIGURED",
  );
});

test("an inactive or unverified destination is never eligible", () => {
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture(),
      destinationFixture({ isActive: false }),
    ).reason,
    "DESTINATION_INACTIVE",
  );
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture(),
      destinationFixture({ verified: false }),
    ).reason,
    "DESTINATION_UNVERIFIED",
  );
});

test("a destination without an approved charge is never offered or charged", () => {
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture(),
      destinationFixture({ chargeMinor: null }),
    ).reason,
    "CHARGE_NOT_APPROVED",
  );
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture(),
      destinationFixture({ chargeMinor: undefined }),
    ).reason,
    "CHARGE_NOT_APPROVED",
  );
  assert.equal(
    checkCourierDestinationEligibility(
      courierFixture(),
      destinationFixture({ chargeMinor: -1 }),
    ).reason,
    "CHARGE_NOT_APPROVED",
  );

  const countries = resolveDeliveryCountries({
    couriers: [internationalFixture()],
    destinations: [
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "GB",
        chargeMinor: null,
      }),
    ],
  });

  assert.deepEqual(countries, ["PK"]);
});

test("a destination without approved estimates is never offered", () => {
  for (const estimates of [
    { estimateMinDays: null, estimateMaxDays: null },
    { estimateMinDays: 3, estimateMaxDays: null },
    { estimateMinDays: null, estimateMaxDays: 5 },
    { estimateMinDays: 5, estimateMaxDays: 3 },
    { estimateMinDays: 0, estimateMaxDays: 5 },
    { estimateMinDays: 3, estimateMaxDays: 61 },
    { estimateMinDays: 2.5, estimateMaxDays: 4 },
  ]) {
    assert.equal(
      checkCourierDestinationEligibility(
        internationalFixture(),
        destinationFixture({
          courierCode: "OMEGA_COURIER",
          countryCode: "GB",
          ...estimates,
        }),
      ).reason,
      "ESTIMATE_NOT_APPROVED",
      `expected ESTIMATE_NOT_APPROVED for ${JSON.stringify(estimates)}`,
    );
  }

  const countries = resolveDeliveryCountries({
    couriers: [internationalFixture()],
    destinations: [
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "GB",
        estimateMinDays: null,
        estimateMaxDays: null,
      }),
    ],
  });

  assert.deepEqual(countries, ["PK"]);
});

test("shipping charges and estimate text come only from approved values", () => {
  const resolved = resolveCourierForCountry({
    countryCode: "GB",
    couriers: [internationalFixture()],
    destinations: [
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "GB",
        chargeMinor: 99000,
        estimateMinDays: 5,
        estimateMaxDays: 9,
      }),
    ],
  });

  assert.equal(resolved.ok, true);

  if (resolved.ok) {
    assert.deepEqual(resolveCourierShipping(resolved), {
      shippingMinor: 99000,
      estimateDisplay: "5–9 days",
    });
  }
});

test("resolveCourierShipping never charges from an unapproved resolution", () => {
  const failed = resolveCourierForCountry({
    countryCode: "GB",
    couriers: [],
    destinations: [],
  });

  assert.equal(failed.ok, false);
  assert.deepEqual(resolveCourierShipping(failed), {
    shippingMinor: 0,
    estimateDisplay: null,
  });
});

/* ------------------------------------------------ checkout country surface */

test("Pakistan is always offered even when no courier is configured", () => {
  assert.deepEqual(resolveDeliveryCountries({ couriers: [], destinations: [] }), [
    "PK",
  ]);
});

test("international countries appear only through a fully approved international destination", () => {
  const countries = resolveDeliveryCountries({
    couriers: [courierFixture(), internationalFixture()],
    destinations: [
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "GB",
      }),
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "AE",
        verified: false,
      }),
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "US",
        chargeMinor: null,
      }),
      // An international courier row for Pakistan must not duplicate or
      // affect the domestic entry.
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "PK",
      }),
    ],
  });

  assert.deepEqual(countries, ["PK", "GB"]);
});

test("a suspended courier removes its countries from the delivery list", () => {
  const countries = resolveDeliveryCountries({
    couriers: [internationalFixture({ status: "SUSPENDED" })],
    destinations: [
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "GB",
      }),
    ],
  });

  assert.deepEqual(countries, ["PK"]);
});

/* ------------------------------------------------ jewellery category gates */

test("an empty approved category list approves nothing", () => {
  assert.equal(
    areJewelleryCategoriesApproved(
      courierFixture({ approvedJewelleryCategories: [] }),
      ["rings"],
    ),
    false,
  );
});

test("jewellery categories must cover every ordered item", () => {
  const courier = courierFixture({
    approvedJewelleryCategories: ["Rings", " Necklaces "],
  });

  assert.equal(areJewelleryCategoriesApproved(courier, ["rings"]), true);
  assert.equal(
    areJewelleryCategoriesApproved(courier, ["rings", "necklaces"]),
    true,
  );
  assert.equal(
    areJewelleryCategoriesApproved(courier, ["rings", "bracelets"]),
    false,
  );
  assert.equal(areJewelleryCategoriesApproved(courier, []), false);
  assert.equal(areJewelleryCategoriesApproved(courier, [""]), false);
});

/* ----------------------------------------------------- order decision rules */

test("a Pakistan order without an approved courier keeps the existing behaviour", () => {
  const decision = resolveOrderCourierDecision({
    countryCode: "PK",
    itemCategories: ["rings"],
    couriers: [],
    destinations: [],
  });

  assert.equal(decision.ok, true);
  if (decision.ok) {
    assert.equal(decision.scope, "DOMESTIC_PK");
    assert.equal(decision.courier, null);
    assert.equal(decision.shippingMinor, 0);
    assert.equal(decision.estimateDisplay, null);
  }
});

test("a Pakistan order with an approved courier is charged only from the approved destination", () => {
  const decision = resolveOrderCourierDecision({
    countryCode: "PK",
    itemCategories: ["rings"],
    couriers: [courierFixture()],
    destinations: [
      destinationFixture({ chargeMinor: 25000, estimateMinDays: 2, estimateMaxDays: 4 }),
    ],
  });

  assert.equal(decision.ok, true);
  if (decision.ok) {
    assert.equal(decision.scope, "DOMESTIC_PK");
    assert.equal(decision.courier?.code, "ALPHA_COURIER");
    assert.equal(decision.shippingMinor, 25000);
    assert.equal(decision.estimateDisplay, "2–4 days");
  }
});

test("a Pakistan order falls back to no courier when an ordered category is not approved", () => {
  const decision = resolveOrderCourierDecision({
    countryCode: "PK",
    itemCategories: ["bracelets"],
    couriers: [courierFixture()],
    destinations: [destinationFixture()],
  });

  assert.equal(decision.ok, true);
  if (decision.ok) {
    assert.equal(decision.courier, null);
    assert.equal(decision.shippingMinor, 0);
  }
});

test("an international order fails closed without an approved international destination", () => {
  const decision = resolveOrderCourierDecision({
    countryCode: "GB",
    itemCategories: ["rings"],
    couriers: [internationalFixture({ status: "PENDING_VERIFICATION" })],
    destinations: [],
  });

  assert.equal(decision.ok, false);
  if (!decision.ok) {
    assert.equal(decision.reason, "COURIER_NOT_ACTIVE");
    assert.equal(decision.countryCode, "GB");
  }
});

test("an international order fails closed when jewellery categories are not approved", () => {
  const decision = resolveOrderCourierDecision({
    countryCode: "GB",
    itemCategories: ["bracelets"],
    couriers: [internationalFixture()],
    destinations: [
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "GB",
      }),
    ],
  });

  assert.equal(decision.ok, false);
  if (!decision.ok) {
    assert.equal(decision.reason, "JEWELLERY_CATEGORY_NOT_APPROVED");
    assert.equal(decision.courierCode, "OMEGA_COURIER");
  }
});

test("an international order proceeds only through a fully approved international destination", () => {
  const decision = resolveOrderCourierDecision({
    countryCode: "GB",
    itemCategories: ["rings", "necklaces"],
    couriers: [internationalFixture()],
    destinations: [
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "GB",
        chargeMinor: 99000,
        estimateMinDays: 5,
        estimateMaxDays: 9,
      }),
    ],
  });

  assert.equal(decision.ok, true);
  if (decision.ok) {
    assert.equal(decision.scope, "INTERNATIONAL");
    assert.equal(decision.courier?.code, "OMEGA_COURIER");
    assert.equal(decision.shippingMinor, 99000);
    assert.equal(decision.estimateDisplay, "5–9 days");
  }
});

test("an international order fails closed when the destination has no approved charge", () => {
  const decision = resolveOrderCourierDecision({
    countryCode: "GB",
    itemCategories: ["rings"],
    couriers: [internationalFixture()],
    destinations: [
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "GB",
        chargeMinor: null,
      }),
    ],
  });

  assert.equal(decision.ok, false);
  if (!decision.ok) {
    assert.equal(decision.reason, "CHARGE_NOT_APPROVED");
  }
});

/* --------------------------------------------------- generic registry rules */

test("the first domestic courier by company name wins when both are approved", () => {
  const resolution = resolveCourierForCountry({
    countryCode: "PK",
    couriers: [secondDomesticFixture(), courierFixture()],
    destinations: [
      destinationFixture({ courierCode: "BETA_COURIER", chargeMinor: 12000 }),
      destinationFixture(),
    ],
  });

  assert.equal(resolution.ok, true);
  if (resolution.ok) {
    assert.equal(resolution.courier.code, "ALPHA_COURIER");
  }
});

test("a second approved domestic courier serves Pakistan when the first fails closed", () => {
  const resolution = resolveCourierForCountry({
    countryCode: "PK",
    couriers: [
      courierFixture({ status: "SUSPENDED" }),
      secondDomesticFixture(),
    ],
    destinations: [
      destinationFixture(),
      destinationFixture({ courierCode: "BETA_COURIER", chargeMinor: 12000 }),
    ],
  });

  assert.equal(resolution.ok, true);
  if (resolution.ok) {
    assert.equal(resolution.courier.code, "BETA_COURIER");
    assert.equal(resolution.destination.chargeMinor, 12000);
  }
});

test("the failure reason of the first configured courier is reported", () => {
  const resolution = resolveCourierForCountry({
    countryCode: "PK",
    couriers: [courierFixture({ status: "PENDING_VERIFICATION" })],
    destinations: [destinationFixture()],
  });

  assert.equal(resolution.ok, false);
  if (!resolution.ok) {
    assert.equal(resolution.reason, "COURIER_NOT_ACTIVE");
    assert.equal(resolution.courierCode, "ALPHA_COURIER");
  }
});

test("a second international courier serves the destination when the first fails closed", () => {
  const decision = resolveOrderCourierDecision({
    countryCode: "GB",
    itemCategories: ["rings"],
    couriers: [
      internationalFixture({ status: "SUSPENDED" }),
      secondInternationalFixture(),
    ],
    destinations: [
      destinationFixture({
        courierCode: "OMEGA_COURIER",
        countryCode: "GB",
      }),
      destinationFixture({
        courierCode: "ZETA_COURIER",
        countryCode: "GB",
        chargeMinor: 80000,
        estimateMinDays: 10,
        estimateMaxDays: 21,
      }),
    ],
  });

  assert.equal(decision.ok, true);
  if (decision.ok) {
    assert.equal(decision.scope, "INTERNATIONAL");
    assert.equal(decision.courier?.code, "ZETA_COURIER");
    assert.equal(decision.shippingMinor, 80000);
    assert.equal(decision.estimateDisplay, "10–21 days");
  }
});

test("an unapproved international courier fails closed like any courier", () => {
  const decision = resolveOrderCourierDecision({
    countryCode: "GB",
    itemCategories: ["rings"],
    couriers: [
      secondInternationalFixture({ jewelleryAcceptance: "NOT_ACCEPTED" }),
    ],
    destinations: [
      destinationFixture({
        courierCode: "ZETA_COURIER",
        countryCode: "GB",
      }),
    ],
  });

  assert.equal(decision.ok, false);
  if (!decision.ok) {
    assert.equal(decision.reason, "JEWELLERY_NOT_ACCEPTED");
    assert.equal(decision.courierCode, "ZETA_COURIER");
  }
});

test("international courier destinations join the delivery list only when fully approved", () => {
  const eligible = resolveDeliveryCountries({
    couriers: [secondInternationalFixture()],
    destinations: [
      destinationFixture({
        courierCode: "ZETA_COURIER",
        countryCode: "GB",
      }),
      destinationFixture({
        courierCode: "ZETA_COURIER",
        countryCode: "AE",
        verified: false,
      }),
    ],
  });

  assert.deepEqual(eligible, ["PK", "GB"]);

  const suspended = resolveDeliveryCountries({
    couriers: [secondInternationalFixture({ status: "SUSPENDED" })],
    destinations: [
      destinationFixture({
        courierCode: "ZETA_COURIER",
        countryCode: "GB",
      }),
    ],
  });

  assert.deepEqual(suspended, ["PK"]);
});

/* ------------------------------------------------------ tracking references */

test("tracking references only carry generic guardrails", () => {
  // No courier company publishes a format that this store may assume, so
  // only length and character guardrails are enforced for every courier.
  assert.equal(validateTrackingReference("Alpha Courier", "AB-1234 cd").ok, true);
  assert.equal(validateTrackingReference("Alpha Courier", "1234567890").ok, true);
  assert.equal(validateTrackingReference("Alpha Courier", "ab").ok, false);
  assert.equal(validateTrackingReference("Alpha Courier", "a".repeat(41)).ok, false);
  assert.equal(validateTrackingReference("Alpha Courier", "ref#12").ok, false);
  assert.equal(validateTrackingReference("Alpha Courier", "").ok, false);
  assert.equal(validateTrackingReference("", "AB-1234").ok, true);
});

test("tracking URLs are built only from valid templates and references", () => {
  assert.equal(
    buildTrackingUrl(
      "https://www.example.com/track/{trackingNumber}",
      "1234567890",
    ),
    "https://www.example.com/track/1234567890",
  );
  assert.equal(
    buildTrackingUrl("https://www.example.com/track/{trackingNumber}", null),
    null,
  );
  assert.equal(
    buildTrackingUrl(null, "1234567890"),
    null,
  );
  assert.equal(
    buildTrackingUrl("http://example.com/track/{trackingNumber}", "1234567890"),
    null,
  );
  assert.equal(
    buildTrackingUrl("https://www.example.com/track", "1234567890"),
    null,
  );
});

test("admin tracking URL templates must be https with a single placeholder", () => {
  assert.deepEqual(
    validateTrackingUrlTemplate("https://www.example.com/track/{trackingNumber}"),
    { ok: true, value: "https://www.example.com/track/{trackingNumber}" },
  );
  assert.deepEqual(validateTrackingUrlTemplate("  "), {
    ok: true,
    value: null,
  });
  assert.equal(
    validateTrackingUrlTemplate("http://www.example.com/track/{trackingNumber}").ok,
    false,
  );
  assert.equal(
    validateTrackingUrlTemplate("https://www.example.com/track").ok,
    false,
  );
  assert.equal(
    validateTrackingUrlTemplate("https://www.example.com/track/{trackingNumber}/{x}").ok,
    false,
  );
});

/* ------------------------------------------------- courier fulfilment flow */

test("courier fulfilment moves only along the approved workflow", () => {
  assert.equal(canTransitionCourierFulfilment("NOT_BOOKED", "BOOKED"), true);
  assert.equal(canTransitionCourierFulfilment("NOT_BOOKED", "DELIVERED"), false);
  assert.equal(canTransitionCourierFulfilment("IN_TRANSIT", "DELIVERED"), true);
  assert.equal(canTransitionCourierFulfilment("IN_TRANSIT", "RETURNED"), true);
  assert.equal(canTransitionCourierFulfilment("DELIVERED", "RETURNED"), true);
  assert.deepEqual(getAllowedCourierFulfilmentTransitions("DELIVERED"), [
    "RETURNED",
  ]);
  assert.deepEqual(getAllowedCourierFulfilmentTransitions("RETURNED"), []);
  assert.deepEqual(getAllowedCourierFulfilmentTransitions("CANCELLED"), []);
  assert.deepEqual([...COURIER_FULFILMENT_STATUSES], [
    "NOT_BOOKED",
    "BOOKED",
    "IN_TRANSIT",
    "DELIVERED",
    "EXCEPTION",
    "RETURNED",
    "CANCELLED",
  ]);
});

/* ------------------------------------------ permissions and payment safety */

test("courier administration reuses the existing permissions only", () => {
  // Courier settings reuse shipping.manage and courier order updates reuse
  // orders.manage. No courier-specific permission may exist.
  assert.equal(hasPermission(["shipping.manage"], "shipping.manage"), true);
  assert.equal(hasPermission(["orders.view"], "shipping.manage"), false);
  assert.equal(hasPermission(["orders.manage"], "orders.manage"), true);
  assert.ok(ADMIN_PERMISSIONS.includes("shipping.manage"));
  assert.ok(ADMIN_PERMISSIONS.includes("orders.manage"));
  assert.equal(
    ADMIN_PERMISSIONS.some((permission) => permission.includes("courier")),
    false,
  );
});

test("cash on delivery is never accepted as a payment method", () => {
  const result = validateCheckout(
    {
      fullName: "Ayesha Khan",
      email: "ayesha@example.com",
      phone: "+92 300 1234567",
      countryCode: "PK",
      city: "Lahore",
      addressLine1: "House 1, Street 2, Gulberg",
      addressLine2: "",
      postalCode: "54000",
      customerNotes: "",
      paymentMethod: "cod",
      idempotencyKey: "checkout-key-1234567890",
      acceptedPolicy: "true",
    },
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.paymentMethod);
  }
});

test("checkout country validation still defaults to Pakistan only", () => {
  assert.deepEqual(ALLOWED_DELIVERY_COUNTRY_CODES, ["PK"]);

  const withoutOptions = validateCheckout({
    fullName: "Ayesha Khan",
    email: "ayesha@example.com",
    phone: "+92 300 1234567",
    countryCode: "GB",
    city: "London",
    addressLine1: "1 High Street",
    addressLine2: "",
    postalCode: "",
    customerNotes: "",
    paymentMethod: "bank-transfer",
    idempotencyKey: "checkout-key-1234567890",
    acceptedPolicy: "true",
  });

  assert.equal(withoutOptions.ok, false);
  if (!withoutOptions.ok) {
    assert.match(
      withoutOptions.errors.countryCode,
      /not currently available to that country/,
    );
  }

  // With courier-approved countries supplied, only those are accepted.
  const allowed = validateCheckout(
    {
      fullName: "Ayesha Khan",
      email: "ayesha@example.com",
      phone: "+92 300 1234567",
      countryCode: "GB",
      city: "London",
      addressLine1: "1 High Street",
      addressLine2: "",
      postalCode: "",
      customerNotes: "",
      paymentMethod: "bank-transfer",
      idempotencyKey: "checkout-key-1234567890",
      acceptedPolicy: "true",
    },
    { allowedCountryCodes: ["PK", "GB"] },
  );

  assert.equal(allowed.ok, true);
});
