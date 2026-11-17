import Link from "next/link";

import type { Collection } from "@/lib/collections";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <li className="h-full">
      <Link
        href={`/collections/${collection.slug}`}
        className="card-3d group min-h-28 justify-between p-5 focus-visible:outline-focus"
      >
        <span className="card-3d-title">{collection.name}</span>
        <span className="card-3d-cta font-nav mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-champagne/60 transition-colors">
          Explore
          <span aria-hidden="true">&rarr;</span>
        </span>
      </Link>
    </li>
  );
}
