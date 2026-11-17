import Image from "next/image";
import Link from "next/link";

import { formatPkr, hasValidDiscount, type Product } from "@/lib/catalogue";
import { getCollection } from "@/lib/collections";
import type { CustomizationConfig } from "@/lib/customization/config";
import { getDisplayProductImages } from "@/lib/product-images";
import { DELIVERY_ESTIMATE_DISPLAY } from "@/lib/site";

import { AddToCartForm } from "@/components/cart/AddToCartForm";

import { AvailabilityBadge } from "./AvailabilityBadge";
import { ZoomableProductImage } from "./ZoomableProductImage";

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

export type ProductPurchase = {
  productId: string;
  canOrder: boolean;
  maxQuantity: number;
  reason?: string;
  customization?: CustomizationConfig;
};

export function ProductDetail({
  product,
  purchase,
  deliveryEstimate = DELIVERY_ESTIMATE_DISPLAY,
}: {
  product: Product;
  purchase?: ProductPurchase;
  deliveryEstimate?: string;
}) {
  const [mainImage, ...additionalImages] = getDisplayProductImages(
    product.images,
  );
  const originalPrice = hasValidDiscount(product)
    ? product.originalPrice
    : undefined;
  const productCollections = product.collectionSlugs
    .map((slug) => getCollection(slug))
    .filter((collection) => collection !== undefined);

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <ZoomableProductImage image={mainImage} sizes="(min-width: 1024px) 40vw, 100vw" />
        {additionalImages.length > 0 && (
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {additionalImages.map((image) => (
              <li key={image.src}>
                <div className="relative aspect-square overflow-hidden rounded-card border border-gold/20 bg-charcoal">
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
          <ul className="font-nav flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-[0.2em] text-champagne/70">
            {productCollections.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="inline-flex min-h-11 items-center underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-accent focus-visible:outline-focus"
                >
                  {collection.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <h1
          id="product-heading"
          className="heading-product mt-3 text-4xl md:text-5xl"
        >
          {product.name}
        </h1>

        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <p className="font-nav text-xl font-semibold text-accent">
            {formatPkr(product.price)}
          </p>
          {originalPrice && (
            <p className="text-sm text-champagne/70">
              <span className="sr-only">Original price </span>
              <span className="line-through">{formatPkr(originalPrice)}</span>
            </p>
          )}
        </div>

        <p className="body-copy mt-6 max-w-prose whitespace-pre-line text-base">
          {product.description}
        </p>

        <div className="surface-panel mt-8 rounded-card border border-gold/20 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-nav text-sm font-semibold not-italic text-white">
              Availability
            </h2>
            <AvailabilityBadge status={product.availability.status} />
          </div>
          <p className="mt-2 text-sm text-champagne/70">{availabilityNote(product)}</p>
        </div>

        {purchase ? (
          <div className="surface-panel mt-4 rounded-card border border-gold/20 p-4">
            <h2 className="font-nav text-sm font-semibold not-italic text-white">
              Order this item
            </h2>

            {purchase.canOrder ? (
              <>
                <p className="mt-2 text-sm text-champagne/70">
                  {product.stockQuantity !== null &&
                  product.stockQuantity !== undefined
                    ? `Confirmed stock: ${product.stockQuantity}.`
                    : "Stock is confirmed with the supplier before dispatch."}
                </p>
                <AddToCartForm
                  productId={purchase.productId}
                  returnTo={`/products/${product.slug}`}
                  maxQuantity={purchase.maxQuantity}
                  customization={purchase.customization}
                />
              </>
            ) : (
              <p className="mt-2 text-sm text-amber-200">
                {purchase.reason ??
                  "This item cannot be ordered right now."}{" "}
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 transition-colors hover:text-champagne focus-visible:outline-focus"
                >
                  Contact us
                </Link>
                .
              </p>
            )}
          </div>
        ) : null}

        <div className="surface-panel mt-4 rounded-card border border-gold/20 p-4">
          <h2 className="font-nav text-sm font-semibold not-italic text-white">
            Delivery
          </h2>
          <p className="mt-2 text-sm text-champagne/70">
            Estimated delivery:{" "}
            <strong className="font-semibold text-champagne">
              {deliveryEstimate}
            </strong>
            . This is an estimate, not a guaranteed date. Read our{" "}
            <Link
              href="/shipping"
              className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 transition-colors hover:text-champagne focus-visible:outline-focus"
            >
              Shipping &amp; Delivery information
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
