import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPageHeader, StatusPill } from "@/components/admin/AdminUI";
import { Notice, panelClass } from "@/components/ui/FormPrimitives";
import { getAdminProductById } from "@/lib/admin/products";
import { requireAdminPage } from "@/lib/admin/session";
import { formatPkr } from "@/lib/catalogue";
import { DEMO_PRODUCT_BADGE, isDemoProduct } from "@/lib/demo-products";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Product preview",
  description: "Private product preview.",
  path: "/admin/products",
  noIndex: true,
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPreviewPage({ params }: PageProps) {
  await requireAdminPage("products.view");
  const { id } = await params;
  const product = await getAdminProductById(id).catch(() => null);

  if (!product) {
    notFound();
  }

  const isLive =
    product.publicationStatus === "PUBLISHED" && !product.isArchived;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Product preview"
        title={product.name}
        description="This preview is private to administrators. It shows the customer-facing content and price, but never the supplier identity, supplier cost, or internal notes."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: product.name, href: `/admin/products/${product.id}` },
          { label: "Preview" },
        ]}
        actions={
          <Link
            href={`/admin/products/${product.id}`}
            className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
          >
            Back to edit
          </Link>
        }
      />

      {isDemoProduct(product) ? (
        <Notice tone="warning">
          <strong className="font-semibold">{DEMO_PRODUCT_BADGE}</strong> — this
          record was created only for development or preview. It cannot be
          published or ordered, and it is not part of the genuine catalogue.
        </Notice>
      ) : null}

      {!isLive ? (
        <Notice tone="warning">
          This product is not live on the storefront. It is{" "}
          {product.isArchived
            ? "archived"
            : product.publicationStatus.replaceAll("_", " ").toLowerCase()}
          . Customers cannot see or order it.
        </Notice>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className={panelClass}>
          {product.images.length === 0 ? (
            <p className="text-sm text-champagne/70">
              No product image recorded. A published product should have at
              least one approved image.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {product.images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-brand border border-gold/20 bg-black"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className={panelClass}>
            <h3 className="heading-editorial heading-champagne text-2xl">
              {product.name}
            </h3>
            <p className="mt-3 font-nav text-xl font-semibold text-accent">
              {formatPkr({
                amountMinor: product.sellingPriceMinor,
                currency: "PKR",
              })}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {isDemoProduct(product) ? (
                <StatusPill status={DEMO_PRODUCT_BADGE} tone="warning" />
              ) : null}
              <StatusPill
                status={product.availability.replaceAll("_", " ")}
                tone={
                  product.availability === "IN_STOCK" ? "success" : "warning"
                }
              />
              <StatusPill
                status={product.publicationStatus.replaceAll("_", " ")}
                tone={isLive ? "success" : "neutral"}
              />
              {product.featured ? (
                <StatusPill status="Featured" tone="info" />
              ) : null}
            </div>
            <p className="mt-4 whitespace-pre-line text-sm text-champagne/80">
              {product.description}
            </p>
          </section>

          <section className={panelClass}>
            <h3 className="heading-editorial heading-champagne text-lg">
              Storefront placement
            </h3>
            <ul className="mt-3 space-y-1 text-sm text-champagne/70">
              <li>Collections: {product.collectionSlugs.join(", ") || "-"}</li>
              <li>Category label: {product.category || "-"}</li>
              <li>Stock: {product.stockQuantity ?? "not recorded"}</li>
              <li>
                Availability verified:{" "}
                {product.availabilityVerifiedAt
                  ? product.availabilityVerifiedAt.toLocaleString("en-PK")
                  : "not recorded"}
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
