import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { SearchExperience } from "@/components/catalogue/SearchExperience";
import type { RawCatalogueSearchParams } from "@/lib/catalogue-query";

export const metadata: Metadata = {
  title: "Search jewellery | J's Jewellery",
  description:
    "Search J's Jewellery by product name, filter by collection or availability, and sort by price.",
};

type SearchPageProps = {
  searchParams: Promise<RawCatalogueSearchParams>;
};

function SearchFallback() {
  return (
    <div
      className="mt-8 rounded-brand border border-charcoal/15 bg-white p-6"
      role="status"
    >
      <p className="text-sm text-charcoal">Loading search…</p>
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <section className="bg-white" aria-labelledby="search-heading">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Search" }]}
        />

        <div className="mt-8 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-charcoal">
            Catalogue
          </p>
          <h1 id="search-heading" className="mt-3 text-4xl md:text-5xl">
            Search jewellery
          </h1>
          <p className="mt-4 text-base text-charcoal">
            Search products by name, filter by collection or availability, and
            sort by price.
          </p>
        </div>

        <Suspense fallback={<SearchFallback />}>
          <SearchExperience searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
