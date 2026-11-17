import Image from "next/image";
import Link from "next/link";

type HomeShowcaseProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  placeholderTitle: string;
  placeholderNote: string;
  tone?: "light" | "muted";
  imageSrc?: string | null;
  imageAlt?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export function HomeShowcase({
  id,
  eyebrow,
  title,
  description,
  placeholderTitle,
  placeholderNote,
  tone = "light",
  imageSrc,
  imageAlt,
  ctaLabel,
  ctaHref,
}: HomeShowcaseProps) {
  const headingId = `${id}-heading`;
  const isMuted = tone === "muted";

  return (
    <section
      aria-labelledby={headingId}
      className={
        isMuted
          ? "surface-muted border-y border-gold/15"
          : "border-t border-gold/15"
      }
    >
      <div className="container-page reveal-on-scroll py-section md:py-section-lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">{eyebrow}</p>
            <h2
              id={headingId}
              className={`heading-editorial mt-3 text-3xl md:text-4xl ${
                isMuted ? "heading-gold" : "heading-ivory"
              }`}
            >
              {title}
            </h2>
            <p className="body-copy mt-4 text-base">{description}</p>
          </div>
          <Link
            href={ctaHref || "/collections"}
            className="font-nav inline-flex min-h-11 shrink-0 items-center rounded-brand text-sm font-medium text-accent underline decoration-gold/60 decoration-2 underline-offset-4 transition-colors hover:text-white hover:decoration-champagne focus-visible:outline-focus"
          >
            {ctaLabel || "Browse collections"}
          </Link>
        </div>

        {imageSrc ? (
          <div className="mt-10 overflow-hidden rounded-card border border-gold/25">
            <Image
              src={imageSrc}
              alt={imageAlt ?? ""}
              width={1600}
              height={800}
              sizes="(min-width: 1280px) 80rem, calc(100vw - 2rem)"
              className="h-auto w-full"
            />
          </div>
        ) : null}

        <div className="surface-panel mt-10 rounded-card border border-dashed border-gold/30 px-6 py-12 text-center">
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
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Placeholder
          </p>
          <p className="heading-editorial heading-champagne mt-2 text-2xl">
            {placeholderTitle}
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-champagne/70">
            {placeholderNote}
          </p>
        </div>
      </div>
    </section>
  );
}
