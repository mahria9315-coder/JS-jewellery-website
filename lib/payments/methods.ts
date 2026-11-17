import {
  getBankTransferConfig,
  getEasypaisaConfig,
  type PaymentMethodId,
} from "./config";

/**
 * Server-only payment method metadata and instructions.
 *
 * `getCheckoutPaymentMethods` returns only booleans and labels and is safe to
 * pass to a client component. `getPaymentInstructions` returns the actual
 * account details and must only be rendered inside a server component after
 * the customer has selected a method. Never place its result in props that are
 * serialised to a client component.
 */

export type CheckoutPaymentMethod = {
  id: PaymentMethodId;
  label: string;
  configured: boolean;
  missingEnvKeys: string[];
};

export type PaymentInstructions = {
  method: PaymentMethodId;
  label: string;
  bankDisplayName?: string;
  accountNumber: string;
  accountHolder: string | null;
};

export function getCheckoutPaymentMethods(): CheckoutPaymentMethod[] {
  const bank = getBankTransferConfig();
  const easypaisa = getEasypaisaConfig();

  return [
    {
      id: "bank-transfer",
      label: "Bank Transfer",
      configured: bank.isConfigured,
      missingEnvKeys: bank.missingEnvKeys,
    },
    {
      id: "easypaisa",
      label: "Easypaisa",
      configured: easypaisa.isConfigured,
      missingEnvKeys: easypaisa.missingEnvKeys,
    },
  ];
}

export function isPaymentMethodConfigured(method: PaymentMethodId): boolean {
  return method === "bank-transfer"
    ? getBankTransferConfig().isConfigured
    : getEasypaisaConfig().isConfigured;
}

/**
 * Return the full instructions for a configured method, or null when the
 * account details have not been supplied through server-only configuration.
 */
export function getPaymentInstructions(
  method: PaymentMethodId,
): PaymentInstructions | null {
  if (method === "bank-transfer") {
    const config = getBankTransferConfig();

    if (!config.isConfigured || !config.accountNumber) {
      return null;
    }

    return {
      method: "bank-transfer",
      label: "Bank Transfer",
      bankDisplayName: config.displayName,
      accountNumber: config.accountNumber,
      accountHolder: config.accountHolder,
    };
  }

  const config = getEasypaisaConfig();

  if (!config.isConfigured || !config.accountNumber) {
    return null;
  }

  return {
    method: "easypaisa",
    label: "Easypaisa",
    accountNumber: config.accountNumber,
    accountHolder: config.accountHolder,
  };
}
