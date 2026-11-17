import { getDb } from "@/lib/db";
import {
  canTransitionOrder,
  isOrderState,
  type OrderState,
} from "@/lib/orders/status";
import {
  canTransitionProduction,
  isProductionState,
  type ProductionState,
} from "@/lib/orders/production-status";
import {
  canTransitionCourierFulfilment,
  getAllowedCourierFulfilmentTransitions,
  isCourierFulfilmentStatus,
  type CourierFulfilmentState,
} from "@/lib/orders/courier-status";
import { validateTrackingReference } from "@/lib/couriers/config";

export class OrderStatusError extends Error {
  readonly code: "NOT_FOUND" | "INVALID_TRANSITION" | "INVALID_INPUT";
  readonly validTargets: OrderState[];

  constructor(
    code: OrderStatusError["code"],
    message: string,
    validTargets: OrderState[] = [],
  ) {
    super(message);
    this.name = "OrderStatusError";
    this.code = code;
    this.validTargets = validTargets;
  }
}

export class ProductionStatusError extends Error {
  readonly code: "NOT_FOUND" | "INVALID_TRANSITION" | "INVALID_INPUT";
  readonly validTargets: ProductionState[];

  constructor(
    code: ProductionStatusError["code"],
    message: string,
    validTargets: ProductionState[] = [],
  ) {
    super(message);
    this.name = "ProductionStatusError";
    this.code = code;
    this.validTargets = validTargets;
  }
}

export class CourierUpdateError extends Error {
  readonly code: "NOT_FOUND" | "INVALID_TRANSITION" | "INVALID_INPUT";
  readonly validTargets: CourierFulfilmentState[];

  constructor(
    code: CourierUpdateError["code"],
    message: string,
    validTargets: CourierFulfilmentState[] = [],
  ) {
    super(message);
    this.name = "CourierUpdateError";
    this.code = code;
    this.validTargets = validTargets;
  }
}

export async function saveOrderInternalNote(input: {
  orderId: string;
  note: string;
  actor: string;
}) {
  const note = input.note.trim();

  if (note.length < 3 || note.length > 4000) {
    throw new OrderStatusError(
      "INVALID_INPUT",
      "Enter an internal note of 3-4000 characters.",
    );
  }

  const updated = await getDb().order.updateMany({
    where: { id: input.orderId },
    data: { internalNotes: note },
  });

  if (updated.count === 0) {
    throw new OrderStatusError("NOT_FOUND", "Order not found.");
  }

  await getDb().adminAuditLog.create({
    data: {
      actor: input.actor,
      action: "order.note.update",
      entityType: "Order",
      entityId: input.orderId,
      summary: "Updated the private order note.",
    },
  });
}

export async function updateOrderStatus(input: {
  orderId: string;
  to: string;
  note: string;
  actor: string;
}) {
  if (!isOrderState(input.to)) {
    throw new OrderStatusError("INVALID_INPUT", "Choose a valid order status.");
  }

  const to = input.to;

  const db = getDb();
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    select: {
      id: true,
      orderStatus: true,
      items: { select: { productId: true, productName: true, quantity: true } },
    },
  });

  if (!order) {
    throw new OrderStatusError("NOT_FOUND", "Order not found.");
  }

  const from = order.orderStatus as OrderState;

  if (!canTransitionOrder(from, to)) {
    throw new OrderStatusError(
      "INVALID_TRANSITION",
      `Cannot move an order from ${from.toLowerCase()} to ${to.toLowerCase()}.`,
    );
  }

  const note = input.note.trim().slice(0, 500);

  if (note.length < 3) {
    throw new OrderStatusError(
      "INVALID_INPUT",
      "Record a short note or evidence reference for this status change (at least 3 characters).",
    );
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { orderStatus: to },
    });

    await tx.orderStatusEvent.create({
      data: {
        orderId: order.id,
        fromStatus: from,
        toStatus: to,
        note,
        actorType: "ADMIN",
        actorLabel: input.actor,
      },
    });

    // T016: production status is separate and is never advanced by order or
    // payment transitions. It only changes through updateProductionStatus.


    // Cancelling a pending order releases stock that was reserved at checkout.
    // Only adjust tracked inventory (non-null stockQuantity); untracked products
    // must not have stock or inventory movements synthesized here.
    if (to === "CANCELLED") {
      for (const item of order.items) {
        if (!item.productId) continue;

        const before = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockQuantity: true },
        });

        if (!before || before.stockQuantity === null) {
          continue;
        }

        const updated = await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
          select: { stockQuantity: true },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            delta: item.quantity,
            previousStock: before.stockQuantity,
            newStock: updated.stockQuantity,
            reason: "ORDER_CANCELLED",
            note: `Stock returned for cancelled order ${order.id}.`,
            actor: input.actor,
          },
        });
      }
    }

    await tx.adminAuditLog.create({
      data: {
        actor: input.actor,
        action: "order.status.update",
        entityType: "Order",
        entityId: order.id,
        summary: `Order status changed from ${from} to ${to}.`,
        metadata: { from, to, note },
      },
    });
  });
}

