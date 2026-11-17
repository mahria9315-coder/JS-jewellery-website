import type { Metadata } from "next";

import { CategoryNavigation } from "@/components/home/CategoryNavigation";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeShowcase } from "@/components/home/HomeShowcase";
import { getPublicHomeSections } from "@/lib/admin/content";
import { getPublicHomeHero } from "@/lib/public-settings";
import { SITE_DESCRIPTION, pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "JS Jewellers | Jewellery Store",
  description: SITE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

const FALLBACK_HOME_SECTIONS = [
  {
    key: "new-arrivals",
    eyebrow: "New arrivals",
    heading: "New Arrivals",
    description:
      "New additions to the store will be listed here as approved products become available.",
    placeholderTitle: "Awaiting approved products",
    placeholderNote:
      "New arrivals will be shown here once approved supplier-backed products are configured.",
  },
  {
    key: "best-sellers",
    eyebrow: "Best sellers",
    heading: "Best Sellers",
    description:
      "This section will show best sellers based on genuine sales data or approved manual merchandising.",
    placeholderTitle: "Awaiting sales or merchandising data",
    placeholderNote:
      "Best sellers will be shown here once genuine sales data or approved manual merchandising is available.",
  },
  {
    key: "special-offers",
    eyebrow: "Offers",
    heading: "Special Offers",
    description:
      "Offers will be shown here only when genuine discounts are configured.",
    placeholderTitle: "No current offers",
    placeholderNote: "There are no special offers at the moment.",
  },
  {
    key: "featured-jewellery",
    eyebrow: "Featured",
    heading: "Featured Jewellery",
    description:
      "Featured pieces will be shown here when owner-approved products are available.",
    placeholderTitle: "Awaiting approved products",
    placeholderNote:
      "Featured jewellery will appear once owner-approved supplier products are configured.",
  },
] as const;

export default async function Home() {
  const [dbSections, hero] = await Promise.all([
    getPublicHomeSections().catch(() => []),
    getPublicHomeHero(),
  ]);
  const sections = dbSections.length > 0 ? dbSections : [...FALLBACK_HOME_SECTIONS];

  return (
    <>
      <HomeHero content={hero} />
      <CategoryNavigation />

      {sections.map((section, index) => {
        const tone =
          "tone" in section && section.tone === "muted" ? "muted" : "light";

        return (
          <HomeShowcase
            key={section.key}
            id={section.key}
            eyebrow={section.eyebrow}
            title={section.heading}
            description={section.description}
            placeholderTitle={section.placeholderTitle}
            placeholderNote={section.placeholderNote}
            tone={
              "tone" in section ? tone : index % 2 === 0 ? "muted" : "light"
            }
            imageSrc={"imageSrc" in section ? section.imageSrc : null}
            imageAlt={"imageAlt" in section ? section.imageAlt : null}
            ctaLabel={"ctaLabel" in section ? section.ctaLabel : null}
            ctaHref={"ctaHref" in section ? section.ctaHref : null}
          />
        );
      })}
    </>
  );
}
