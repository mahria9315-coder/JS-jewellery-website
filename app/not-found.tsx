import Link from "next/link";

export default function NotFound() {
  return (
    <section aria-labelledby="not-found-heading">
      <div className="container-page py-section md:py-section-lg">
        <p className="eyebrow">Page not found</p>
        <h1
          id="not-found-heading"
          className="heading-page heading-ivory mt-3 text-4xl md:text-5xl"
        >
          We couldn&apos;t find that page
        </h1>
        <p className="body-copy mt-4 max-w-prose text-base">
          The page may have moved, or the product may no longer be available.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/collections"
            className="gold-shimmer font-nav inline-flex min-h-11 items-center justify-center rounded-brand bg-gold px-6 py-3 text-sm font-semibold text-on-gold transition-colors hover:bg-gold-strong focus-visible:outline-focus"
          >
            <span>Browse collections</span>
          </Link>
          <Link
            href="/"
            className="font-nav inline-flex min-h-11 items-center justify-center rounded-brand border border-gold/40 px-6 py-3 text-sm font-medium text-champagne transition-colors hover:border-gold hover:text-accent focus-visible:outline-focus"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
