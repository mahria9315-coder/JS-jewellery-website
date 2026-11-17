import type { PaymentMethodId } from "./config";

/**
 * A unique, customer-quoted payment reference derived from the order number.
 * The order number is already unique, so this reference is unique as well.
 */
export function formatPaymentReference(orderNumber: string): string {
  return `PAY-${orderNumber}`;
}

export type PaymentMethodSlug = "bank-transfer" | "easypaisa";

export function toDatabasePaymentMethod(
  method: PaymentMethodId,
): "BANK_TRANSFER" | "EASYPAISA" {
  return method === "bank-transfer" ? "BANK_TRANSFER" : "EASYPAISA";
}

export function fromDatabasePaymentMethod(
  method: "BANK_TRANSFER" | "EASYPAISA",
): PaymentMethodId {
  return method === "BANK_TRANSFER" ? "bank-transfer" : "easypaisa";
}

export function isPaymentMethodId(value: string): value is PaymentMethodId {
  return value === "bank-transfer" || value === "easypaisa";
}

export function paymentMethodLabel(method: PaymentMethodId): string {
  return method === "bank-transfer" ? "Bank Transfer" : "Easypaisa";
}
