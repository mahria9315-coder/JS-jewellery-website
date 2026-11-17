import type { ReactNode } from "react";

import { PageTransition } from "@/components/layout/PageTransition";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getPublicNavigation } from "@/lib/admin/content";
import { getPublicBusinessContact } from "@/lib/public-settings";
import {
  collectionLinks,
  policyLinks,
  primaryLinks,
  shopLinks,
} from "@/lib/site-navigation";

export const instant = false;

/**
 * Public storefront chrome. Administration lives outside this route group so it
 * never renders the customer header, footer, or skip link.
 *
 * Navigation can be managed in the admin CMS. Draft or hidden links never
 * appear; when no published navigation exists for a location, the static
 * approved fallback is used.
 */
export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [dbPrimary, dbFooterShop, dbFooterPolicy, contact] = await Promise.all([
    getPublicNavigation("primary"),
    getPublicNavigation("footer-shop"),
    getPublicNavigation("footer-policy"),
    getPublicBusinessContact(),
  ]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-brand focus:bg-gold focus:px-4 focus:text-sm focus:text-on-gold"
      >
        Skip to content
      </a>
      <SiteHeader
        primary={dbPrimary.length > 0 ? dbPrimary : primaryLinks}
        collections={collectionLinks}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 focus:outline-none"
      >
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter
        shop={dbFooterShop.length > 0 ? dbFooterShop : shopLinks}
        collections={collectionLinks}
        policies={dbFooterPolicy.length > 0 ? dbFooterPolicy : policyLinks}
        contact={contact}
      />
    </>
  );
}
