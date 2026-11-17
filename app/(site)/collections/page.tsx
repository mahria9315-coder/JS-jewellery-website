import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { CollectionCard } from "@/components/catalogue/CollectionCard";
import { collections } from "@/lib/collections";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Collections",
  description:
    "Browse the eight JS Jewellers collections: women's jewellery, men's jewellery, bracelets, necklaces, rings, earrings, pearl jewellery, and customized name jewellery.",
  path: "/collections",
});

export default function CollectionsPage() {
  return (
    <section aria-labelledby="collections-heading">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Collections" }]}
        />

        <div className="reveal-on-scroll mt-8 max-w-2xl">
          <p className="eyebrow">Collections</p>
          <h1
            id="collections-heading"
            className="heading-page heading-gold mt-3 text-4xl md:text-5xl"
          >
            Shop jewellery collections
          </h1>
          <p className="body-copy mt-4 text-base">
            Browse all eight collections. Product listings will appear once
            approved supplier-backed products are configured.
          </p>
        </div>

        <ul className="reveal-on-scroll mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </ul>
      </div>
    </section>
  );
}
