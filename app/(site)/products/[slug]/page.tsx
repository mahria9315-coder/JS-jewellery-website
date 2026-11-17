import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs, type BreadcrumbItem } from "@/components/catalogue/Breadcrumbs";
import { ProductDetail } from "@/components/catalogue/ProductDetail";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/cart/calculations";
import { getCollection } from "@/lib/collections";
import { getOrderableProductRecords } from "@/lib/storefront/orderable";
import { getPublicDeliveryEstimate } from "@/lib/public-settings";
import { getPublishedProductBySlug } from "@/lib/storefront/products";
import { pageMetadata } from "@/lib/site";
import {
  buildProductStructuredData,
  serializeJsonLd,
} from "@/lib/structured-data";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * The catalogue is intentionally empty until T014 supplies approved product
 * records, so this route cannot be fully prerendered yet. A blocking route is
 * required under Cache Components; unknown slugs still return notFound().
 */
export const instant = false;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return pageMetadata({
    title: product.name,
    description: product.description,
    path: `/products/${product.slug}`,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productId = product.id;
  const orderableRecord = productId
    ? (await getOrderableProductRecords([productId])).get(productId)
    : undefined;
  const deliveryEstimate = await getPublicDeliveryEstimate();
  const purchase = orderableRecord
    ? {
        canOrder: orderableRecord.orderable,
        maxQuantity:
          orderableRecord.stockQuantity === null
            ? MAX_QUANTITY_PER_ITEM
            : Math.min(orderableRecord.stockQuantity, MAX_QUANTITY_PER_ITEM),
        reason: orderableRecord.orderable
          ? undefined
          : `${product.name} is not currently available for ordering.`,
        customization: orderableRecord.customization,
      }
    : undefined;

  const primaryCollection = product.collectionSlugs[0]
    ? getCollection(product.collectionSlugs[0])
    : undefined;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    ...(primaryCollection
      ? [
          {
            label: primaryCollection.name,
            href: `/collections/${primaryCollection.slug}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  const structuredData = serializeJsonLd(buildProductStructuredData(product));

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs items={breadcrumbItems} />
        <ProductDetail
          product={product}
          deliveryEstimate={deliveryEstimate.display}
          purchase={
            purchase && product.id
              ? { ...purchase, productId: product.id }
              : undefined
          }
        />
      </div>
    </section>
  );
}
