import Link from "next/link";

import { collections } from "@/lib/collections";

export function CollectionLinks({
  currentSlug,
}: {
  currentSlug?: string;
}) {
  const links = collections.filter(
    (collection) => collection.slug !== currentSlug,
  );

  return (
    <nav
      aria-label="Other collections"
      className="mt-12 border-t border-champagne/10 pt-8"
    >
      <h2 className="font-nav text-sm font-semibold not-italic text-white">
        Other collections
      </h2>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
        {links.map((collection) => (
          <li key={collection.slug}>
            <Link
              href={`/collections/${collection.slug}`}
              className="font-nav inline-flex min-h-11 items-center text-sm font-medium text-champagne/70 underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-accent focus-visible:outline-focus"
            >
              {collection.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
