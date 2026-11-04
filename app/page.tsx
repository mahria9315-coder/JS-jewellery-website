import type { Metadata } from "next";

import { CategoryNavigation } from "@/components/home/CategoryNavigation";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeShowcase } from "@/components/home/HomeShowcase";

export const metadata: Metadata = {
  title: "J's Jewellery | Jewellery Store in Pakistan",
  description:
    "Explore J's Jewellery collections: women's jewellery, men's jewellery, bracelets, necklaces, rings, earrings, pearl jewellery, and customized name jewellery.",
};

export default function Home() {
  return (
    <>
      <HomeHero />
      <CategoryNavigation />

      <HomeShowcase
        id="new-arrivals"
        eyebrow="New arrivals"
        title="New Arrivals"
        description="New additions to the store will be listed here as approved products become available."
        placeholderTitle="Awaiting approved products"
        placeholderNote="New arrivals will be shown here once approved supplier-backed products are configured."
        tone="muted"
      />

      <HomeShowcase
        id="best-sellers"
        eyebrow="Best sellers"
        title="Best Sellers"
        description="This section will show best sellers based on genuine sales data or approved manual merchandising."
        placeholderTitle="Awaiting sales or merchandising data"
        placeholderNote="Best sellers will be shown here once genuine sales data or approved manual merchandising is available."
      />

      <HomeShowcase
        id="special-offers"
        eyebrow="Offers"
        title="Special Offers"
        description="Offers will be shown here only when genuine discounts are configured."
        placeholderTitle="No current offers"
        placeholderNote="There are no special offers at the moment."
        tone="muted"
      />

      <HomeShowcase
        id="featured-jewellery"
        eyebrow="Featured"
        title="Featured Jewellery"
        description="Featured pieces will be shown here when owner-approved products are available."
        placeholderTitle="Awaiting approved products"
        placeholderNote="Featured jewellery will appear once owner-approved supplier products are configured."
      />
    </>
  );
}
