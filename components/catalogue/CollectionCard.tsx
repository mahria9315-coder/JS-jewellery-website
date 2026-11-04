import Link from "next/link";

import type { Collection } from "@/lib/collections";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <li>
      <Link
        href={`/collections/${collection.slug}`}
        className="group flex h-full min-h-28 flex-col justify-between rounded-brand border border-charcoal/15 bg-white p-5 transition-colors hover:border-gold focus-visible:outline-offset-4"
      >
        <span className="font-serif text-xl text-obsidian">
          {collection.name}
        </span>
        <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-charcoal transition-colors group-hover:text-obsidian">
          Explore
          <span aria-hidden="true">&rarr;</span>
        </span>
      </Link>
    </li>
  );
}
