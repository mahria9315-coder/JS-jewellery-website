/**
 * Customer-facing order status transitions.
 *
 * Only an administrator may change order status. Each transition represents a
 * real operational step, so the admin UI requires a note/evidence reference.
 * Supplier settlement and payment status remain separate.
 *
 * Dependency-free for unit tests.
 */

export const ORDER_STATUSES = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "FORWARDED",
  "SUPPLIER_PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export type OrderState = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderState, readonly OrderState[]> = {
  PENDING_CONFIRMATION: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["FORWARDED", "CANCELLED"],
  FORWARDED: ["SUPPLIER_PROCESSING"],
  SUPPLIER_PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

export function isOrderState(value: string): value is OrderState {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function canTransitionOrder(
  from: OrderState,
  to: OrderState,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function getAllowedOrderTransitions(from: OrderState): OrderState[] {
  return [...TRANSITIONS[from]];
}

export function isCancellableStatus(status: OrderState): boolean {
  return status === "PENDING_CONFIRMATION" || status === "CONFIRMED";
}

export const ORDER_STATUS_LABELS: Record<OrderState, string> = {
  PENDING_CONFIRMATION: "Pending confirmation",
  CONFIRMED: "Confirmed",
  FORWARDED: "Forwarded to supplier",
  SUPPLIER_PROCESSING: "Supplier processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export function orderStatusLabel(status: OrderState): string {
  return ORDER_STATUS_LABELS[status];
}
