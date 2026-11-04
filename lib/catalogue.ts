import type { CollectionSlug } from "./collections";

/**
 * Money is stored in minor units (paisa for PKR) with an explicit currency.
 * Formatting happens at render time; do not store formatted strings.
 */
export type Money = {
  amountMinor: number;
  currency: "PKR";
};

export type ProductAvailabilityStatus =
  | "in_stock"
  | "out_of_stock"
  | "verification_pending";

export type ProductImage = {
  src: string;
  alt: string;
};

export type Product = {
  slug: string;
  name: string;
  description: string;
  images: readonly ProductImage[];
  collectionSlugs: readonly CollectionSlug[];
  price: Money;
  /** Present only when a genuine discount is configured. */
  originalPrice?: Money;
  /** Public availability only. Supplier identity, cost, and margin stay internal. */
  availability: {
    status: ProductAvailabilityStatus;
    lastVerifiedAt?: string;
  };
};

/**
 * Intentionally empty until approved supplier-backed product records exist.
 * T013A and T014 replace this module with database-backed reads. Do not add
 * invented demo listings here or anywhere else in the public catalogue.
 */
export const products: readonly Product[] = [];

export function getAllProducts(): readonly Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCollection(
  slug: CollectionSlug,
): readonly Product[] {
  return products.filter((product) =>
    product.collectionSlugs.includes(slug),
  );
}

/** An original price is shown only when it is genuinely higher than the price. */
export function hasValidDiscount(product: Product): boolean {
  if (!product.originalPrice) {
    return false;
  }

  return (
    product.originalPrice.currency === product.price.currency &&
    product.originalPrice.amountMinor > product.price.amountMinor
  );
}

const pkrFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  currencyDisplay: "code",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPkr(money: Money): string {
  return pkrFormatter.format(money.amountMinor / 100);
}
