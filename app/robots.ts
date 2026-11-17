import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * Sensible default indexation strategy: public shop pages may be indexed,
 * while request-specific search results, private account/admin areas, and
 * transactional routes are excluded. Admin and API routes do not exist yet;
 * listing them here prevents accidental indexation once they are added.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/account",
          "/cart",
          "/checkout",
          "/orders",
          "/search",
          "/not-found",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
