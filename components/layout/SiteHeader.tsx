"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { collectionLinks, primaryLinks } from "@/lib/site-navigation";

import { SiteLogo } from "./SiteLogo";

/**
 * Return the most specific navigation link for the current path. A parent link
 * such as /collections must not also be marked as the current page when a more
 * specific child link matches.
 */
function getCurrentHref(pathname: string, links: readonly { href: string }[]) {
  return links.reduce<string | undefined>((best, link) => {
    const matches =
      link.href === "/"
        ? pathname === "/"
        : pathname === link.href || pathname.startsWith(`${link.href}/`);

    if (!matches) {
      return best;
    }

    return !best || link.href.length > best.length ? link.href : best;
  }, undefined);
}

export function SiteHeader() {
  const pathname = usePathname();
  const currentHref = getCurrentHref(pathname, primaryLinks);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header className="border-b border-charcoal/15 bg-white">
      <div className="container-page flex items-center justify-between gap-6 py-4">
        <SiteLogo onNavigate={() => setOpen(false)} />

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {primaryLinks.map((link) => {
              const current = currentHref === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center text-sm transition-colors ${
                      current
                        ? "text-obsidian underline decoration-gold decoration-2 underline-offset-8"
                        : "text-charcoal hover:text-obsidian"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-brand border border-charcoal/20 text-obsidian transition-colors hover:border-charcoal md:hidden"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-5 w-5"
          >
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`${open ? "block" : "hidden"} border-t border-charcoal/15 md:hidden`}
      >
        <nav aria-label="Mobile primary" className="container-page py-4">
          <ul className="flex flex-col">
            {primaryLinks.map((link) => {
              const current = currentHref === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-11 items-center border-b border-charcoal/10 py-2 text-base ${
                      current ? "text-obsidian" : "text-charcoal"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-charcoal">
            Collections
          </p>
          <ul className="mt-2 flex flex-col">
            {collectionLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center border-b border-charcoal/10 py-2 text-sm text-charcoal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
