import { collections } from "./collections";

export type NavItem = {
  label: string;
  href: string;
};

/**
 * Primary navigation. Destination routes for search and cart are implemented
 * in later approved tasks (T011, T017).
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

export const collectionLinks: NavItem[] = collections.map((collection) => ({
  label: collection.name,
  href: `/collections/${collection.slug}`,
}));

/**
 * Policy routes are created in T029. Labels only: no policy wording is
 * defined yet, and none is invented here.
 */
export const policyLinks: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Returns & Exchanges", href: "/returns" },
];
