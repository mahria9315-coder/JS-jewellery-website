import type { Product, ProductAvailabilityStatus } from "./catalogue";
import { collections, type CollectionSlug } from "./collections";

/**
 * Search, filter, and sort rules for the public catalogue.
 *
 * Query values come from the URL, so they are untrusted. Every value is
 * validated here and unknown or malformed values fall back to a safe default.
 * Filtering happens on the server: no catalogue data is shipped to the browser
 * just to support these controls.
 */

const sortValues = ["default", "price-asc", "price-desc"] as const;
export type CatalogueSort = (typeof sortValues)[number];

const availabilityValues = [
  "in_stock",
  "out_of_stock",
  "verification_pending",
] as const satisfies readonly ProductAvailabilityStatus[];

export type AvailabilityFilter = "all" | ProductAvailabilityStatus;

export type CatalogueQuery = {
  readonly q: string;
  readonly collection: CollectionSlug | "all";
  readonly sort: CatalogueSort;
  readonly availability: AvailabilityFilter;
};

export type RawCatalogueSearchParams = Record<
  string,
  string | string[] | undefined
>;

export const catalogueSortOptions: ReadonlyArray<{
  value: CatalogueSort;
  label: string;
}> = [
  { value: "default", label: "Default order" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export const availabilityFilterOptions: ReadonlyArray<{
  value: AvailabilityFilter;
  label: string;
}> = [
  { value: "all", label: "All availability" },
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Currently unavailable" },
  { value: "verification_pending", label: "Availability pending verification" },
];

const defaultCatalogueQuery: CatalogueQuery = {
  q: "",
  collection: "all",
  sort: "default",
  availability: "all",
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isCollectionSlug(value: string): value is CollectionSlug {
  return collections.some((collection) => collection.slug === value);
}

function isSort(value: string): value is CatalogueSort {
  return (sortValues as readonly string[]).includes(value);
}

function isAvailabilityFilter(value: string): value is AvailabilityFilter {
  return (
    value === "all" ||
    (availabilityValues as readonly string[]).includes(value)
  );
}

/** Normalise a product name for a case-insensitive "contains" match. */
function normaliseSearchText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function parseCatalogueQuery(
  params: RawCatalogueSearchParams,
): CatalogueQuery {
  const rawQuery = firstValue(params.q) ?? "";
  const q = rawQuery.trim().replace(/\s+/g, " ");

  const rawCollection = firstValue(params.collection) ?? "";
  const collection = isCollectionSlug(rawCollection)
    ? rawCollection
    : defaultCatalogueQuery.collection;

  const rawSort = firstValue(params.sort) ?? "";
  const sort = isSort(rawSort) ? rawSort : defaultCatalogueQuery.sort;

  const rawAvailability = firstValue(params.availability) ?? "";
  const availability = isAvailabilityFilter(rawAvailability)
    ? rawAvailability
    : defaultCatalogueQuery.availability;

  return { q, collection, sort, availability };
}

export function hasActiveCatalogueQuery(query: CatalogueQuery): boolean {
  return (
    query.q !== defaultCatalogueQuery.q ||
    query.collection !== defaultCatalogueQuery.collection ||
    query.sort !== defaultCatalogueQuery.sort ||
    query.availability !== defaultCatalogueQuery.availability
  );
}

export function filterAndSortProducts(
  products: readonly Product[],
  query: CatalogueQuery,
): Product[] {
  const searchTerm = normaliseSearchText(query.q);

  const filtered = products.filter((product) => {
    if (
      searchTerm !== "" &&
      !normaliseSearchText(product.name).includes(searchTerm)
    ) {
      return false;
    }

    if (
      query.collection !== "all" &&
      !product.collectionSlugs.includes(query.collection)
    ) {
      return false;
    }

    if (
      query.availability !== "all" &&
      product.availability.status !== query.availability
    ) {
      return false;
    }

    return true;
  });

  if (query.sort === "default") {
    return filtered;
  }

  const direction = query.sort === "price-asc" ? 1 : -1;

  return filtered.sort((a, b) => {
    const byPrice = a.price.amountMinor - b.price.amountMinor;

    if (byPrice !== 0) {
      return byPrice * direction;
    }

    const byName = a.name.localeCompare(b.name);
    return byName !== 0 ? byName : a.slug.localeCompare(b.slug);
  });
}
