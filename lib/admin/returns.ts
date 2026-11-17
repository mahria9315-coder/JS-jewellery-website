import { safeStringEqual } from "@/lib/admin/auth-crypto";
import { getDb } from "@/lib/db";
import { getCountryReturnPolicy } from "@/lib/returns-policy";
import {
  calculateRefund,
  isProtectedReturnReason,
  isReturnReason,
  resolveDeduction,
  type RefundCalculation,
  type ReturnReason,
} from "@/lib/returns/refund";

/**
 * Customer return requests and administrator refund processing.
 *
 * The refund amount is always calculated on the server from the approved
 * country policy. A customer chooses a reason, never a deduction or amount.
 * Protected cases (defective, damaged, incorrect, other protected issue) never
 * lose the 25% change-of-mind deduction.
 */

export class ReturnActionError extends Error {
  readonly code:
    | "NOT_FOUND"
    | "INVALID_INPUT"
    | "NOT_DELIVERED"
    | "OUTSIDE_WINDOW"
    | "PAYMENT_NOT_VERIFIED"
    | "DUPLICATE_REQUEST"
    | "INVALID_TRANSITION";

  constructor(code: ReturnActionError["code"], message: string) {
    super(message);
    this.name = "ReturnActionError";
    this.code = code;
  }
}

function cleanExplanation(value: string): string {
  const cleaned = value.trim();

  if (
    cleaned.length < 10 ||
    cleaned.length > 2000 ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(cleaned)
  ) {
    throw new ReturnActionError(
      "INVALID_INPUT",
      "Explain the return in 10-2000 characters.",
    );
  }

  return cleaned;
}

function cleanAdminNotes(value: string): string {
  const cleaned = value.trim().slice(0, 1000);

  if (
    cleaned.length < 3 ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(cleaned)
  ) {
    throw new ReturnActionError(
      "INVALID_INPUT",
      "Add a short review note (at least 3 characters).",
    );
  }

  return cleaned;
}

/**
 * Determine whether the delivery timestamp is inside the configured
 * change-of-mind window. Protected cases ignore the window because statutory
 * remedies are separate from the commercial change-of-mind terms.
 */
function isInsideWindow(
  deliveredAt: Date | null,
  windowDays: number | null,
  now: Date,
): boolean {
  if (!deliveredAt || windowDays === null) {
    return false;
  }

  const deadline = deliveredAt.getTime() + windowDays * 24 * 60 * 60 * 1000;
  return now.getTime() <= deadline;
}

function computeRefund(input: {
  countryCode: string;
  reason: ReturnReason;
  amountPaidMinor: number;
}): RefundCalculation {
  const policy = getCountryReturnPolicy(input.countryCode);
  const rule = resolveDeduction(
    {
      status: policy.status,
      changeOfMindDeductionPercent: policy.changeOfMindDeductionPercent,
    },
    input.reason,
  );

  return calculateRefund({
    amountPaidMinor: input.amountPaidMinor,
    reason: input.reason,
    deductionPercent: rule.percent,
    deductionPermitted: rule.permitted,
  });
}

export type ReturnEligibility = {
  eligible: boolean;
  reason: string;
  deliveredAt: Date | null;
  windowDays: number | null;
  policyStatus: string;
};

