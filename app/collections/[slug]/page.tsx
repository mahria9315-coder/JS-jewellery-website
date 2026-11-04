import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { CollectionLinks } from "@/components/catalogue/CollectionLinks";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { getProductsByCollection } from "@/lib/catalogue";
import { collections, getCollection } from "@/lib/collections";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) {
    return { title: "Collection not found | J's Jewellery" };
  }

  return {
    title: `${collection.name} | J's Jewellery`,
    description: collection.summary,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) {
    notFound();
  }

  const products = getProductsByCollection(collection.slug);

  return (
    <section className="bg-white" aria-labelledby="collection-heading">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections" },
            { label: collection.name },
          ]}
        />

        <div className="mt-8 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-charcoal">
            Collection
          </p>
          <h1
            id="collection-heading"
            className="mt-3 text-4xl md:text-5xl"
          >
            {collection.name}
          </h1>
          <p className="mt-4 text-base text-charcoal">{collection.summary}</p>
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