/**
 * T016: advance the separate production workflow.
 *
 * Only an administrator (enforced by the caller's permission check) may call
 * this. The transition is linear and starts at PENDING. Payment verification,
 * order status changes, and fulfilment never touch this field.
 */
export async function updateProductionStatus(input: {
  orderId: string;
  to: string;
  note: string;
  actor: string;
}) {
  if (!isProductionState(input.to)) {
    throw new ProductionStatusError(
      "INVALID_INPUT",
      "Choose a valid production status.",
    );
  }

  const to = input.to;
  const db = getDb();
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    select: { id: true, productionStatus: true },
  });

  if (!order) {
    throw new ProductionStatusError("NOT_FOUND", "Order not found.");
  }

  const from = order.productionStatus as ProductionState;

  if (!canTransitionProduction(from, to)) {
    throw new ProductionStatusError(
      "INVALID_TRANSITION",
      `Cannot move production from ${from.toLowerCase()} to ${to.toLowerCase()}.`,
      [],
    );
  }

  const note = input.note.trim().slice(0, 500);

  if (note.length < 3) {
    throw new ProductionStatusError(
      "INVALID_INPUT",
      "Record a short note or evidence reference for this production change (at least 3 characters).",
    );
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { productionStatus: to },
    });

    await tx.orderProductionStatusEvent.create({
      data: {
        orderId: order.id,
        fromStatus: from,
        toStatus: to,
        note,
        actorType: "ADMIN",
        actorLabel: input.actor,
      },
    });

    await tx.adminAuditLog.create({
      data: {
        actor: input.actor,
        action: "order.production.update",
        entityType: "Order",
        entityId: order.id,
        summary: `Production status changed from ${from} to ${to}.`,
        metadata: { from, to, note },
      },
    });
  });
}

/**
 * T026A/T026B: update the courier tracking reference and fulfilment status of
 * an order.
 *
 * This workflow is separate from order status, payment status, and production
 * status, and it never advances any of them: a courier "DELIVERED" update does
 * not mark the order delivered. Only an administrator (enforced by the
 * caller's permission check) may change it, every change requires an
 * evidence note, and the tracking reference is validated against the
 * courier's documented format.
 */
export async function updateOrderCourier(input: {
  orderId: string;
  courierTrackingNumber: string;
  courierFulfilmentStatus: string;
  note: string;
  actor: string;
}) {
  if (!isCourierFulfilmentStatus(input.courierFulfilmentStatus)) {
    throw new CourierUpdateError(
      "INVALID_INPUT",
      "Choose a valid courier fulfilment status.",
    );
  }

  const to = input.courierFulfilmentStatus;
  const db = getDb();
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    select: {
      id: true,
      orderNumber: true,
      courierCode: true,
      courierName: true,
      courierTrackingNumber: true,
      courierFulfilmentStatus: true,
    },
  });

  if (!order) {
    throw new CourierUpdateError("NOT_FOUND", "Order not found.");
  }

  if (order.courierCode === null || order.courierCode === "") {
    throw new CourierUpdateError(
      "INVALID_INPUT",
      "This order was created without an approved courier. Record the courier booking in the internal note instead.",
    );
  }

  const trackingInput = input.courierTrackingNumber.trim();

  if (trackingInput !== "") {
    const tracking = validateTrackingReference(
      order.courierName ?? "courier",
      trackingInput,
    );

    if (!tracking.ok) {
      throw new CourierUpdateError("INVALID_INPUT", tracking.error);
    }
  }

  const note = input.note.trim().slice(0, 500);

  if (note.length < 3) {
    throw new CourierUpdateError(
      "INVALID_INPUT",
      "Record a short note or evidence reference for this courier change (at least 3 characters).",
    );
  }

  const from = order.courierFulfilmentStatus as CourierFulfilmentState;

  if (!canTransitionCourierFulfilment(from, to)) {
    throw new CourierUpdateError(
      "INVALID_TRANSITION",
      `Cannot move the courier shipment from ${from.toLowerCase().replaceAll("_", " ")} to ${to.toLowerCase().replaceAll("_", " ")}.`,
      getAllowedCourierFulfilmentTransitions(from),
    );
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        courierTrackingNumber: trackingInput === "" ? null : trackingInput,
        courierFulfilmentStatus: to,
      },
    });

    await tx.adminAuditLog.create({
      data: {
        actor: input.actor,
        action: "order.courier.update",
        entityType: "Order",
        entityId: order.id,
        summary: `Courier shipment moved from ${from} to ${to} on order ${order.orderNumber}.`,
        metadata: {
          courierCode: order.courierCode,
          from,
          to,
          trackingNumber: trackingInput === "" ? null : trackingInput,
          note,
        },
      },
    });
  });
}
