/**
 * Publication and orderability safeguards for supplier-backed products.
 *
 * A product may only be published after every piece of evidence has been
 * recorded: supplier verification, an approved supply agreement, confirmed SKU,
 * approved price and content, confirmed image rights, and a verified
 * availability check. Ordering additionally requires the product to be
 * published and in stock. Any record explicitly marked as demo content is
 * never publishable or orderable (spec §4.1).
 *
 * Dependency-free for unit tests.
 */

import {
  DEMO_PRODUCT_PUBLICATION_BLOCKER,
  isDemoProduct,
} from "@/lib/demo-products";

export type PublicationEvidence = {
  slug?: string | null;
  name?: string | null;
  supplierVerificationStatus: string;
  supplierStatus: string;
  agreementStatus: string;
  supplyAuthorized: boolean;
  agreementImageRightsGranted: boolean;
  sku: string;
  skuConfirmed: boolean;
  sellingPriceMinor: number;
  priceApproved: boolean;
  contentApproved: boolean;
  imageRightsStatus: string;
  imageRightsApproved: boolean;
  imageCount: number;
  availabilityVerifiedAt: string | Date | null;
};

export type OrderabilityEvidence = PublicationEvidence & {
  publicationStatus: string;
  availability: string;
  stockQuantity: number | null;
};

/** Human-readable blockers that prevent publication. */
export function getPublicationBlockers(
  evidence: PublicationEvidence,
): string[] {
  const blockers: string[] = [];

  if (
    isDemoProduct({
      slug: evidence.slug,
      sku: evidence.sku,
      name: evidence.name,
    })
  ) {
    blockers.push(DEMO_PRODUCT_PUBLICATION_BLOCKER);
  }

  if (evidence.supplierStatus !== "ACTIVE") {
    blockers.push("Supplier is not active.");
  }

  if (evidence.supplierVerificationStatus !== "VERIFIED") {
    blockers.push("Supplier identity is not verified.");
  }

  if (evidence.agreementStatus !== "APPROVED") {
    blockers.push("Supplier agreement is not approved.");
  }

  if (!evidence.supplyAuthorized) {
    blockers.push("Supply authorization is not confirmed.");
  }

  if (!evidence.agreementImageRightsGranted) {
    blockers.push("Image usage rights are not granted in the agreement.");
  }

  if (!evidence.sku.trim() || !evidence.skuConfirmed) {
    blockers.push("SKU is missing or not confirmed.");
  }

  if (evidence.sellingPriceMinor <= 0 || !evidence.priceApproved) {
    blockers.push("Selling price is missing or not approved.");
  }

  if (!evidence.contentApproved) {
    blockers.push("Product content is not approved.");
  }

  if (
    evidence.imageRightsStatus !== "CONFIRMED" ||
    !evidence.imageRightsApproved
  ) {
    blockers.push("Image rights are not confirmed.");
  }

  if (!evidence.availabilityVerifiedAt || evidence.imageCount < 1) {
    if (!evidence.availabilityVerifiedAt) {
      blockers.push("Supplier availability has not been verified.");
    }

    if (evidence.imageCount < 1) {
      blockers.push("At least one approved product image is required.");
    }
  }

  return blockers;
}

export function isPublishable(evidence: PublicationEvidence): boolean {
  return getPublicationBlockers(evidence).length === 0;
}

/** Additional blockers that stop an order from being accepted. */
export function getOrderabilityBlockers(
  evidence: OrderabilityEvidence,
): string[] {
  const blockers = getPublicationBlockers(evidence);

  if (evidence.publicationStatus !== "PUBLISHED") {
    blockers.push("Product is not published.");
  }

  if (evidence.availability !== "IN_STOCK") {
    blockers.push("Product availability is not confirmed as in stock.");
  }

  if (
    evidence.stockQuantity !== null &&
    evidence.stockQuantity <= 0
  ) {
    blockers.push("Product is out of stock.");
  }

  return blockers;
}

export function isOrderable(evidence: OrderabilityEvidence): boolean {
  return getOrderabilityBlockers(evidence).length === 0;
}
