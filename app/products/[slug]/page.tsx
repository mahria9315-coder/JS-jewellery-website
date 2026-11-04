import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs, type BreadcrumbItem } from "@/components/catalogue/Breadcrumbs";
import { ProductDetail } from "@/components/catalogue/ProductDetail";
import { getProductBySlug } from "@/lib/catalogue";
import { getCollection } from "@/lib/collections";

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
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return {
    title: `${product.name} | J's Jewellery`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

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

  return (
    <section className="bg-white">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs items={breadcrumbItems} />
        <ProductDetail product={product} />
      </div>
    </section>
  );
}
