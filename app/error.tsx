"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Branded error boundary for unexpected runtime failures.
 *
 * The digest is shown so a customer can quote it to support; the underlying
 * error is never rendered, and no personal or order data is included.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Never write the raw error object to the browser console: its message or
    // stack can contain a server path or a fragment of internal state. The
    // digest is the correlation value already shown to the customer.
    console.error("[js-jewellers] render error", {
      digest: error.digest ?? null,
      name: error.name,
    });
  }, [error]);

  return (
    <section aria-labelledby="error-heading">
      <div className="container-page py-section md:py-section-lg">
        <p className="eyebrow">Something went wrong</p>
        <h1
          id="error-heading"
          className="heading-page heading-ivory mt-3 text-4xl md:text-5xl"
        >
          We couldn&apos;t load this page
        </h1>
        <p className="body-copy mt-4 max-w-prose text-base">
          The page ran into an unexpected problem. Nothing was charged and no
          order was placed by this error. Please try again, or return to the
          homepage.
        </p>
        {error.digest ? (
          <p className="mt-3 text-sm text-champagne/70">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={reset}
            className="gold-shimmer font-nav inline-flex min-h-11 items-center justify-center rounded-brand bg-gold px-6 py-3 text-sm font-semibold text-on-gold transition-colors hover:bg-gold-strong focus-visible:outline-focus"
          >
            Try again
          </button>
          <Link
            href="/"
            className="font-nav inline-flex min-h-11 items-center justify-center rounded-brand border border-gold/40 px-6 py-3 text-sm font-semibold text-champagne transition-colors hover:border-gold hover:text-ivory focus-visible:outline-focus"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
