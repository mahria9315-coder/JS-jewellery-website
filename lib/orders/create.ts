import {
  normaliseCartItems,
  type CartInputItem,
} from "@/lib/cart/calculations";
import type { CheckoutValue } from "@/lib/checkout/validation";
import {
  resolveCustomizationConfig,
  validateCustomization,
} from "@/lib/customization/config";
import { getDb } from "@/lib/db";
import { resolveOrderCourierDecision } from "@/lib/couriers/selection";
import { isPaymentMethodConfigured } from "@/lib/payments/methods";
import { toDatabasePaymentMethod } from "@/lib/payments/reference";
import { DELIVERY_ESTIMATE_DISPLAY } from "@/lib/site";
import { getOrderabilityBlockers } from "@/lib/suppliers/publication";

import {
  generateOrderAccessToken,
  generateOrderNumber,
} from "./order-number";

export const ORDER_POLICY_VERSION = "returns-policy-v1-2026-11-07";

export class OrderError extends Error {
  readonly code:
    | "CART_INVALID"
    | "PAYMENT_METHOD_UNAVAILABLE"
    | "DELIVERY_UNAVAILABLE"
    | "DATABASE_UNAVAILABLE"
    | "DUPLICATE_ORDER";

  constructor(code: OrderError["code"], message: string) {
    super(message);
    this.name = "OrderError";
    this.code = code;
  }
}

export type CreatedOrder = {
  id: string;
  orderNumber: string;
  accessToken: string;
  subtotalMinor: number;
  totalMinor: number;
  currency: string;
  paymentMethod: "BANK_TRANSFER" | "EASYPAISA";
  paymentStatus: string;
  orderStatus: string;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  supplierId: string;
  sellingPriceMinor: number;
  category: string;
  supplierCostMinor: number;
  stockQuantity: number | null;
  availability: string;
  availabilityVerifiedAt: Date | null;
  publicationStatus: string;
  skuConfirmed: boolean;
  priceApproved: boolean;
  contentApproved: boolean;
  imageRightsStatus: string;
  imageRightsApproved: boolean;
  customizationEnabled: boolean;
  customizationConfirmation: {
    supplierId: string;
    approvedFonts: string[];
    approvedColours: string[];
  } | null;
  _count: { images: number };
  supplier: {
    legalName: string;
    status: string;
    verificationStatus: string;
  };
};

type AgreementRow = {
  supplierId: string;
  status: string;
  supplyAuthorized: boolean;
  imageRightsGranted: boolean;
};

function isUniqueViolation(error: unknown, field?: string): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    (error as { code?: string }).code !== "P2002"
  ) {
    return false;
  }

  if (!field) {
    return true;
  }

  const target = (error as { meta?: { target?: string[] | string } }).meta
    ?.target;

  if (Array.isArray(target)) {
    return target.includes(field);
  }

  return typeof target === "string" && target.includes(field);
}

/**
 * Create one persistent order from validated checkout data and the current
 * server-side catalogue. Client prices, totals, stock, and payment status are
 * never trusted: every value is recomputed inside a database transaction.
 */
