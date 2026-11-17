import Link from "next/link";

import {
  collectionLinks as defaultCollectionLinks,
  policyLinks as defaultPolicyLinks,
  shopLinks as defaultShopLinks,
  type NavItem,
} from "@/lib/site-navigation";
import {
  DEFAULT_BUSINESS_CONTACT,
  type BusinessContact,
} from "@/lib/public-settings-core";

import { SiteLogo } from "./SiteLogo";

const footerLinkClass =
  "font-nav inline-flex min-h-11 items-center text-sm font-medium text-champagne/70 transition-colors hover:text-accent focus-visible:outline-focus";

const footerHeadingClass =
  "font-nav text-xs font-semibold not-italic uppercase tracking-[0.16em] text-accent";

export function SiteFooter({
  shop = defaultShopLinks,
  collections = defaultCollectionLinks,
  policies = defaultPolicyLinks,
  contact = DEFAULT_BUSINESS_CONTACT,
}: {
  shop?: NavItem[];
  collections?: NavItem[];
  policies?: NavItem[];
  contact?: BusinessContact;
} = {}) {
  return (
    <footer className="surface-footer border-t border-gold/25">
      <div className="container-page">
        <div className="flex flex-col items-center gap-3 py-section text-center">
          <div className="footer-logo-stage">
            <SiteLogo variant="footer" />
          </div>
          <p className="brand-wordmark text-3xl sm:text-4xl">
            {contact.storeName}
          </p>
          <p className="heading-editorial heading-champagne text-2xl">
            Jewellery for every occasion.
          </p>
          <p className="max-w-md text-sm text-champagne/70">
            Explore women&apos;s, men&apos;s, and customized name jewellery,
            curated with care.
          </p>
        </div>

        <div className="grid gap-10 border-t border-champagne/10 py-10 sm:grid-cols-2 lg:grid-cols-3">
          <nav aria-label="Footer shop">
            <h2 className={footerHeadingClass}>Shop</h2>
            <ul className="mt-3 flex flex-col">
              {shop.map((link) => (
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
              {collections.map((link) => (
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
                {policies.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerLinkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="mt-4 text-sm text-champagne/60">{contact.location}</p>
            {contact.openingHours ? (
              <p className="mt-1 text-sm text-champagne/60">
                {contact.openingHours}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-champagne/60">
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-nav inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 transition-colors hover:text-champagne focus-visible:outline-focus"
              >
                WhatsApp {contact.whatsappDisplay}
                <span className="sr-only"> (opens WhatsApp in a new tab)</span>
              </a>
            </p>
            <p className="text-sm text-champagne/60">
              Email:{" "}
              <a
                href={contact.emailUrl}
                className="font-nav inline-flex min-h-11 items-center break-all font-semibold text-accent underline decoration-gold/40 underline-offset-4 transition-colors hover:text-champagne focus-visible:outline-focus"
              >
                {contact.email}
                <span className="sr-only"> (opens your email app)</span>
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-champagne/10 py-6">
          <p className="text-xs text-champagne/60">
            &copy; {contact.legalName}. {contact.storeName} is the trading name
            of {contact.legalName}.
          </p>
        </div>
      </div>
    </footer>
  );
}
