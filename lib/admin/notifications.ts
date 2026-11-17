import { getDb, isDatabaseConfigured } from "@/lib/db";

/**
 * Real, permission-scoped counters for the administration header. Nothing is
 * fabricated: a failed query degrades to zero rather than inventing activity.
 */
export async function getAdminNotificationCounts(
  permissions: readonly string[],
): Promise<{ pendingPayments: number; openReturns: number }> {
  const canSeePayments =
    permissions.includes("payments.view") || permissions.includes("orders.view");
  const canSeeReturns = permissions.includes("returns.view");

  if (!isDatabaseConfigured() || (!canSeePayments && !canSeeReturns)) {
    return { pendingPayments: 0, openReturns: 0 };
  }

  try {
    const db = getDb();
    const [pendingPayments, openReturns] = await Promise.all([
      canSeePayments
        ? db.order.count({ where: { paymentStatus: "SUBMITTED" } })
        : Promise.resolve(0),
      canSeeReturns
        ? db.returnRequest.count({
            where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] } },
          })
        : Promise.resolve(0),
    ]);

    return { pendingPayments, openReturns };
  } catch {
    return { pendingPayments: 0, openReturns: 0 };
  }
}
