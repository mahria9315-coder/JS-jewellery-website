import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { CollectionLinks } from "@/components/catalogue/CollectionLinks";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { collections, getCollection } from "@/lib/collections";
import { getPublishedProductsByCollection } from "@/lib/storefront/products";
import { pageMetadata } from "@/lib/site";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Product rows are read from the database, so the route cannot be part of a
 * shared static shell. Blocking it keeps the empty state and footer in the
 * first response.
 */
export const instant = false;

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) {
    return {
      title: "Collection not found",
      robots: { index: false, follow: false },
    };
  }

  return pageMetadata({
    title: collection.name,
    description: collection.summary,
    path: `/collections/${collection.slug}`,
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) {
    notFound();
  }

  const products = await getPublishedProductsByCollection(collection.slug);

  return (
    <section aria-labelledby="collection-heading">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections" },
            { label: collection.name },
          ]}
        />

        <div className="reveal-on-scroll mt-8 max-w-2xl">
          <p className="eyebrow">Collection</p>
          <h1
            id="collection-heading"
            className="heading-page heading-gold mt-3 text-4xl md:text-5xl"
          >
            {collection.name}
          </h1>
          <p className="body-copy mt-4 text-base">{collection.summary}</p>
        </div>

        <ProductGrid
          products={products}
          emptyTitle="No products in this collection yet"
          emptyDescription="Approved supplier-backed products will appear here once they are configured."
        />

        <CollectionLinks currentSlug={collection.slug} />
      </div>
    </section>
  );
}
