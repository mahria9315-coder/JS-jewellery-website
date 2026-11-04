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
      className="mt-12 border-t border-charcoal/15 pt-8"
    >
      <h2 className="text-sm font-medium text-obsidian">Other collections</h2>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
        {links.map((collection) => (
          <li key={collection.slug}>
            <Link
              href={`/collections/${collection.slug}`}
              className="inline-flex min-h-11 items-center text-sm text-charcoal underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-obsidian"
            >
              {collection.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
