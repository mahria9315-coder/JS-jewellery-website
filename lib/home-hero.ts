/**
 * Homepage hero content.
 *
 * The defaults are the owner-approved static hero. Administrators can override
 * each field in the homepage editor; invalid links or image paths fall back to
 * the approved defaults rather than rendering unsafe values.
 */

export type HomeHeroContent = {
  eyebrow: string;
  heading: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export const DEFAULT_HOME_HERO: HomeHeroContent = {
  eyebrow: "JS Jewellers",
  heading: "Jewellery for every occasion",
  description:
    "Explore women's, men's, and customized name jewellery, curated with care.",
  imageSrc: "/images/js-jewellers-hero.png",
  imageAlt: "Golden jewellery campaign artwork from JS Jewellers",
  primaryLabel: "Shop Now",
  primaryHref: "/collections",
  secondaryLabel: "Search jewellery",
  secondaryHref: "/search",
};

const SAFE_IMAGE = /^\/[A-Za-z0-9._\-/]+\.(avif|jpe?g|png|webp)$/i;
const SAFE_HTTPS = /^https:\/\/[A-Za-z0-9.-]+(?:\/|$)/;

function clean(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function isSafeHeroHref(value: string): boolean {
  const href = value.trim();

  if (href === "") return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;

  return SAFE_HTTPS.test(href);
}

export function isSafeHeroImage(value: string): boolean {
  const src = value.trim();
  return (
    SAFE_IMAGE.test(src) && !src.startsWith("//") && !src.includes("..")
  );
}

export function resolveHomeHero(
  settings: Partial<Record<string, string>>,
): HomeHeroContent {
  const imageSrc = clean(settings["homepage.heroImageSrc"]);
  const primaryHref = clean(settings["homepage.heroPrimaryHref"]);
  const secondaryHref = clean(settings["homepage.heroSecondaryHref"]);

  return {
    eyebrow: clean(settings["homepage.heroEyebrow"]) || DEFAULT_HOME_HERO.eyebrow,
    heading: clean(settings["homepage.heroHeading"]) || DEFAULT_HOME_HERO.heading,
    description:
      clean(settings["homepage.heroDescription"]) ||
      DEFAULT_HOME_HERO.description,
    imageSrc:
      imageSrc !== "" && isSafeHeroImage(imageSrc)
        ? imageSrc
        : DEFAULT_HOME_HERO.imageSrc,
    imageAlt:
      clean(settings["homepage.heroImageAlt"]) || DEFAULT_HOME_HERO.imageAlt,
    primaryLabel:
      clean(settings["homepage.heroPrimaryLabel"]) ||
      DEFAULT_HOME_HERO.primaryLabel,
    primaryHref:
      primaryHref && isSafeHeroHref(primaryHref)
        ? primaryHref
        : DEFAULT_HOME_HERO.primaryHref,
    secondaryLabel:
      clean(settings["homepage.heroSecondaryLabel"]) ||
      DEFAULT_HOME_HERO.secondaryLabel,
    secondaryHref:
      secondaryHref && isSafeHeroHref(secondaryHref)
        ? secondaryHref
        : DEFAULT_HOME_HERO.secondaryHref,
  };
}
