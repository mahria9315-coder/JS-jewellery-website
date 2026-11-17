import type { Metadata } from "next";

/**
 * Shared site identity and metadata helpers.
 *
 * The production domain has not been approved yet. The public base URL comes
 * from NEXT_PUBLIC_SITE_URL (see .env.example); when it is not set, local
 * development falls back to localhost. Never hard-code an unapproved domain.
 */
export const SITE_NAME = "JS Jewellers";

/**
 * Confirmed business details supplied by the owner. Publish only values that
 * the owner has actually provided. Do not add a street address, registration
 * number, tax number, or any other detail that has not been confirmed.
 */
export const BUSINESS_LEGAL_NAME = "JS Jewellery";
export const BUSINESS_LOCATION = "Karachi, Sindh, Pakistan";
export const BUSINESS_EMAIL = "mahria9315@gmail.com";
export const BUSINESS_EMAIL_URL = `mailto:${BUSINESS_EMAIL}`;
export const WHATSAPP_NUMBER_DISPLAY = "+92 333 9422818";
export const WHATSAPP_URL = "https://wa.me/923339422818";

/**
 * Client-approved delivery estimate for all intended destinations. This is an
 * estimate only: never present it as a guaranteed date, and do not attach
 * courier names, tracking promises, charges, or customs arrangements that the
 * owner has not confirmed.
 */
export const DELIVERY_ESTIMATE_DAYS_MIN = 4;
export const DELIVERY_ESTIMATE_DAYS_MAX = 7;
export const DELIVERY_ESTIMATE_DISPLAY = `${DELIVERY_ESTIMATE_DAYS_MIN}–${DELIVERY_ESTIMATE_DAYS_MAX} days`;

export const SITE_DESCRIPTION =
  "Explore the JS Jewellers collection: women's jewellery, men's jewellery, bracelets, necklaces, rings, earrings, pearl jewellery, and customized name jewellery.";

const FALLBACK_SITE_URL = "http://localhost:3000";

function resolveSiteUrl(value: string | undefined): string {
  const trimmed = value?.trim();

  if (!trimmed) {
    return FALLBACK_SITE_URL;
  }

  try {
    return new URL(trimmed).toString().replace(/\/+$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

/** Resolve a site-relative path to an absolute URL for metadata and JSON-LD. */
export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

type PageMetadataOptions = {
  /** Page title without the brand suffix, unless absoluteTitle is true. */
  title: string;
  description: string;
  /** Canonical, site-relative path such as "/collections/rings". */
  path: string;
  /** Use the title exactly as given instead of applying the brand template. */
  absoluteTitle?: boolean;
  /** Mark request-specific or utility pages as non-indexable. */
  noIndex?: boolean;
};

/** Build consistent title, description, canonical, and social metadata. */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en",
      url: absoluteUrl(path),
      title: socialTitle,
      description,
    },
    twitter: {
      card: "summary",
      title: socialTitle,
      description,
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
