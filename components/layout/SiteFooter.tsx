import Link from "next/link";

import {
  collectionLinks,
  policyLinks,
  shopLinks,
} from "@/lib/site-navigation";

import { SiteLogo } from "./SiteLogo";

const footerLinkClass =
  "inline-flex min-h-11 items-center text-sm text-champagne transition-colors hover:text-white focus-visible:outline-champagne";

const footerHeadingClass = "text-sm font-medium text-white";

export function SiteFooter() {
  return (
    <footer className="surface-dark border-t border-gold/25">
      <div className="container-page py-section">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <SiteLogo tone="dark" />
            <p className="mt-4 max-w-xs text-sm text-champagne">
              Jewellery store for customers in Pakistan.
            </p>
          </div>

          <nav aria-label="Footer shop">
            <h2 className={footerHeadingClass}>Shop</h2>
            <ul className="mt-3 flex flex-col">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer collections">
            <h2 className={footerHeadingClass}>Collections</h2>
            <ul className="mt-3 flex flex-col">
              {collectionLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={footerHeadingClass}>Help</h2>
            <nav aria-label="Footer policies">
              <ul className="mt-3 flex flex-col">
                {policyLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerLinkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="mt-4 text-sm text-champagne">
              Contact details will be published once approved.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6">
          <p className="text-xs text-champagne">
            &copy; J&apos;s Jewellery.
          </p>
        </div>
      </div>
    </footer>
  );
}
