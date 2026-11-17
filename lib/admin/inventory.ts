import { getDb } from "@/lib/db";

import { recordAdminAudit } from "./audit";

/**
 * Inventory adjustments and stock movement history.
 *
 * Every change is applied inside a transaction and recorded as a movement.
 * Decrements use a conditional update so two concurrent adjustments cannot
 * take stock below zero.
 */

export const INVENTORY_REASONS = [
  "STOCK_RECEIVED",
  "SUPPLIER_CORRECTION",
  "DAMAGED",
  "RETURN_RESTOCK",
  "MANUAL_ADJUSTMENT",
  "STOCK_TAKE",
] as const;

export type InventoryReason = (typeof INVENTORY_REASONS)[number];

export class InventoryError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "InventoryError";
    this.field = field;
  }
}

export function isInventoryReason(value: string): value is InventoryReason {
  return (INVENTORY_REASONS as readonly string[]).includes(value);
}

export const INVENTORY_REASON_LABELS: Record<InventoryReason, string> = {
  STOCK_RECEIVED: "Stock received",
  SUPPLIER_CORRECTION: "Supplier correction",
  DAMAGED: "Damaged / unsellable",
  RETURN_RESTOCK: "Return restocked",
  MANUAL_ADJUSTMENT: "Manual adjustment",
  STOCK_TAKE: "Stock take",
};

export async function listInventory(search?: string) {
  const db = getDb();
  const query = search?.trim();

  return db.product.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ isArchived: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      sku: true,
      slug: true,
      stockQuantity: true,
      lowStockThreshold: true,
      availability: true,
      publicationStatus: true,
      isArchived: true,
      updatedAt: true,
      _count: { select: { inventoryMovements: true } },
    },
  });
}

export async function getInventoryProduct(id: string) {
  return getDb().product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      sku: true,
      slug: true,
      stockQuantity: true,
      lowStockThreshold: true,
      availability: true,
      publicationStatus: true,
      inventoryMovements: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          delta: true,
          previousStock: true,
          newStock: true,
          reason: true,
          note: true,
          actor: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function listRecentInventoryMovements(limit = 100) {
  return getDb().inventoryMovement.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      delta: true,
      previousStock: true,
      newStock: true,
      reason: true,
      note: true,
      actor: true,
      createdAt: true,
      product: { select: { id: true, name: true, sku: true } },
    },
  });
}

export async function adjustInventory(input: {
  productId: string;
  delta: number;
  reason: string;
  note: string;
  actor: string;
}) {
  if (!Number.isInteger(input.delta) || input.delta === 0) {
    throw new InventoryError("delta", "Enter a non-zero whole-number change.");
  }

  if (Math.abs(input.delta) > 100000) {
    throw new InventoryError("delta", "The change is too large.");
  }

  if (!isInventoryReason(input.reason)) {
    throw new InventoryError("reason", "Choose a valid adjustment reason.");
  }

  const note = input.note.trim();

  if (note.length < 3 || note.length > 500) {
    throw new InventoryError(
      "note",
      "Record a short note or reference (3-500 characters).",
    );
  }

  const db = getDb();

  return db.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: input.productId },
      select: { id: true, name: true, stockQuantity: true },
    });

    if (!product) {
      throw new InventoryError("productId", "Product not found.");
    }

    if (product.stockQuantity === null) {
      throw new InventoryError(
        "productId",
        "This product has no supplier-confirmed stock count. Record a confirmed count before adjusting stock.",
      );
    }

    if (input.delta < 0) {
      const updated = await tx.product.updateMany({
        where: {
          id: product.id,
          stockQuantity: { gte: Math.abs(input.delta) },
        },
        data: { stockQuantity: { decrement: Math.abs(input.delta) } },
      });

      if (updated.count === 0) {
        throw new InventoryError(
          "delta",
          "This adjustment would make stock negative. Verify the physical count first.",
        );
      }
    } else {
      await tx.product.update({
        where: { id: product.id },
        data: { stockQuantity: { increment: input.delta } },
      });
    }

    const after = await tx.product.findUnique({
      where: { id: product.id },
      select: { stockQuantity: true },
    });
    const newStock = after?.stockQuantity ?? null;

    const movement = await tx.inventoryMovement.create({
      data: {
        productId: product.id,
        delta: input.delta,
        previousStock: product.stockQuantity,
        newStock,
        reason: input.reason,
        note,
        actor: input.actor,
      },
      select: { id: true },
    });

    await tx.adminAuditLog.create({
      data: {
        actor: input.actor,
        action: "inventory.adjust",
        entityType: "Product",
        entityId: product.id,
        summary: `Adjusted stock by ${input.delta >= 0 ? "+" : ""}${input.delta}.`,
        metadata: { reason: input.reason, previous: product.stockQuantity, new: newStock },
      },
    });

    return { movementId: movement.id, newStock };
  });
}

export async function updateLowStockThreshold(
  input: { productId: string; threshold: number; actor: string },
) {
  if (!Number.isInteger(input.threshold) || input.threshold < 0 || input.threshold > 100000) {
    throw new InventoryError("threshold", "Enter a whole-number threshold.");
  }

  const updated = await getDb().product.updateMany({
    where: { id: input.productId },
    data: { lowStockThreshold: input.threshold },
  });

  if (updated.count === 0) {
    throw new InventoryError("productId", "Product not found.");
  }

  await recordAdminAudit({
    actor: input.actor,
    action: "inventory.threshold",
    entityType: "Product",
    entityId: input.productId,
    summary: "Updated the low-stock threshold.",
    metadata: { threshold: input.threshold },
  });
}
