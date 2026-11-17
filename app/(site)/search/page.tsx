import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { SearchExperience } from "@/components/catalogue/SearchExperience";
import type { RawCatalogueSearchParams } from "@/lib/catalogue-query";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Search jewellery",
  description:
    "Search the JS Jewellers catalogue by product name, filter by collection or availability, and sort by price.",
  path: "/search",
  noIndex: true,
});

/**
 * Search results depend on request-specific searchParams, so they cannot be
 * part of a shared static shell. Blocking this route keeps the final layout in
 * the first response instead of swapping a fallback for the results, which
 * previously moved the footer and produced 0.17 CLS.
 */
export const instant = false;

type SearchPageProps = {
  searchParams: Promise<RawCatalogueSearchParams>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <section aria-labelledby="search-heading">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Search" }]}
        />

        <div className="reveal-on-scroll mt-8 max-w-2xl">
          <p className="eyebrow">Catalogue</p>
          <h1
            id="search-heading"
            className="heading-page heading-gold mt-3 text-4xl md:text-5xl"
          >
            Search jewellery
          </h1>
          <p className="body-copy mt-4 text-base">
            Search products by name, filter by collection or availability, and
            sort by price.
          </p>
        </div>

        <SearchExperience searchParams={params} />
      </div>
    </section>
  );
}
