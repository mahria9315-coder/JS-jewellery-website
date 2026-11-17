import { safeStringEqual } from "@/lib/admin/auth-crypto";
import { getDb } from "@/lib/db";
import {
  canTransitionPayment,
  type PaymentActor,
  type PaymentState,
} from "@/lib/payments/transitions";

/**
 * Manual payment submission and admin verification.
 *
 * The customer can only move a payment to SUBMITTED. Only an admin can move it
 * to VERIFIED, REJECTED, or REFUNDED. Every change is recorded as a
 * PaymentEvent.
 */

export class PaymentActionError extends Error {
  readonly code:
    | "NOT_FOUND"
    | "INVALID_TRANSITION"
    | "INVALID_INPUT"
    | "ORDER_CANCELLED";

  constructor(code: PaymentActionError["code"], message: string) {
    super(message);
    this.name = "PaymentActionError";
    this.code = code;
  }
}

function cleanReference(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, " ");

  if (
    cleaned.length < 3 ||
    cleaned.length > 120 ||
    /[\u0000-\u001F\u007F]/.test(cleaned)
  ) {
    throw new PaymentActionError(
      "INVALID_INPUT",
      "Enter the bank/Easypaisa transaction reference or a short payment note (3-120 characters).",
    );
  }

  return cleaned;
}

export async function getOrderForPaymentActionById(id: string) {
  return getDb().order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      paymentStatus: true,
      paymentMethod: true,
      orderStatus: true,
      totalMinor: true,
      currency: true,
    },
  });
}

export async function submitCustomerPayment(input: {
  orderNumber: string;
  accessToken: string;
  reference: string;
  note?: string | null;
}) {
  const db = getDb();
  const order = await db.order.findUnique({
    where: { orderNumber: input.orderNumber },
    select: {
      id: true,
      accessToken: true,
      paymentStatus: true,
      orderStatus: true,
    },
  });

  if (!order || !safeStringEqual(order.accessToken, input.accessToken)) {
    throw new PaymentActionError("NOT_FOUND", "Order not found.");
  }

  if (order.orderStatus === "CANCELLED") {
    throw new PaymentActionError(
      "ORDER_CANCELLED",
      "This order was cancelled, so payment cannot be submitted.",
    );
  }

  const reference = cleanReference(input.reference);
  const note = input.note?.trim().slice(0, 500) || null;
  const from = order.paymentStatus as PaymentState;

  if (!canTransitionPayment(from, "SUBMITTED", "CUSTOMER")) {
    throw new PaymentActionError(
      "INVALID_TRANSITION",
      "This payment is no longer awaiting submission.",
    );
  }

  await db.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: from, orderStatus: order.orderStatus },
      data: {
        paymentStatus: "SUBMITTED",
        paymentReference: reference,
        paymentSubmittedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      throw new PaymentActionError(
        "INVALID_TRANSITION",
        "The payment state changed before this update could be applied. Refresh and try again.",
      );
    }

    await tx.paymentEvent.create({
      data: {
        orderId: order.id,
        fromStatus: from,
        toStatus: "SUBMITTED",
        customerReference: reference,
        note:
          note ??
          "Customer submitted payment information. Awaiting admin verification.",
        actorType: "CUSTOMER",
        actorLabel: "Customer",
      },
    });
  });
}

async function applyAdminPaymentTransition(input: {
  orderId: string;
  actor: string;
  to: "VERIFIED" | "REJECTED";
  note: string;
}) {
  const db = getDb();
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    select: { id: true, paymentStatus: true, orderStatus: true },
  });

  if (!order) {
    throw new PaymentActionError("NOT_FOUND", "Order not found.");
  }

  const from = order.paymentStatus as PaymentState;
  const action: PaymentActor = "ADMIN";

  if (!canTransitionPayment(from, input.to, action)) {
    throw new PaymentActionError(
      "INVALID_TRANSITION",
      `Cannot move a ${from.toLowerCase()} payment to ${input.to.toLowerCase()}.`,
    );
  }

  const note = input.note.trim().slice(0, 500);

  if (note.length < 3) {
    throw new PaymentActionError(
      "INVALID_INPUT",
      "Add a short verification note (at least 3 characters).",
    );
  }

  await db.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: from, orderStatus: order.orderStatus },
      data:
        input.to === "VERIFIED"
          ? {
              paymentStatus: "VERIFIED",
              paymentVerifiedAt: new Date(),
              paymentVerifiedBy: input.actor,
            }
          : {
              paymentStatus: "REJECTED",
              paymentVerifiedAt: null,
              paymentVerifiedBy: null,
            },
    });

    if (updated.count !== 1) {
      throw new PaymentActionError(
        "INVALID_TRANSITION",
        "The payment state changed before this update could be applied. Refresh and try again.",
      );
    }

    await tx.paymentEvent.create({
      data: {
        orderId: order.id,
        fromStatus: from,
        toStatus: input.to,
        note,
        actorType: "ADMIN",
        actorLabel: input.actor,
      },
    });

    await tx.adminAuditLog.create({
      data: {
        actor: input.actor,
        action:
          input.to === "VERIFIED"
            ? "payment.verify"
            : "payment.reject",
        entityType: "Order",
        entityId: order.id,
        summary:
          input.to === "VERIFIED"
            ? "Administrator verified manual payment."
            : "Administrator rejected manual payment.",
        metadata: { note },
      },
    });
  });
}

export async function verifyPayment(input: {
  orderId: string;
  actor: string;
  note: string;
}) {
  return applyAdminPaymentTransition({
    ...input,
    to: "VERIFIED",
  });
}

export async function rejectPayment(input: {
  orderId: string;
  actor: string;
  note: string;
}) {
  return applyAdminPaymentTransition({
    ...input,
    to: "REJECTED",
  });
}