/** Read-only eligibility preview for the customer order page. */
export async function getReturnEligibility(
  orderNumber: string,
  accessToken: string,
): Promise<ReturnEligibility> {
  const order = await getDb().order.findUnique({
    where: { orderNumber },
    select: {
      accessToken: true,
      countryCode: true,
      orderStatus: true,
      paymentStatus: true,
      statusEvents: {
        where: { toStatus: "DELIVERED" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  if (!order || !safeStringEqual(order.accessToken, accessToken)) {
    return {
      eligible: false,
      reason: "Order not found.",
      deliveredAt: null,
      windowDays: null,
      policyStatus: "unknown",
    };
  }

  const policy = getCountryReturnPolicy(order.countryCode);
  const deliveredAt = order.statusEvents[0]?.createdAt ?? null;

  if (order.paymentStatus !== "VERIFIED" && order.paymentStatus !== "REFUNDED") {
    return {
      eligible: false,
      reason: "A return can be requested after the payment has been verified.",
      deliveredAt,
      windowDays: policy.changeOfMindWindowDays,
      policyStatus: policy.status,
    };
  }

  if (order.orderStatus !== "DELIVERED") {
    return {
      eligible: false,
      reason: "A return can be requested after the order is marked delivered.",
      deliveredAt,
      windowDays: policy.changeOfMindWindowDays,
      policyStatus: policy.status,
    };
  }

  const windowText =
    policy.changeOfMindWindowDays != null
      ? `${policy.changeOfMindWindowDays} day${policy.changeOfMindWindowDays === 1 ? "" : "s"}`
      : "the approved period";

  return {
    eligible: true,
    reason:
      policy.status === "configured"
        ? `You can submit a return request. Protected issues (defective, damaged, incorrect, or other protected cases) may be requested after delivery. Change-of-mind returns must be submitted within ${windowText} of delivery.`
        : "Return terms for this destination require confirmation before a return can be processed.",
    deliveredAt,
    windowDays: policy.changeOfMindWindowDays,
    policyStatus: policy.status,
  };
}

export async function createReturnRequest(input: {
  orderNumber: string;
  accessToken: string;
  reason: string;
  explanation: string;
}) {
  if (!isReturnReason(input.reason)) {
    throw new ReturnActionError("INVALID_INPUT", "Choose a valid return reason.");
  }

  const reason: ReturnReason = input.reason;
  const explanation = cleanExplanation(input.explanation);
  const db = getDb();

  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber: input.orderNumber },
      select: {
        id: true,
        accessToken: true,
        countryCode: true,
        orderStatus: true,
        paymentStatus: true,
        totalMinor: true,
        currency: true,
        statusEvents: {
          where: { toStatus: "DELIVERED" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        returnRequests: {
          where: {
            status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] },
          },
          select: { id: true },
        },
      },
    });

    if (!order || !safeStringEqual(order.accessToken, input.accessToken)) {
      throw new ReturnActionError("NOT_FOUND", "Order not found.");
    }

    if (order.returnRequests.length > 0) {
      throw new ReturnActionError(
        "DUPLICATE_REQUEST",
        "A return request for this order is already open.",
      );
    }

    if (order.paymentStatus !== "VERIFIED") {
      throw new ReturnActionError(
        "PAYMENT_NOT_VERIFIED",
        "A return can be requested after the payment has been verified.",
      );
    }

    if (order.orderStatus !== "DELIVERED") {
      throw new ReturnActionError(
        "NOT_DELIVERED",
        "A return can be requested after the order is marked delivered.",
      );
    }

    const policy = getCountryReturnPolicy(order.countryCode);
    const deliveredAt = order.statusEvents[0]?.createdAt ?? null;

    if (
      !isProtectedReturnReason(reason) &&
      !isInsideWindow(deliveredAt, policy.changeOfMindWindowDays, new Date())
    ) {
      throw new ReturnActionError(
        "OUTSIDE_WINDOW",
        "This change-of-mind return is outside the approved return window. Contact us if the item is defective, damaged, or incorrect.",
      );
    }

    const refund = computeRefund({
      countryCode: order.countryCode,
      reason,
      amountPaidMinor: order.totalMinor,
    });

    const request = await tx.returnRequest.create({
      data: {
        orderId: order.id,
        reason,
        explanation,
        status: "SUBMITTED",
        protectedCase: refund.protectedCase,
        eligibleForDeduction: refund.eligibleForDeduction,
        deductionPercent: refund.deductionPercent,
        deductionMinor: refund.deductionMinor,
        refundAmountMinor: refund.refundAmountMinor,
        currency: order.currency,
      },
      select: { id: true, status: true, refundAmountMinor: true },
    });

    await tx.adminAuditLog.create({
      data: {
        actor: "customer",
        action: "return.request.create",
        entityType: "ReturnRequest",
        entityId: request.id,
        summary: "Customer submitted a return request.",
        metadata: {
          orderId: order.id,
          reason,
          protectedCase: refund.protectedCase,
        },
      },
    });

    return request;
  });
}

const REVIEWABLE_STATUSES = ["SUBMITTED", "UNDER_REVIEW"] as const;

export async function listReturnRequestsForAdmin() {
  return getDb().returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      reason: true,
      status: true,
      protectedCase: true,
      deductionPercent: true,
      deductionMinor: true,
      refundAmountMinor: true,
      currency: true,
      explanation: true,
      adminNotes: true,
      createdAt: true,
      reviewedAt: true,
      refundProcessedAt: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          paymentStatus: true,
          orderStatus: true,
          totalMinor: true,
          currency: true,
        },
      },
    },
  });
}

