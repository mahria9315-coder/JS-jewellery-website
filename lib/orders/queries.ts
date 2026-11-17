import { safeStringEqual } from "@/lib/admin/auth-crypto";
import { getDb } from "@/lib/db";

/**
 * Order queries.
 *
 * Customer queries select only customer-safe columns. Supplier identity, cost,
 * margin, and internal notes are fetched only by the admin query.
 */

const customerOrderSelect = {
  id: true,
  orderNumber: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  countryCode: true,
  city: true,
  addressLine1: true,
  addressLine2: true,
  postalCode: true,
  customerNotes: true,
  paymentMethod: true,
  paymentStatus: true,
  orderStatus: true,
  productionStatus: true,
  paymentReference: true,
  paymentSubmittedAt: true,
  paymentVerifiedAt: true,
  subtotalMinor: true,
  shippingMinor: true,
  totalMinor: true,
  currency: true,
  deliveryEstimate: true,
  // Customer-safe courier snapshot: display name, tracking reference, and
  // the code needed to look up the public tracking URL template. Fulfilment
  // workflow states stay internal.
  courierCode: true,
  courierName: true,
  courierTrackingNumber: true,
  policyVersion: true,
  createdAt: true,
  items: {
    select: {
      id: true,
      productName: true,
      productSlug: true,
      unitPriceMinor: true,
      quantity: true,
      lineTotalMinor: true,
      currency: true,
      customizationText: true,
      customizationFont: true,
      customizationColour: true,
      customizationInstructions: true,
    },
  },
  paymentEvents: {
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      customerReference: true,
      actorType: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
  statusEvents: {
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      actorType: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
  returnRequests: {
    select: {
      id: true,
      reason: true,
      explanation: true,
      status: true,
      protectedCase: true,
      deductionPercent: true,
      deductionMinor: true,
      refundAmountMinor: true,
      currency: true,
      createdAt: true,
      refundProcessedAt: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
} as const;

export type CustomerOrder = NonNullable<
  Awaited<ReturnType<typeof getOrderForCustomer>>
>;

export async function getOrderForCustomer(
  orderNumber: string,
  accessToken: string,
) {
  if (!orderNumber || !accessToken) {
    return null;
  }

  const order = await getDb().order.findUnique({
    where: { orderNumber },
    select: { ...customerOrderSelect, accessToken: true },
  });

  if (!order || !safeStringEqual(order.accessToken, accessToken)) {
    return null;
  }

  const { accessToken: _accessToken, ...safeOrder } = order;
  void _accessToken;
  return safeOrder;
}

export async function getOrderAccessTokenByLookup(
  orderNumber: string,
  email: string,
): Promise<string | null> {
  const order = await getDb().order.findUnique({
    where: { orderNumber },
    select: { accessToken: true, customerEmail: true },
  });

  if (
    !order ||
    !safeStringEqual(
      order.customerEmail.trim().toLowerCase(),
      email.trim().toLowerCase(),
    )
  ) {
    return null;
  }

  return order.accessToken;
}

export const adminOrderSelect = {
  id: true,
  orderNumber: true,
  accessToken: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  countryCode: true,
  city: true,
  addressLine1: true,
  addressLine2: true,
  postalCode: true,
  customerNotes: true,
  internalNotes: true,
  paymentMethod: true,
  paymentStatus: true,
  orderStatus: true,
  productionStatus: true,
  paymentReference: true,
  paymentSubmittedAt: true,
  paymentVerifiedAt: true,
  paymentVerifiedBy: true,
  subtotalMinor: true,
  shippingMinor: true,
  totalMinor: true,
  currency: true,
  deliveryEstimate: true,
  courierCode: true,
  courierName: true,
  courierTrackingNumber: true,
  courierFulfilmentStatus: true,
  policyVersion: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      productName: true,
      productSlug: true,
      sku: true,
      quantity: true,
      unitPriceMinor: true,
      lineTotalMinor: true,
      supplierCostMinor: true,
      marginMinor: true,
      supplierId: true,
      supplierName: true,
      currency: true,
      customizationText: true,
      customizationFont: true,
      customizationColour: true,
      customizationInstructions: true,
    },
  },
  paymentEvents: { orderBy: { createdAt: "asc" as const } },
  statusEvents: { orderBy: { createdAt: "asc" as const } },
  productionStatusEvents: { orderBy: { createdAt: "asc" as const } },
  returnRequests: { orderBy: { createdAt: "desc" as const } },
} as const;

export async function getOrderForAdminById(id: string) {
  return getDb().order.findUnique({
    where: { id },
    select: adminOrderSelect,
  });
}

export async function listOrdersForAdmin(
  filters: {
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
    limit?: number;
  } = {},
) {
  const search = filters.search?.trim();
  const orderStatus = filters.orderStatus?.trim();
  const paymentStatus = filters.paymentStatus?.trim();
  const knownOrderStatuses = new Set([
    "PENDING_CONFIRMATION",
    "CONFIRMED",
    "FORWARDED",
    "SUPPLIER_PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
  ]);
  const knownPaymentStatuses = new Set([
    "PENDING",
    "SUBMITTED",
    "VERIFIED",
    "REJECTED",
    "REFUNDED",
  ]);

  return getDb().order.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" as const } },
              { customerName: { contains: search, mode: "insensitive" as const } },
              { customerEmail: { contains: search, mode: "insensitive" as const } },
              { customerPhone: { contains: search } },
            ],
          }
        : {}),
      ...(orderStatus && knownOrderStatuses.has(orderStatus)
        ? { orderStatus: orderStatus as never }
        : {}),
      ...(paymentStatus && knownPaymentStatuses.has(paymentStatus)
        ? { paymentStatus: paymentStatus as never }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit ?? 100,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      paymentMethod: true,
      paymentStatus: true,
      orderStatus: true,
      productionStatus: true,
      totalMinor: true,
      currency: true,
      createdAt: true,
    },
  });
}
