import type { MetadataRoute } from "next";

import { collections } from "@/lib/collections";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

/**
 * Public, indexable routes only. Search results, cart, checkout, order,
 * account, admin, and API routes are intentionally excluded. Product URLs come
 * from published, non-archived catalogue records. Published CMS pages are
 * included only when marked indexable by an administrator.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/collections"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = collections.map(
    (collection) => ({
      url: absoluteUrl(`/collections/${collection.slug}`),
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  let productRoutes: MetadataRoute.Sitemap = [];
  let contentRoutes: MetadataRoute.Sitemap = [];

  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      const [products, pages] = await Promise.all([
        db.product.findMany({
          where: { publicationStatus: "PUBLISHED", isArchived: false },
          select: {
            slug: true,
            updatedAt: true,
            availabilityVerifiedAt: true,
          },
        }),
        db.contentPage.findMany({
          where: { status: "PUBLISHED", isIndexable: true },
          select: { slug: true, updatedAt: true },
        }),
      ]);

      productRoutes = products.map((product) => ({
        url: absoluteUrl(`/products/${product.slug}`),
        lastModified: product.availabilityVerifiedAt ?? product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      }));

      contentRoutes = pages
        .filter((page) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug))
        .map((page) => ({
          url: absoluteUrl(`/${page.slug}`),
          lastModified: page.updatedAt,
          changeFrequency: "monthly",
          priority: 0.4,
        }));
    } catch {
      // Keep the static and collection routes available if the database is down.
    }
  }

  return [...staticRoutes, ...collectionRoutes, ...productRoutes, ...contentRoutes];
}
