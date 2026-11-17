import type {
  Product,
  ProductAvailabilityStatus,
} from "@/lib/catalogue";
import type { CollectionSlug } from "@/lib/collections";
import { getDb, isDatabaseConfigured } from "@/lib/db";

/**
 * Public product data access.
 *
 * Only `PUBLISHED` products are returned, and only public columns are selected.
 * Supplier identity, supplier cost, supplier SKU, agreements, notes, and
 * margins are never selected here. Database failures degrade to an empty
 * catalogue rather than exposing internals.
 */

const publicProductSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  collectionSlugs: true,
  sellingPriceMinor: true,
  currency: true,
  availability: true,
  availabilityVerifiedAt: true,
  stockQuantity: true,
  images: {
    select: { src: true, alt: true },
    orderBy: { sortOrder: "asc" as const },
  },
} as const;

type PublicProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  collectionSlugs: string[];
  sellingPriceMinor: number;
  currency: string;
  availability: string;
  availabilityVerifiedAt: Date | null;
  stockQuantity: number | null;
  images: { src: string; alt: string }[];
};

function mapAvailability(status: string): ProductAvailabilityStatus {
  switch (status) {
    case "IN_STOCK":
      return "in_stock";
    case "OUT_OF_STOCK":
      return "out_of_stock";
    default:
      return "verification_pending";
  }
}

export function toPublicProduct(row: PublicProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    images: row.images.map((image) => ({
      src: image.src,
      alt: image.alt,
    })),
    collectionSlugs: row.collectionSlugs as CollectionSlug[],
    price: {
      amountMinor: row.sellingPriceMinor,
      currency: "PKR",
    },
    availability: {
      status: mapAvailability(row.availability),
      ...(row.availabilityVerifiedAt
        ? { lastVerifiedAt: row.availabilityVerifiedAt.toISOString() }
        : {}),
    },
    stockQuantity: row.stockQuantity,
  };
}

export async function getPublishedProducts(): Promise<Product[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  try {
    const rows = await getDb().product.findMany({
      where: { publicationStatus: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { name: "asc" }],
      select: publicProductSelect,
    });

    return rows.map(toPublicProduct);
  } catch {
    return [];
  }
}

export async function getPublishedProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (!isDatabaseConfigured()) {
    return undefined;
  }

  try {
    const row = await getDb().product.findFirst({
      where: { slug, publicationStatus: "PUBLISHED" },
      select: publicProductSelect,
    });

    return row ? toPublicProduct(row) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Lightweight existence check for request-level routing (proxy). Only the id is
 * selected, and unpublished or missing products are not exposed.
 */
export async function isPublishedProductSlug(slug: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    const row = await getDb().product.findFirst({
      where: { slug, publicationStatus: "PUBLISHED" },
      select: { id: true },
    });

    return Boolean(row);
  } catch {
    return false;
  }
}

export async function getPublishedProductsByCollection(
  collectionSlug: CollectionSlug,
): Promise<Product[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  try {
    const rows = await getDb().product.findMany({
      where: {
        publicationStatus: "PUBLISHED",
        collectionSlugs: { has: collectionSlug },
      },
      orderBy: [{ publishedAt: "desc" }, { name: "asc" }],
      select: publicProductSelect,
    });

    return rows.map(toPublicProduct);
  } catch {
    return [];
  }
}
