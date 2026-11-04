export type Collection = {
  slug: string;
  name: string;
  summary: string;
};

/**
 * The eight approved collections from spec.md §4.
 * Slugs match the navigation in lib/site-navigation.ts and the planned routes.
 */
export const collections = [
  {
    slug: "womens-jewellery",
    name: "Women's Jewellery",
    summary: "Browse the women's jewellery collection at J's Jewellery.",
  },
  {
    slug: "mens-jewellery",
    name: "Men's Jewellery",
    summary: "Browse the men's jewellery collection at J's Jewellery.",
  },
  {
    slug: "bracelets",
    name: "Bracelets",
    summary: "Browse bracelets in the J's Jewellery catalogue.",
  },
  {
    slug: "necklaces",
    name: "Necklaces",
    summary: "Browse necklaces in the J's Jewellery catalogue.",
  },
  {
    slug: "rings",
    name: "Rings",
    summary: "Browse rings in the J's Jewellery catalogue.",
  },
  {
    slug: "earrings",
    name: "Earrings",
    summary: "Browse earrings in the J's Jewellery catalogue.",
  },
  {
    slug: "pearl-jewellery",
    name: "Pearl Jewellery",
    summary: "Browse pearl jewellery in the J's Jewellery catalogue.",
  },
  {
    slug: "customized-name-jewellery",
    name: "Customized Name Jewellery",
    summary: "Browse customized name jewellery at J's Jewellery.",
  },
] as const satisfies readonly Collection[];

export type CollectionSlug = (typeof collections)[number]["slug"];

export function getCollection(slug: string) {
  return collections.find((collection) => collection.slug === slug);
}

export function getCollectionHref(slug: string) {
  return `/collections/${slug}`;
}
