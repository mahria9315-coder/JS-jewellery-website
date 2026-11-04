import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { CollectionCard } from "@/components/catalogue/CollectionCard";
import { collections } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Collections | J's Jewellery",
  description:
    "Browse the eight jewellery collections available at J's Jewellery.",
};

export default function CollectionsPage() {
  return (
    <section className="bg-white" aria-labelledby="collections-heading">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Collections" }]}
        />

        <div className="mt-8 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-charcoal">
            Collections
          </p>
          <h1
            id="collections-heading"
            className="mt-3 text-4xl md:text-5xl"
          >
            Shop jewellery collections
          </h1>
          <p className="mt-4 text-base text-charcoal">
            Browse all eight collections. Product listings will appear once
            approved supplier-backed products are configured.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </ul>
      </div>
    </section>
  );
}
