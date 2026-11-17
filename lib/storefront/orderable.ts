import type { OrderableProduct } from "@/lib/cart/calculations";
import {
  resolveCustomizationConfig,
  type CustomizationConfig,
} from "@/lib/customization/config";
import { getDb } from "@/lib/db";
import {
  getOrderabilityBlockers,
  type OrderabilityEvidence,
} from "@/lib/suppliers/publication";

/**
 * Server-only orderability checks.
 *
 * This is the only place that reads supplier cost, supplier identity, and
 * agreement data for ordering. Its private fields must never be returned by a
 * public page or API. Cart and checkout use the public subset only.
 */

export type OrderableProductRecord = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  supplierId: string;
  supplierName: string;
  supplierCostMinor: number;
  sellingPriceMinor: number;
  currency: string;
  stockQuantity: number | null;
  primaryImage: { src: string; alt: string } | null;
  orderable: boolean;
  blockers: string[];
  /** Public effective customization configuration; no supplier identity. */
  customization: CustomizationConfig;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  images: { src: string; alt: string }[];
  supplierId: string;
  supplierSku: string | null;
  sellingPriceMinor: number;
  currency: string;
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

function buildEvidence(
  product: ProductRow,
  agreement: AgreementRow | undefined,
): OrderabilityEvidence {
  return {
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
  };
}

async function loadRecords(
  productIds: readonly string[],
): Promise<OrderableProductRecord[]> {
  if (productIds.length === 0) {
    return [];
  }

  const db = getDb();
  const products = (await db.product.findMany({
    where: { id: { in: [...productIds] } },
    select: {
      id: true,
      slug: true,
      name: true,
      sku: true,
      images: {
        select: { src: true, alt: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      supplierId: true,
      supplierSku: true,
      sellingPriceMinor: true,
      currency: true,
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

  const supplierIds = [...new Set(products.map((product) => product.supplierId))];

  const agreements = (await db.supplierAgreement.findMany({
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

  return products.map((product) => {
    const blockers = getOrderabilityBlockers(
      buildEvidence(product, latestAgreement.get(product.supplierId)),
    );

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      supplierId: product.supplierId,
      supplierName: product.supplier.legalName,
      supplierCostMinor: product.supplierCostMinor,
      sellingPriceMinor: product.sellingPriceMinor,
      currency: product.currency,
      stockQuantity: product.stockQuantity,
      primaryImage: product.images[0] ?? null,
      orderable: blockers.length === 0,
      blockers,
      customization: resolveCustomizationConfig({
        productCustomizationEnabled: product.customizationEnabled,
        productSupplierId: product.supplierId,
        confirmation: product.customizationConfirmation,
      }),
    };
  });
}

/** Private records for order creation. Throws if the database is unavailable. */
export async function getOrderableProductRecords(
  productIds: readonly string[],
): Promise<Map<string, OrderableProductRecord>> {
  const records = await loadRecords(productIds);
  return new Map(records.map((record) => [record.id, record]));
}

/**
 * Public subset for the cart. Never includes supplier identity, cost, or the
 * internal blocker list; unavailable items receive a neutral message.
 */
export async function getOrderableProductMap(
  productIds: readonly string[],
): Promise<Map<string, OrderableProduct>> {
  const records = await loadRecords(productIds);
  const map = new Map<string, OrderableProduct>();

  for (const record of records) {
    map.set(record.id, {
      productId: record.id,
      name: record.name,
      unitPriceMinor: record.sellingPriceMinor,
      currency: record.currency,
      available: record.orderable,
      stockQuantity: record.stockQuantity,
      slug: record.slug,
      primaryImage: record.primaryImage,
      customization: record.customization,
      unavailableReason: record.orderable
        ? undefined
        : `${record.name} is not currently available for ordering.`,
    });
  }

  return map;
}
