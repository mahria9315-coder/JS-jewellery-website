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
  "mt-1.5 min-h-11 w-full rounded-brand border border-charcoal/30 bg-white px-3 py-2.5 text-base text-obsidian placeholder:text-charcoal/70";
const labelClass = "text-sm font-medium text-obsidian";

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
      className="mt-8 rounded-brand border border-charcoal/15 bg-white p-4 sm:p-6"
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
          <p className="mt-1.5 text-xs text-charcoal">
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
            className="inline-flex min-h-11 items-center justify-center rounded-brand bg-gold px-5 py-2.5 text-sm font-medium text-obsidian transition-colors hover:bg-champagne"
          >
            Apply filters
          </button>
          {showClear && (
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center justify-center rounded-brand border border-charcoal/30 px-5 py-2.5 text-sm text-obsidian transition-colors hover:border-obsidian"
            >
              Clear filters
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
