/**
 * Server-only payment configuration.
 *
 * The client has approved two payment methods:
 *   1. Bank Transfer — Islamic Bank.
 *   2. Easypaisa.
 *
 * The actual account numbers and any account-holder names must come from
 * server-side environment variables. They must never be prefixed with
 * `NEXT_PUBLIC_`, imported into a client component, rendered on a public page,
 * logged, committed, or included in a report. This module must only be imported
 * by server-side code.
 *
 * T052 now consumes this module from server-only checkout, order-confirmation,
 * and admin verification code. Payment instructions are rendered only after a
 * customer selects a method, and no payment is ever marked received or verified
 * automatically.
 */

export const APPROVED_BANK_DISPLAY_NAME = "Islamic Bank";

export const PAYMENT_ENV_KEYS = {
  bankDisplayName: "PAYMENT_BANK_DISPLAY_NAME",
  bankAccountNumber: "PAYMENT_BANK_ACCOUNT_NUMBER",
  bankAccountHolder: "PAYMENT_BANK_ACCOUNT_HOLDER",
  easypaisaNumber: "PAYMENT_EASYPAISA_NUMBER",
  easypaisaAccountHolder: "PAYMENT_EASYPAISA_ACCOUNT_HOLDER",
} as const;

export type PaymentMethodId = "bank-transfer" | "easypaisa";

export type PaymentMethodConfig = {
  id: PaymentMethodId;
  displayName: string;
  /** Full instructions are server-only and must never be serialised publicly. */
  accountNumber: string | null;
  accountHolder: string | null;
  isConfigured: boolean;
  missingEnvKeys: string[];
};

export type PaymentConfigurationStatus = {
  checkoutImplemented: true;
  bankTransfer: {
    configured: boolean;
    missingEnvKeys: string[];
    accountHolderConfigured: boolean;
  };
  easypaisa: {
    configured: boolean;
    missingEnvKeys: string[];
    accountHolderConfigured: boolean;
  };
};

function assertServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "Payment configuration is server-only and must not be imported into client code.",
    );
  }
}

function readServerEnv(key: string): string | null {
  assertServerOnly();
  const value = process.env[key]?.trim();
  return value ? value : null;
}

/**
 * Read a server-only account value with conservative structural validation.
 *
 * Invalid values are treated as not configured so a method can never be shown
 * with malformed instructions. The value itself is never logged or returned in
 * a status report; only the variable name is recorded as missing.
 */
function readAccountValue(key: string, maxLength: number): string | null {
  const value = readServerEnv(key);

  if (!value || value.length > maxLength || /[\u0000-\u001f\u007f]/.test(value)) {
    return null;
  }

  return value;
}

/** Optional, non-secret bank display name with the approved fallback. */
function resolveBankDisplayName(): string {
  const configured = readServerEnv(PAYMENT_ENV_KEYS.bankDisplayName);

  if (
    configured &&
    configured.length >= 2 &&
    configured.length <= 80 &&
    !/[\u0000-\u001f\u007f]/.test(configured)
  ) {
    return configured;
  }

  return APPROVED_BANK_DISPLAY_NAME;
}

/**
 * Return the full Bank Transfer configuration for a server-side payment step.
 * Never send this object to the browser, log it, or include its values in
 * documentation, screenshots, test output, or reports.
 */
export function getBankTransferConfig(): PaymentMethodConfig {
  const accountNumber = readAccountValue(
    PAYMENT_ENV_KEYS.bankAccountNumber,
    120,
  );
  const accountHolder = readAccountValue(
    PAYMENT_ENV_KEYS.bankAccountHolder,
    120,
  );

  // `PAYMENT_BANK_DISPLAY_NAME` is optional and non-secret. When absent or
  // invalid, the owner-approved fallback name is used.
  const displayName = resolveBankDisplayName();

  const missingEnvKeys: string[] = [];

  if (!accountNumber) {
    missingEnvKeys.push(PAYMENT_ENV_KEYS.bankAccountNumber);
  }

  if (!accountHolder) {
    missingEnvKeys.push(PAYMENT_ENV_KEYS.bankAccountHolder);
  }

  return {
    id: "bank-transfer",
    displayName,
    accountNumber,
    accountHolder,
    isConfigured: missingEnvKeys.length === 0,
    missingEnvKeys,
  };
}

/**
 * Return the full Easypaisa configuration for a server-side payment step. The
 * same handling rules as `getBankTransferConfig` apply.
 */
export function getEasypaisaConfig(): PaymentMethodConfig {
  const accountNumber = readAccountValue(
    PAYMENT_ENV_KEYS.easypaisaNumber,
    120,
  );
  const accountHolder = readAccountValue(
    PAYMENT_ENV_KEYS.easypaisaAccountHolder,
    120,
  );

  const missingEnvKeys: string[] = [];

  if (!accountNumber) {
    missingEnvKeys.push(PAYMENT_ENV_KEYS.easypaisaNumber);
  }

  if (!accountHolder) {
    missingEnvKeys.push(PAYMENT_ENV_KEYS.easypaisaAccountHolder);
  }

  return {
    id: "easypaisa",
    displayName: "Easypaisa",
    accountNumber,
    accountHolder,
    isConfigured: missingEnvKeys.length === 0,
    missingEnvKeys,
  };
}

/**
 * Safe status summary for internal checks and documentation. It exposes only
 * booleans and environment-variable names, never the values themselves.
 */
export function getPaymentConfigurationStatus(): PaymentConfigurationStatus {
  const bankTransfer = getBankTransferConfig();
  const easypaisa = getEasypaisaConfig();

  return {
    checkoutImplemented: true,
    bankTransfer: {
      configured: bankTransfer.isConfigured,
      missingEnvKeys: bankTransfer.missingEnvKeys,
      accountHolderConfigured: Boolean(bankTransfer.accountHolder),
    },
    easypaisa: {
      configured: easypaisa.isConfigured,
      missingEnvKeys: easypaisa.missingEnvKeys,
      accountHolderConfigured: Boolean(easypaisa.accountHolder),
    },
  };
}
