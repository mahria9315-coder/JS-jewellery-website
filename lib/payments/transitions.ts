/**
 * Manual payment state machine.
 *
 * Bank Transfer and Easypaisa are manual methods. A customer may submit proof
 * or a transaction reference, but only an authorised administrator can verify
 * or reject a payment. Money is never treated as received automatically.
 *
 * This module is deliberately dependency-free so it can be unit-tested with
 * Node's built-in test runner.
 */

export const PAYMENT_STATUSES = [
  "PENDING",
  "SUBMITTED",
  "VERIFIED",
  "REJECTED",
  "REFUNDED",
] as const;

export type PaymentState = (typeof PAYMENT_STATUSES)[number];

export type PaymentActor = "CUSTOMER" | "ADMIN" | "SYSTEM";

type TransitionRule = {
  readonly to: PaymentState;
  readonly actors: readonly PaymentActor[];
};

/**
 * Allowed transitions:
 * - PENDING -> SUBMITTED   customer submits a payment reference
 * - PENDING -> REJECTED    admin rejects an invalid/unpaid order
 * - SUBMITTED -> VERIFIED  admin confirms the money arrived
 * - SUBMITTED -> REJECTED  admin rejects the submitted payment
 * - REJECTED -> SUBMITTED  customer resubmits corrected information
 * - VERIFIED -> REFUNDED   admin records a completed refund
 *
 * Everything else is denied. In particular a customer can never verify, and a
 * payment can never jump from PENDING straight to VERIFIED.
 */
const TRANSITIONS: Record<PaymentState, readonly TransitionRule[]> = {
  PENDING: [
    { to: "SUBMITTED", actors: ["CUSTOMER"] },
    { to: "REJECTED", actors: ["ADMIN"] },
  ],
  SUBMITTED: [
    { to: "VERIFIED", actors: ["ADMIN"] },
    { to: "REJECTED", actors: ["ADMIN"] },
  ],
  VERIFIED: [{ to: "REFUNDED", actors: ["ADMIN"] }],
  REJECTED: [{ to: "SUBMITTED", actors: ["CUSTOMER"] }],
  REFUNDED: [],
};

export function isPaymentState(value: string): value is PaymentState {
  return (PAYMENT_STATUSES as readonly string[]).includes(value);
}

export function canTransitionPayment(
  from: PaymentState,
  to: PaymentState,
  actor: PaymentActor,
): boolean {
  return TRANSITIONS[from].some(
    (rule) => rule.to === to && rule.actors.includes(actor),
  );
}

export function getAllowedPaymentTransitions(
  from: PaymentState,
  actor: PaymentActor,
): PaymentState[] {
  return TRANSITIONS[from]
    .filter((rule) => rule.actors.includes(actor))
    .map((rule) => rule.to);
}

export const PAYMENT_STATUS_LABELS: Record<PaymentState, string> = {
  PENDING: "Pending payment",
  SUBMITTED: "Payment submitted",
  VERIFIED: "Payment verified",
  REJECTED: "Payment rejected",
  REFUNDED: "Refunded",
};

export function paymentStatusLabel(status: PaymentState): string {
  return PAYMENT_STATUS_LABELS[status];
}
