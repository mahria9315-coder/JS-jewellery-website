import Link from "next/link";

import { collectionLinks } from "@/lib/site-navigation";

export function CategoryNavigation() {
  return (
    <section
      className="border-t border-gold/15"
      aria-labelledby="categories-heading"
    >
      <div className="container-page reveal-on-scroll py-section md:py-section-lg">
        <div className="max-w-2xl">
          <p className="eyebrow">Collections</p>
          <h2
            id="categories-heading"
            className="heading-editorial heading-gold mt-3 text-3xl md:text-4xl"
          >
            Shop by category
          </h2>
          <p className="body-copy mt-4 text-base">
            Browse the collections available at JS Jewellers.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collectionLinks.map((link) => (
            <li key={link.href} className="h-full">
              <Link
                href={link.href}
                className="card-3d group min-h-28 justify-between p-5 focus-visible:outline-focus"
              >
                <span className="card-3d-title">{link.label}</span>
                <span className="card-3d-cta font-nav mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-champagne/60 transition-colors">
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
