/**
 * Server-side checkout validation.
 *
 * Every value submitted by the browser is treated as untrusted. The same
 * validator runs when the customer reviews the order and again when the order
 * is created, so a tampered hidden field or replayed request cannot bypass it.
 *
 * Dependency-free so it can be unit-tested directly.
 */

export const DELIVERY_COUNTRIES = [
  { code: "PK", name: "Pakistan" },
] as const;

export const ALLOWED_DELIVERY_COUNTRY_CODES = DELIVERY_COUNTRIES.map(
  (country) => country.code,
);

export type PaymentMethodValue = "bank-transfer" | "easypaisa";

export type CheckoutInput = Record<string, string | undefined>;

export type CheckoutValue = {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  city: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string | null;
  customerNotes: string | null;
  paymentMethod: PaymentMethodValue;
  idempotencyKey: string;
};

export type CheckoutValidationResult =
  | { ok: true; value: CheckoutValue }
  | { ok: false; errors: Record<string, string> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED_PATTERN = /^[+()\d\s.-]+$/;
const POSTAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]{1,18}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9_-]{16,100}$/;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;

function text(input: CheckoutInput, key: string): string {
  return (input[key] ?? "").trim().replace(/\s+/g, " ");
}

function tooLong(value: string, max: number): boolean {
  return value.length > max;
}

export function validateCheckout(
  input: CheckoutInput,
  options: {
    allowedCountryCodes?: readonly string[];
    requirePolicyAcceptance?: boolean;
  } = {},
): CheckoutValidationResult {
  const allowedCountries =
    options.allowedCountryCodes ?? ALLOWED_DELIVERY_COUNTRY_CODES;
  const requirePolicyAcceptance = options.requirePolicyAcceptance ?? true;
  const errors: Record<string, string> = {};

  const fullName = text(input, "fullName");
  if (fullName.length < 2) {
    errors.fullName = "Enter your full name.";
  } else if (tooLong(fullName, 120) || CONTROL_CHARACTERS.test(fullName)) {
    errors.fullName = "Enter a valid full name (120 characters or fewer).";
  }

  const email = text(input, "email").toLowerCase();
  if (!EMAIL_PATTERN.test(email) || tooLong(email, 254)) {
    errors.email = "Enter a valid email address.";
  }

  const phone = text(input, "phone");
  const phoneDigits = phone.replace(/\D/g, "");
  if (
    !PHONE_ALLOWED_PATTERN.test(phone) ||
    phoneDigits.length < 7 ||
    phoneDigits.length > 15 ||
    tooLong(phone, 30)
  ) {
    errors.phone = "Enter a valid phone number, including the country code.";
  }

  const countryCode = text(input, "countryCode").toUpperCase();
  if (!allowedCountries.includes(countryCode)) {
    errors.countryCode =
      "Delivery is not currently available to that country. Contact us before ordering from another country.";
  }

  const city = text(input, "city");
  if (city.length < 2) {
    errors.city = "Enter your city.";
  } else if (tooLong(city, 80) || CONTROL_CHARACTERS.test(city)) {
    errors.city = "Enter a valid city (80 characters or fewer).";
  }

  const addressLine1 = text(input, "addressLine1");
  if (addressLine1.length < 5) {
    errors.addressLine1 = "Enter your complete delivery address.";
  } else if (tooLong(addressLine1, 200) || CONTROL_CHARACTERS.test(addressLine1)) {
    errors.addressLine1 = "Enter a valid address (200 characters or fewer).";
  }

  const addressLine2Raw = text(input, "addressLine2");
  if (tooLong(addressLine2Raw, 200) || CONTROL_CHARACTERS.test(addressLine2Raw)) {
    errors.addressLine2 = "Enter a valid address line (200 characters or fewer).";
  }

  const postalCodeRaw = text(input, "postalCode");
  if (
    postalCodeRaw !== "" &&
    (!POSTAL_PATTERN.test(postalCodeRaw) || tooLong(postalCodeRaw, 20))
  ) {
    errors.postalCode = "Enter a valid postal code.";
  }

  const customerNotesRaw = text(input, "customerNotes");
  if (
    tooLong(customerNotesRaw, 1000) ||
    CONTROL_CHARACTERS.test(customerNotesRaw)
  ) {
    errors.customerNotes = "Notes must be 1000 characters or fewer.";
  }

  const paymentMethod = text(input, "paymentMethod");
  if (paymentMethod !== "bank-transfer" && paymentMethod !== "easypaisa") {
    errors.paymentMethod = "Select a payment method.";
  }

  const idempotencyKey = text(input, "idempotencyKey");
  if (!IDEMPOTENCY_PATTERN.test(idempotencyKey)) {
    errors.idempotencyKey = "This checkout form has expired. Reload and try again.";
  }

  if (requirePolicyAcceptance && input.acceptedPolicy !== "true") {
    errors.acceptedPolicy =
      "Please confirm that you have read the returns and refund policy.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      fullName,
      email,
      phone,
      countryCode,
      city,
      addressLine1,
      addressLine2: addressLine2Raw === "" ? null : addressLine2Raw,
      postalCode: postalCodeRaw === "" ? null : postalCodeRaw,
      customerNotes: customerNotesRaw === "" ? null : customerNotesRaw,
      paymentMethod: paymentMethod as PaymentMethodValue,
      idempotencyKey,
    },
  };
}
