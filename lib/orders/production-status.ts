/**
 * Production status workflow (T016).
 *
 * Production status is deliberately separate from payment status, order status,
 * and delivery status. Only an administrator may advance it, and only along the
 * approved linear workflow. It is never changed automatically by payment
 * verification or any other order event.
 *
 * Dependency-free for unit tests.
 */

export const PRODUCTION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PRODUCTION",
  "COMPLETED",
] as const;

export type ProductionState = (typeof PRODUCTION_STATUSES)[number];

const TRANSITIONS: Record<ProductionState, readonly ProductionState[]> = {
  PENDING: ["CONFIRMED"],
  CONFIRMED: ["IN_PRODUCTION"],
  IN_PRODUCTION: ["COMPLETED"],
  COMPLETED: [],
};

export const PRODUCTION_STATUS_LABELS: Record<ProductionState, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In production",
  COMPLETED: "Completed",
};

export function isProductionState(value: string): value is ProductionState {
  return (PRODUCTION_STATUSES as readonly string[]).includes(value);
}

export function canTransitionProduction(
  from: ProductionState,
  to: ProductionState,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function getAllowedProductionTransitions(
  from: ProductionState,
): ProductionState[] {
  return [...TRANSITIONS[from]];
}

export function productionStatusLabel(status: ProductionState): string {
  return PRODUCTION_STATUS_LABELS[status];
}
