import Link from "next/link";

export function HomeHero() {
  return (
    <section className="surface-dark border-b border-gold/25" aria-labelledby="hero-heading">
      <div className="container-page grid items-center gap-12 py-section md:py-section-lg lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">
            J&apos;s Jewellery
          </p>
          <h1
            id="hero-heading"
            className="mt-4 text-4xl text-white sm:text-5xl lg:text-6xl"
          >
            Jewellery for every occasion
          </h1>
          <p className="mt-6 max-w-prose text-base text-champagne">
            Explore women&apos;s, men&apos;s, and customized name jewellery, selected
            for customers across Pakistan.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/collections"
              className="inline-flex min-h-11 items-center justify-center rounded-brand bg-gold px-6 py-3 text-sm font-medium text-obsidian transition-colors hover:bg-champagne focus-visible:outline-champagne"
            >
              Shop Now
            </Link>
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center justify-center rounded-brand border border-champagne/40 px-6 py-3 text-sm text-white transition-colors hover:border-champagne focus-visible:outline-champagne"
            >
              Search jewellery
            </Link>
          </div>
        </div>

        <figure className="mx-auto w-full max-w-md">
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-brand border border-gold/30 bg-charcoal">
            <div
              aria-hidden="true"
              className="absolute -left-16 -top-16 h-56 w-56 rounded-full border border-gold/20"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full border border-champagne/15"
            />
            <div
              aria-hidden="true"
              className="absolute inset-6 rounded-brand border border-white/10"
            />
            <div className="relative text-center">
              <span
                aria-hidden="true"
                className="block font-serif text-7xl leading-none text-gold sm:text-8xl"
              >
                J&apos;s
              </span>
              <span
                aria-hidden="true"
                className="mt-4 block text-xs uppercase tracking-[0.4em] text-champagne"
              >
                Jewellery
              </span>
            </div>
          </div>
          <figcaption className="mt-3 text-center text-sm text-champagne">
            Campaign imagery placeholder — awaiting owner-approved artwork.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
