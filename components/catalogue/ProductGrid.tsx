import type { Product } from "@/lib/catalogue";

import { CatalogueEmptyState } from "./CatalogueEmptyState";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: readonly Product[];
  emptyTitle: string;
  emptyDescription: string;
};

export function ProductGrid({
  products,
  emptyTitle,
  emptyDescription,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <CatalogueEmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionHref="/collections"
        actionLabel="Browse all collections"
      />
    );
  }

  return (
    <ul className="reveal-on-scroll mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
