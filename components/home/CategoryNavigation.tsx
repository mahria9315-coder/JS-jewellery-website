import Link from "next/link";

import { collectionLinks } from "@/lib/site-navigation";

export function CategoryNavigation() {
  return (
    <section className="bg-white" aria-labelledby="categories-heading">
      <div className="container-page py-section md:py-section-lg">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-charcoal">
            Collections
          </p>
          <h2 id="categories-heading" className="mt-3 text-3xl md:text-4xl">
            Shop by category
          </h2>
          <p className="mt-4 text-base text-charcoal">
            Browse the collections available at J&apos;s Jewellery.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collectionLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex h-full min-h-28 flex-col justify-between rounded-brand border border-charcoal/15 bg-white p-5 transition-colors hover:border-gold focus-visible:outline-offset-4"
              >
                <span className="font-serif text-xl text-obsidian">
                  {link.label}
                </span>
                <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-charcoal transition-colors group-hover:text-obsidian">
                  Explore
                  <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
