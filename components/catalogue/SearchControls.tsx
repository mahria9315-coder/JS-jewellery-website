import Link from "next/link";

import {
  availabilityFilterOptions,
  catalogueSortOptions,
  type CatalogueQuery,
} from "@/lib/catalogue-query";
import { collections } from "@/lib/collections";

type SearchControlsProps = {
  query: CatalogueQuery;
  showClear: boolean;
};

const fieldClass =
  "font-body mt-1.5 min-h-11 w-full rounded-brand border border-gold/30 bg-obsidian/60 px-3 py-2.5 text-base text-white placeholder:text-champagne/60 focus-visible:outline-focus";
const labelClass = "font-nav text-sm font-semibold not-italic text-champagne";

/**
 * Native GET form so search works without client-side JavaScript and every
 * result set has a shareable, bookmarkable URL. Values are pre-filled from the
 * validated query supplied by the server.
 */
export function SearchControls({ query, showClear }: SearchControlsProps) {
  return (
    <form
      action="/search"
      method="get"
      role="search"
      aria-label="Search and filter products"
      className="surface-panel mt-8 rounded-card border border-gold/20 p-4 sm:p-6"
    >
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-4">
          <label htmlFor="catalogue-search-q" className={labelClass}>
            Search by product name
          </label>
          <input
            id="catalogue-search-q"
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder="For example, necklace"
            autoComplete="off"
            className={fieldClass}
          />
          <p className="mt-1.5 text-xs text-champagne/60">
            Matches product names, ignoring letter case.
          </p>
        </div>

        <div>
          <label htmlFor="catalogue-search-collection" className={labelClass}>
            Collection
          </label>
          <select
            id="catalogue-search-collection"
            name="collection"
            defaultValue={query.collection}
            className={fieldClass}
          >
            <option value="all">All collections</option>
            {collections.map((collection) => (
              <option key={collection.slug} value={collection.slug}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catalogue-search-availability" className={labelClass}>
            Availability
          </label>
          <select
            id="catalogue-search-availability"
            name="availability"
            defaultValue={query.availability}
            className={fieldClass}
          >
            {availabilityFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catalogue-search-sort" className={labelClass}>
            Sort by
          </label>
          <select
            id="catalogue-search-sort"
            name="sort"
            defaultValue={query.sort}
            className={fieldClass}
          >
            {catalogueSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 self-end sm:flex-row lg:flex-col">
          <button
            type="submit"
            className="gold-shimmer font-nav inline-flex min-h-11 items-center justify-center rounded-brand bg-gold px-5 py-2.5 text-sm font-semibold text-on-gold transition-colors hover:bg-gold-strong focus-visible:outline-focus"
          >
            <span>Apply filters</span>
          </button>
          {showClear && (
            <Link
              href="/search"
              className="font-nav inline-flex min-h-11 items-center justify-center rounded-brand border border-gold/30 px-5 py-2.5 text-sm font-medium text-champagne transition-colors hover:border-gold hover:text-accent focus-visible:outline-focus"
            >
              Clear filters
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
