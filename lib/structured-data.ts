import type { Product, ProductAvailabilityStatus } from "./catalogue";
import { getDisplayProductImages } from "./product-images";
import { SITE_NAME, absoluteUrl } from "./site";

/**
 * Product structured data (schema.org Product).
 *
 * Only values that exist in the configured catalogue are emitted. Ratings,
 * reviews, discounts, delivery promises, and availability claims are never
 * invented. A product whose supplier availability is still being verified has
 * no Offer, because its availability cannot be stated truthfully.
 */
const availabilitySchema: Partial<
  Record<ProductAvailabilityStatus, string>
> = {
  in_stock: "https://schema.org/InStock",
  out_of_stock: "https://schema.org/OutOfStock",
};

type StructuredData = Record<string, unknown>;

function absoluteImageUrl(src: string): string {
  return new URL(src, `${absoluteUrl("/")}`).toString();
}

export function buildProductStructuredData(product: Product): StructuredData {
  const url = absoluteUrl(`/products/${product.slug}`);
  const availability = availabilitySchema[product.availability.status];
  const images = getDisplayProductImages(product.images);

  const data: StructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    ...(images.length > 0
      ? { image: images.map((image) => absoluteImageUrl(image.src)) }
      : {}),
  };

  if (availability) {
    data.offers = {
      "@type": "Offer",
      url,
      priceCurrency: product.price.currency,
      price: (product.price.amountMinor / 100).toFixed(2),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    };
  }

  return data;
}

/** Serialize JSON-LD without allowing product text to close the script tag. */
export function serializeJsonLd(data: StructuredData): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
