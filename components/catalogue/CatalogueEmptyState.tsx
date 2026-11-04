import Link from "next/link";

type CatalogueEmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function CatalogueEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: CatalogueEmptyStateProps) {
  return (
    <div className="mt-10 rounded-brand border border-dashed border-charcoal/30 bg-champagne/40 px-6 py-12 text-center">
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
        Catalogue
      </p>
      <h2 className="mt-2 font-serif text-2xl text-obsidian">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg break-words text-sm text-charcoal">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-brand border border-charcoal/30 px-5 py-3 text-sm text-obsidian transition-colors hover:border-obsidian"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
