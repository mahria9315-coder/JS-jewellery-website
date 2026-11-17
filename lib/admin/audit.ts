import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";

/**
 * Audit trail for sensitive administrator actions. Never include payment
 * account numbers, passwords, supplier documents, or customer card data.
 */
export async function recordAdminAudit(input: {
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  await getDb().adminAuditLog.create({
    data: {
      actor: input.actor,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      ...(input.metadata
        ? { metadata: input.metadata as Prisma.InputJsonValue }
        : {}),
    },
  });
}

export async function listRecentAuditLogs(limit = 100) {
  return getDb().adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listEntityAuditLogs(
  entityType: string,
  entityId: string,
  limit = 20,
) {
  return getDb().adminAuditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
