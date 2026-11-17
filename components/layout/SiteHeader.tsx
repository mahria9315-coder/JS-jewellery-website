"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  collectionLinks as defaultCollectionLinks,
  primaryLinks as defaultPrimaryLinks,
  type NavItem,
} from "@/lib/site-navigation";

import { SiteLogo } from "./SiteLogo";
import { ThemeToggle } from "./ThemeToggle";

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

export function SiteHeader({
  primary = defaultPrimaryLinks,
  collections = defaultCollectionLinks,
}: {
  primary?: NavItem[];
  collections?: NavItem[];
} = {}) {
  const pathname = usePathname();
  const currentHref = getCurrentHref(pathname, primary);
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
    <header className="sticky top-0 z-40 border-b border-gold/25 bg-header">
      <div className="container-page flex items-center justify-between gap-4 py-4 sm:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <SiteLogo onNavigate={() => setOpen(false)} />
          <span
            aria-hidden="true"
            className="brand-wordmark hidden text-2xl lg:inline-block"
          >
            JS Jewellers
          </span>
        </div>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {primary.map((link) => {
              const current = currentHref === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    className={`nav-link font-nav inline-flex min-h-11 items-center text-sm font-medium transition-colors ${
                      current
                        ? "text-white"
                        : "text-champagne hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-none items-center gap-2.5">
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-brand border border-champagne/25 text-champagne transition-colors hover:border-gold hover:text-white md:hidden"
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
      </div>

      <div
        id="mobile-navigation"
        className={`${open ? "block" : "hidden"} border-t border-gold/20 bg-header md:hidden`}
      >
        <nav aria-label="Mobile primary" className="container-page py-4">
          <ul className="flex flex-col">
            {primary.map((link) => {
              const current = currentHref === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`font-nav flex min-h-11 items-center border-b border-champagne/10 py-2 text-base font-medium ${
                      current ? "text-white" : "text-champagne"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="font-nav mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Collections
          </p>
          <ul className="mt-2 flex flex-col">
            {collections.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-nav flex min-h-11 items-center border-b border-champagne/10 py-2 text-sm text-champagne/80"
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
