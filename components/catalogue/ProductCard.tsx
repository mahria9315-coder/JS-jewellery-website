import Link from "next/link";

import { formatPkr, hasValidDiscount, type Product } from "@/lib/catalogue";

import { AvailabilityBadge } from "./AvailabilityBadge";
import { ProductImageFrame } from "./ProductImageFrame";

export function ProductCard({ product }: { product: Product }) {
  const originalPrice = hasValidDiscount(product)
    ? product.originalPrice
    : undefined;

  return (
    <article className="group h-full">
      <Link
        href={`/products/${product.slug}`}
        className="flex h-full flex-col rounded-brand focus-visible:outline-offset-4"
      >
        <ProductImageFrame
          image={product.images[0]}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-colors group-hover:border-gold"
        />
        <div className="flex flex-1 flex-col pt-4">
          <h3 className="font-serif text-xl text-obsidian">{product.name}</h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <p className="text-base font-medium text-obsidian">
              {formatPkr(product.price)}
            </p>
            {originalPrice && (
              <p className="text-sm text-charcoal">
                <span className="sr-only">Original price </span>
                <span className="line-through">{formatPkr(originalPrice)}</span>
              </p>
            )}
          </div>
          <div className="mt-auto pt-4">
            <AvailabilityBadge status={product.availability.status} />
          </div>
        </div>
      </Link>
    </article>
  );
}
