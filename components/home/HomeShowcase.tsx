import Link from "next/link";

type HomeShowcaseProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  placeholderTitle: string;
  placeholderNote: string;
  tone?: "light" | "muted";
};

export function HomeShowcase({
  id,
  eyebrow,
  title,
  description,
  placeholderTitle,
  placeholderNote,
  tone = "light",
}: HomeShowcaseProps) {
  const headingId = `${id}-heading`;
  const isMuted = tone === "muted";

  return (
    <section
      aria-labelledby={headingId}
      className={isMuted ? "surface-muted" : "bg-white"}
    >
      <div className="container-page py-section md:py-section-lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-charcoal">
              {eyebrow}
            </p>
            <h2 id={headingId} className="mt-3 text-3xl md:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-base text-charcoal">{description}</p>
          </div>
          <Link
            href="/collections"
            className="inline-flex min-h-11 shrink-0 items-center rounded-brand text-sm text-obsidian underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:decoration-obsidian"
          >
            Browse collections
          </Link>
        </div>

        <div
          className={`mt-10 rounded-brand border border-dashed border-charcoal/30 px-6 py-12 text-center ${
            isMuted ? "bg-white" : "bg-champagne/40"
          }`}
        >
          <span
            aria-hidden="true"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5 text-gold"
            >
              <path d="M12 3 21 12 12 21 3 12 12 3Z" />
            </svg>
          </span>
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-charcoal">
            Placeholder
          </p>
          <p className="mt-2 font-serif text-2xl text-obsidian">
            {placeholderTitle}
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-charcoal">
            {placeholderNote}
          </p>
        </div>
      </div>
    </section>
  );
}
