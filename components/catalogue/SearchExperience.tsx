import { getAllProducts } from "@/lib/catalogue";
import {
  filterAndSortProducts,
  hasActiveCatalogueQuery,
  parseCatalogueQuery,
  type RawCatalogueSearchParams,
} from "@/lib/catalogue-query";

import { CatalogueEmptyState } from "./CatalogueEmptyState";
import { ProductGrid } from "./ProductGrid";
import { SearchControls } from "./SearchControls";

type SearchExperienceProps = {
  searchParams: RawCatalogueSearchParams;
};

function productCountLabel(count: number) {
  return `${count} ${count === 1 ? "product" : "products"}`;
}

export function SearchExperience({ searchParams }: SearchExperienceProps) {
  const query = parseCatalogueQuery(searchParams);
  const allProducts = getAllProducts();
  const hasActiveQuery = hasActiveCatalogueQuery(query);

  if (allProducts.length === 0) {
    return (
      <>
        <SearchControls query={query} showClear={hasActiveQuery} />
        <CatalogueEmptyState
          title="The catalogue is empty"
          description="No products are listed yet. Approved supplier-backed products will appear here once they are configured."
          actionHref="/collections"
          actionLabel="Browse collections"
        />
      </>
    );
  }

  const results = filterAndSortProducts(allProducts, query);
  const total = allProducts.length;
  const summary = hasActiveQuery
    ? `Showing ${results.length} of ${productCountLabel(total)}`
    : `Showing ${productCountLabel(total)}`;

  const emptyDescription =
    query.q !== ""
      ? `No products match “${query.q}”${
          query.collection !== "all" || query.availability !== "all"
            ? " with the selected filters"
            : ""
        }. Try a different product name or clear the filters.`
      : "No products match the selected filters. Try changing or clearing the filters.";

  return (
    <>
      <SearchControls query={query} showClear={hasActiveQuery} />

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="text-2xl">Results</h2>
        <p role="status" className="text-sm text-charcoal">
          {summary}
        </p>
      </div>

      {results.length === 0 ? (
        <CatalogueEmptyState
          title="No products found"
          description={emptyDescription}
          actionHref="/search"
          actionLabel="Clear search and filters"
        />
      ) : (
        <ProductGrid
          products={results}
          emptyTitle="No products found"
          emptyDescription={emptyDescription}
        />
      )}
    </>
  );
}