export async function createOrder(input: {
  checkout: CheckoutValue;
  cartItems: readonly CartInputItem[];
  paymentMethod: "bank-transfer" | "easypaisa";
}): Promise<{ order: CreatedOrder; duplicate: boolean }> {
  if (!isPaymentMethodConfigured(input.paymentMethod)) {
    throw new OrderError(
      "PAYMENT_METHOD_UNAVAILABLE",
      "The selected payment method is not currently available. Choose another method or contact us.",
    );
  }

  const items = normaliseCartItems(input.cartItems);

  if (items.length === 0) {
    throw new OrderError("CART_INVALID", "Your cart is empty.");
  }

  const db = getDb();

  // Return an existing order for the same idempotency key only when it belongs
  // to the same normalized customer email. This prevents a reused key from
  // exposing another customer's access token/order details.
  const existing = await db.order.findUnique({
    where: { idempotencyKey: input.checkout.idempotencyKey },
    select: {
      id: true,
      orderNumber: true,
      accessToken: true,
      subtotalMinor: true,
      totalMinor: true,
      currency: true,
      paymentMethod: true,
      paymentStatus: true,
      orderStatus: true,
      customerEmail: true,
    },
  });

  if (existing) {
    const sameCustomer =
      existing.customerEmail.trim().toLowerCase() ===
      input.checkout.email.trim().toLowerCase();

    if (!sameCustomer) {
      throw new OrderError(
        "DUPLICATE_ORDER",
        "This checkout request could not be completed. Refresh your cart and try again.",
      );
    }

    const { customerEmail, ...duplicateOrder } = existing;
    void customerEmail;
    return { order: duplicateOrder as CreatedOrder, duplicate: true };
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const order = await db.$transaction(async (tx) => {
        const productIds = [...new Set(items.map((item) => item.productId))];

        const products = (await tx.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            slug: true,
            name: true,
            sku: true,
            supplierId: true,
            sellingPriceMinor: true,
            category: true,
            supplierCostMinor: true,
            stockQuantity: true,
            availability: true,
            availabilityVerifiedAt: true,
            publicationStatus: true,
            skuConfirmed: true,
            priceApproved: true,
            contentApproved: true,
            imageRightsStatus: true,
            imageRightsApproved: true,
            customizationEnabled: true,
            customizationConfirmation: {
              select: {
                supplierId: true,
                approvedFonts: true,
                approvedColours: true,
              },
            },
            _count: { select: { images: true } },
            supplier: {
              select: {
                legalName: true,
                status: true,
                verificationStatus: true,
              },
            },
          },
        })) as ProductRow[];

        const supplierIds = [
          ...new Set(products.map((product) => product.supplierId)),
        ];

        const agreements = (await tx.supplierAgreement.findMany({
          where: { supplierId: { in: supplierIds } },
          orderBy: { createdAt: "desc" },
          select: {
            supplierId: true,
            status: true,
            supplyAuthorized: true,
            imageRightsGranted: true,
          },
        })) as AgreementRow[];

        const latestAgreement = new Map<string, AgreementRow>();

        for (const agreement of agreements) {
          if (!latestAgreement.has(agreement.supplierId)) {
            latestAgreement.set(agreement.supplierId, agreement);
          }
        }

        const byId = new Map(products.map((product) => [product.id, product]));
        let subtotalMinor = 0;
        // Categories of every ordered item, for the courier jewellery check.
        const itemCategories: string[] = [];

        const orderItems = items.map((item) => {
          const product = byId.get(item.productId);

          if (!product) {
            throw new OrderError(
              "CART_INVALID",
              "One item in your cart is no longer available. Reopen your cart to review it.",
            );
          }

          const agreement = latestAgreement.get(product.supplierId);
          const blockers = getOrderabilityBlockers({
            slug: product.slug,
            name: product.name,
            supplierStatus: product.supplier.status,
            supplierVerificationStatus: product.supplier.verificationStatus,
            agreementStatus: agreement?.status ?? "NOT_RECEIVED",
            supplyAuthorized: agreement?.supplyAuthorized ?? false,
            agreementImageRightsGranted: agreement?.imageRightsGranted ?? false,
            sku: product.sku,
            skuConfirmed: product.skuConfirmed,
            sellingPriceMinor: product.sellingPriceMinor,
            priceApproved: product.priceApproved,
            contentApproved: product.contentApproved,
            imageRightsStatus: product.imageRightsStatus,
            imageRightsApproved: product.imageRightsApproved,
            imageCount: product._count.images,
            availabilityVerifiedAt: product.availabilityVerifiedAt,
            publicationStatus: product.publicationStatus,
            availability: product.availability,
            stockQuantity: product.stockQuantity,
          });

          if (blockers.length > 0) {
            throw new OrderError(
              "CART_INVALID",
              `${product.name} is not currently available for ordering.`,
            );
          }

          let customization = item.customization;

          if (customization) {
            const config = resolveCustomizationConfig({
              productCustomizationEnabled: product.customizationEnabled,
              productSupplierId: product.supplierId,
              confirmation: product.customizationConfirmation,
            });
            const result = validateCustomization(customization, config);

            if (!result.ok) {
              throw new OrderError(
                "CART_INVALID",
                `${product.name}: ${result.error} Reopen your cart to review it.`,
              );
            }

            customization = result.value;
          }

          const quantity = item.quantity;
          const lineTotalMinor = product.sellingPriceMinor * quantity;
          const marginMinor =
            (product.sellingPriceMinor - product.supplierCostMinor) * quantity;

          subtotalMinor += lineTotalMinor;
          itemCategories.push(product.category);

          return {
            productId: product.id,
            supplierId: product.supplierId,
            supplierName: product.supplier.legalName,
            productName: product.name,
            productSlug: product.slug,
            sku: product.sku,
            unitPriceMinor: product.sellingPriceMinor,
            quantity,
            lineTotalMinor,
            supplierCostMinor: product.supplierCostMinor,
            marginMinor,
            currency: "PKR",
            customizationText: customization?.text ?? null,
            customizationFont: customization?.font ?? null,
            customizationColour: customization?.colour ?? null,
            customizationInstructions: customization?.instructions ?? null,
          };
        });

        // Courier gating (T026A/T026B). Couriers and destinations are read
        // inside the same transaction, so the approval state is current at the
        // moment the order is placed rather than when checkout was rendered.
        const courierRows = await tx.courier.findMany({
          select: {
            code: true,
            displayName: true,
            scope: true,
            status: true,
            accountVerification: true,
            jewelleryAcceptance: true,
            approvedJewelleryCategories: true,
          },
        });
        const destinationRows = await tx.courierDestination.findMany({
          select: {
            courier: { select: { code: true } },
            countryCode: true,
            isActive: true,
            verified: true,
            chargeMinor: true,
            estimateMinDays: true,
            estimateMaxDays: true,
          },
        });

        const courierDecision = resolveOrderCourierDecision({
          countryCode: input.checkout.countryCode,
          itemCategories,
          couriers: courierRows,
          destinations: destinationRows.map((destination) => ({
            courierCode: destination.courier.code,
            countryCode: destination.countryCode,
            isActive: destination.isActive,
            verified: destination.verified,
            chargeMinor: destination.chargeMinor,
            estimateMinDays: destination.estimateMinDays,
            estimateMaxDays: destination.estimateMaxDays,
          })),
        });

        // International shipments fail closed (see
        // resolveOrderCourierDecision): they proceed only through a courier
        // destination that passed every approval gate and only when every
        // ordered jewellery category is approved for that courier. Prices and
        // estimates are never invented or inherited.
        if (!courierDecision.ok) {
          throw new OrderError(
            "DELIVERY_UNAVAILABLE",
            "Delivery is not currently available for the items in your cart to the selected country. Please contact us before ordering.",
          );
        }

        // Domestic orders keep the pre-courier behaviour (no courier recorded,
        // no shipping charge, store-level estimate) unless a fully approved
        // domestic courier is approved for the ordered jewellery categories,
        // so an unapproved or partially approved courier never changes
        // Pakistan ordering.
        const shippingMinor = courierDecision.shippingMinor;

        // Decrement tracked stock atomically. A conditional update prevents two
        // concurrent orders from overselling the same unit.
        const quantities = new Map<string, number>();

        for (const item of orderItems) {
          quantities.set(
            item.productId,
            (quantities.get(item.productId) ?? 0) + item.quantity,
          );
        }

        for (const [productId, quantity] of quantities) {
          const product = byId.get(productId);

          if (!product || product.stockQuantity === null) {
            continue;
          }

          const updated = await tx.product.updateMany({
            where: {
              id: productId,
              publicationStatus: "PUBLISHED",
              stockQuantity: { gte: quantity },
            },
            data: { stockQuantity: { decrement: quantity } },
          });

          if (updated.count === 0) {
            throw new OrderError(
              "CART_INVALID",
              `${product.name} no longer has enough stock. Reopen your cart to review it.`,
            );
          }

          const after = await tx.product.findUnique({
            where: { id: productId },
            select: { stockQuantity: true },
          });
          const newStock = after?.stockQuantity ?? null;

          await tx.inventoryMovement.create({
            data: {
              productId,
              delta: -quantity,
              previousStock:
                newStock === null ? product.stockQuantity : newStock + quantity,
              newStock,
              reason: "ORDER_PLACED",
              note: "Stock reserved by a new customer order.",
              actor: "system",
            },
          });
        }

        const customer = await tx.customer.upsert({
          where: { email: input.checkout.email },
          // Do not overwrite existing customer profile data from an unauthenticated
          // checkout; only link/create the record for this order.
          update: {},
          create: {
            email: input.checkout.email,
            name: input.checkout.fullName,
            phone: input.checkout.phone,
          },
          select: { id: true },
        });

        const orderNumber = generateOrderNumber();
        const accessToken = generateOrderAccessToken();

        return tx.order.create({
          data: {
            orderNumber,
            accessToken,
            idempotencyKey: input.checkout.idempotencyKey,
            customerId: customer.id,
            customerName: input.checkout.fullName,
            customerEmail: input.checkout.email,
            customerPhone: input.checkout.phone,
            countryCode: input.checkout.countryCode,
            city: input.checkout.city,
            addressLine1: input.checkout.addressLine1,
            addressLine2: input.checkout.addressLine2,
            postalCode: input.checkout.postalCode,
            customerNotes: input.checkout.customerNotes,
            paymentMethod: toDatabasePaymentMethod(input.paymentMethod),
            paymentStatus: "PENDING",
            orderStatus: "PENDING_CONFIRMATION",
            subtotalMinor,
            shippingMinor,
            totalMinor: subtotalMinor + shippingMinor,
            currency: "PKR",
            deliveryEstimate:
              courierDecision.estimateDisplay ?? DELIVERY_ESTIMATE_DISPLAY,
            // Snapshot from the approved courier record; written once here.
            courierCode: courierDecision.courier?.code ?? null,
            courierName: courierDecision.courier?.displayName ?? null,
            policyVersion: ORDER_POLICY_VERSION,
            items: { create: orderItems },
            paymentEvents: {
              create: {
                fromStatus: null,
                toStatus: "PENDING",
                actorType: "SYSTEM",
                actorLabel: "Order created",
                note: "Awaiting customer payment. Payment is not verified.",
              },
            },
            statusEvents: {
              create: {
                fromStatus: null,
                toStatus: "PENDING_CONFIRMATION",
                actorType: "SYSTEM",
                actorLabel: "Order created",
                note: "Awaiting admin review and supplier availability verification.",
              },
            },
          },
          select: {
            id: true,
            orderNumber: true,
            accessToken: true,
            subtotalMinor: true,
            totalMinor: true,
            currency: true,
            paymentMethod: true,
            paymentStatus: true,
            orderStatus: true,
          },
        });
      });

      return { order: order as CreatedOrder, duplicate: false };
    } catch (error) {
      if (isUniqueViolation(error, "idempotencyKey")) {
        const duplicate = await db.order.findUnique({
          where: { idempotencyKey: input.checkout.idempotencyKey },
          select: {
            id: true,
            orderNumber: true,
            accessToken: true,
            subtotalMinor: true,
            totalMinor: true,
            currency: true,
            paymentMethod: true,
            paymentStatus: true,
            orderStatus: true,
            customerEmail: true,
          },
        });

        if (duplicate) {
          const sameCustomer =
            duplicate.customerEmail.trim().toLowerCase() ===
            input.checkout.email.trim().toLowerCase();

          if (!sameCustomer) {
            throw new OrderError(
              "DUPLICATE_ORDER",
              "This checkout request could not be completed. Refresh your cart and try again.",
            );
          }

          const { customerEmail, ...duplicateOrder } = duplicate;
          void customerEmail;
          return { order: duplicateOrder as CreatedOrder, duplicate: true };
        }
      }

      if (isUniqueViolation(error, "orderNumber")) {
        continue;
      }

      if (error instanceof OrderError) {
        throw error;
      }

      throw new OrderError(
        "DATABASE_UNAVAILABLE",
        "We could not create your order. Please try again.",
      );
    }
  }

  throw new OrderError(
    "DATABASE_UNAVAILABLE",
    "We could not create your order. Please try again.",
  );
}
