export type NavItem = {
  label: string;
  href: string;
};

/**
 * Primary navigation. Destination routes for catalogue, search, and cart are
 * implemented in later approved tasks (T008, T011, T017).
 */
export const primaryLinks: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "Customized Name", href: "/collections/customized-name-jewellery" },
  { label: "Search", href: "/search" },
  { label: "Cart", href: "/cart" },
];

export const shopLinks: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "Search", href: "/search" },
  { label: "Cart", href: "/cart" },
];

export const collectionLinks: NavItem[] = [
  { label: "Women's Jewellery", href: "/collections/womens-jewellery" },
  { label: "Men's Jewellery", href: "/collections/mens-jewellery" },
  { label: "Bracelets", href: "/collections/bracelets" },
  { label: "Necklaces", href: "/collections/necklaces" },
  { label: "Rings", href: "/collections/rings" },
  { label: "Earrings", href: "/collections/earrings" },
  { label: "Pearl Jewellery", href: "/collections/pearl-jewellery" },
  {
    label: "Customized Name Jewellery",
    href: "/collections/customized-name-jewellery",
  },
];

/**
 * Policy routes are created in T029. Labels only: no policy wording is
 * defined yet, and none is invented here.
 */
export const policyLinks: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Returns & Exchanges", href: "/returns" },
];
