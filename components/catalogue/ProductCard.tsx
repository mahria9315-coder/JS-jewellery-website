import Link from "next/link";

import { formatPkr, hasValidDiscount, type Product } from "@/lib/catalogue";

import { AvailabilityBadge } from "./AvailabilityBadge";
import { ProductImageFrame } from "./ProductImageFrame";

export function ProductCard({ product }: { product: Product }) {
  const originalPrice = hasValidDiscount(product)
    ? product.originalPrice
    : undefined;

  return (
    <article className="card-3d group h-full">
      <Link
        href={`/products/${product.slug}`}
        className="card-3d-link focus-visible:outline-focus"
      >
        <div className="card-3d-media">
          <ProductImageFrame
            image={product.images[0]}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            flush
          />
        </div>
        <div className="card-3d-body">
          <h3 className="card-3d-title">{product.name}</h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <p className="font-nav text-base font-semibold text-accent">
              {formatPkr(product.price)}
            </p>
            {originalPrice && (
              <p className="text-sm text-champagne/70">
                <span className="sr-only">Original price </span>
                <span className="line-through">{formatPkr(originalPrice)}</span>
              </p>
            )}
          </div>
          <div className="card-3d-divider">
            <AvailabilityBadge status={product.availability.status} />
          </div>
        </div>
      </Link>
    </article>
  );
}
