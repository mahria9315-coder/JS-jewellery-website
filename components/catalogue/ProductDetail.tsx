import Image from "next/image";
import Link from "next/link";

import { formatPkr, hasValidDiscount, type Product } from "@/lib/catalogue";
import { getCollection } from "@/lib/collections";

import { AvailabilityBadge } from "./AvailabilityBadge";
import { ProductImageFrame } from "./ProductImageFrame";

function formatVerifiedDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "an unrecorded date";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function availabilityNote(product: Product): string {
  switch (product.availability.status) {
    case "in_stock":
      return product.availability.lastVerifiedAt
        ? `Supplier availability verified on ${formatVerifiedDate(
            product.availability.lastVerifiedAt,
          )}.`
        : "Supplier availability is recorded as in stock. The verification date is not recorded.";
    case "out_of_stock":
      return "This item is currently unavailable from the supplier and cannot be ordered.";
    case "verification_pending":
      return "Availability has not been verified with the supplier yet, so this item cannot be ordered.";
  }
}

export function ProductDetail({ product }: { product: Product }) {
  const [mainImage, ...additionalImages] = product.images;
  const originalPrice = hasValidDiscount(product)
    ? product.originalPrice
    : undefined;
  const productCollections = product.collectionSlugs
    .map((slug) => getCollection(slug))
    .filter((collection) => collection !== undefined);

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <ProductImageFrame
          image={mainImage}
          sizes="(min-width: 1024px) 40vw, 100vw"
          priority
        />
        {additionalImages.length > 0 && (
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {additionalImages.map((image) => (
              <li key={image.src}>
                <div className="relative aspect-square overflow-hidden rounded-brand border border-charcoal/15 bg-champagne/40">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 13vw, 30vw"
                    className="object-cover"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        {productCollections.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-[0.2em] text-charcoal">
            {productCollections.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="inline-flex min-h-11 items-center underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-obsidian"
                >
                  {collection.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <h1 id="product-heading" className="mt-3 text-4xl md:text-5xl">
          {product.name}
        </h1>

        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <p className="text-xl font-medium text-obsidian">
            {formatPkr(product.price)}
          </p>
          {originalPrice && (
            <p className="text-sm text-charcoal">
              <span className="sr-only">Original price </span>
              <span className="line-through">{formatPkr(originalPrice)}</span>
            </p>
          )}
        </div>

        <p className="mt-6 max-w-prose whitespace-pre-line text-base text-charcoal">
          {product.description}
        </p>

        <div className="mt-8 rounded-brand border border-charcoal/15 bg-champagne/30 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-sm font-medium text-obsidian">Availability</h2>
            <AvailabilityBadge status={product.availability.status} />
          </div>
          <p className="mt-2 text-sm text-charcoal">{availabilityNote(product)}</p>
        </div>
      </div>
    </div>
  );
}