export async function reviewReturnRequest(input: {
  returnId: string;
  actor: string;
  decision: "APPROVE" | "REJECT";
  adminNotes: string;
}) {
  const notes = cleanAdminNotes(input.adminNotes);
  const db = getDb();

  await db.$transaction(async (tx) => {
    const request = await tx.returnRequest.findUnique({
      where: { id: input.returnId },
      select: { id: true, status: true, orderId: true },
    });

    if (!request) {
      throw new ReturnActionError("NOT_FOUND", "Return request not found.");
    }

    if (
      !REVIEWABLE_STATUSES.includes(
        request.status as (typeof REVIEWABLE_STATUSES)[number],
      )
    ) {
      throw new ReturnActionError(
        "INVALID_TRANSITION",
        "This return request has already been reviewed.",
      );
    }

    const nextStatus = input.decision === "APPROVE" ? "APPROVED" : "REJECTED";

    await tx.returnRequest.update({
      where: { id: request.id },
      data: {
        status: nextStatus,
        adminNotes: notes,
        reviewedBy: input.actor,
        reviewedAt: new Date(),
      },
    });

    await tx.adminAuditLog.create({
      data: {
        actor: input.actor,
        action:
          input.decision === "APPROVE"
            ? "return.request.approve"
            : "return.request.reject",
        entityType: "ReturnRequest",
        entityId: request.id,
        summary:
          input.decision === "APPROVE"
            ? "Administrator approved a return request."
            : "Administrator rejected a return request.",
        metadata: { orderId: request.orderId, notes },
      },
    });
  });
}

/**
 * Record a completed refund. The payment must already be VERIFIED, and the
 * payment state machine permits VERIFIED -> REFUNDED for an administrator.
 */
export async function processReturnRefund(input: {
  returnId: string;
  actor: string;
  adminNotes: string;
  refundReference: string;
}) {
  const notes = cleanAdminNotes(input.adminNotes);
  const reference = input.refundReference.trim().slice(0, 120);

  if (reference.length < 3) {
    throw new ReturnActionError(
      "INVALID_INPUT",
      "Record the refund transaction reference (at least 3 characters).",
    );
  }

  const db = getDb();

  await db.$transaction(async (tx) => {
    const request = await tx.returnRequest.findUnique({
      where: { id: input.returnId },
      select: {
        id: true,
        status: true,
        refundAmountMinor: true,
        orderId: true,
        order: {
          select: {
            id: true,
            paymentStatus: true,
            orderStatus: true,
          },
        },
      },
    });

    if (!request) {
      throw new ReturnActionError("NOT_FOUND", "Return request not found.");
    }

    if (request.status !== "APPROVED") {
      throw new ReturnActionError(
        "INVALID_TRANSITION",
        "Approve the return request before recording a refund.",
      );
    }

    if (request.order.paymentStatus !== "VERIFIED") {
      throw new ReturnActionError(
        "INVALID_TRANSITION",
        "Only a verified payment can be refunded.",
      );
    }

    await tx.returnRequest.update({
      where: { id: request.id },
      data: {
        status: "REFUND_PROCESSED",
        adminNotes: notes,
        refundProcessedAt: new Date(),
        refundReference: reference,
      },
    });

    await tx.order.update({
      where: { id: request.orderId },
      data: {
        paymentStatus: "REFUNDED",
        orderStatus: "RETURNED",
      },
    });

    await tx.paymentEvent.create({
      data: {
        orderId: request.orderId,
        fromStatus: "VERIFIED",
        toStatus: "REFUNDED",
        note: notes,
        actorType: "ADMIN",
        actorLabel: input.actor,
      },
    });

    await tx.orderStatusEvent.create({
      data: {
        orderId: request.orderId,
        fromStatus: request.order.orderStatus,
        toStatus: "RETURNED",
        note: `Refund processed: ${reference}`,
        actorType: "ADMIN",
        actorLabel: input.actor,
      },
    });

    await tx.adminAuditLog.create({
      data: {
        actor: input.actor,
        action: "return.refund.process",
        entityType: "ReturnRequest",
        entityId: request.id,
        summary: "Administrator recorded a completed refund.",
        metadata: {
          orderId: request.orderId,
          refundAmountMinor: request.refundAmountMinor,
          refundReference: reference,
        },
      },
    });
  });
}
