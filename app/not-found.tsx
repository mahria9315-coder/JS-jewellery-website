import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-white" aria-labelledby="not-found-heading">
      <div className="container-page py-section md:py-section-lg">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-charcoal">
          Page not found
        </p>
        <h1 id="not-found-heading" className="mt-3 text-4xl md:text-5xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-4 max-w-prose text-base text-charcoal">
          The page may have moved, or the product may no longer be available.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/collections"
            className="inline-flex min-h-11 items-center justify-center rounded-brand bg-obsidian px-6 py-3 text-sm text-white transition-colors hover:bg-charcoal"
          >
            Browse collections
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-brand border border-charcoal/30 px-6 py-3 text-sm text-obsidian transition-colors hover:border-obsidian"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
