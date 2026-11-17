/**
 * Courier fulfilment workflow on an order (T026A/T026B).
 *
 * Deliberately separate from payment status, order status, production status,
 * and the public delivery estimate. Only an administrator may advance it, and
 * only along the approved workflow. It is never changed automatically by
 * payment verification or any other order event: a courier "DELIVERED" event
 * never marks the order itself delivered.
 *
 * Dependency-free for unit tests.
 */

export const COURIER_FULFILMENT_STATUSES = [
  "NOT_BOOKED",
  "BOOKED",
  "IN_TRANSIT",
  "DELIVERED",
  "EXCEPTION",
  "RETURNED",
  "CANCELLED",
] as const;

export type CourierFulfilmentState =
  (typeof COURIER_FULFILMENT_STATUSES)[number];

const TRANSITIONS: Record<CourierFulfilmentState, readonly CourierFulfilmentState[]> = {
  NOT_BOOKED: ["BOOKED", "CANCELLED"],
  BOOKED: ["IN_TRANSIT", "EXCEPTION", "CANCELLED"],
  IN_TRANSIT: ["DELIVERED", "EXCEPTION", "RETURNED", "CANCELLED"],
  DELIVERED: ["RETURNED"],
  EXCEPTION: ["IN_TRANSIT", "RETURNED", "CANCELLED"],
  RETURNED: [],
  CANCELLED: [],
};

export const COURIER_FULFILMENT_STATUS_LABELS: Record<CourierFulfilmentState, string> = {
  NOT_BOOKED: "Not booked with a courier",
  BOOKED: "Booked with the courier",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered by courier",
  EXCEPTION: "Courier exception",
  RETURNED: "Returned via courier",
  CANCELLED: "Courier booking cancelled",
};

export function isCourierFulfilmentStatus(
  value: string,
): value is CourierFulfilmentState {
  return (
    COURIER_FULFILMENT_STATUSES as readonly string[]
  ).includes(value);
}

export function canTransitionCourierFulfilment(
  from: CourierFulfilmentState,
  to: CourierFulfilmentState,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function getAllowedCourierFulfilmentTransitions(
  from: CourierFulfilmentState,
): CourierFulfilmentState[] {
  return [...TRANSITIONS[from]];
}

export function courierFulfilmentStatusLabel(
  status: CourierFulfilmentState,
): string {
  return COURIER_FULFILMENT_STATUS_LABELS[status];
}
