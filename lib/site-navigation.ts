import { collections } from "./collections";

export type NavItem = {
  label: string;
  href: string;
};

/**
 * Primary navigation. The catalogue search route is implemented in T011; the
 * cart destination is implemented in later approved task T017.
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
 * Policy routes. T029 publishes the owner-supplied draft `/privacy` and
 * `/returns` pages. Final approval and legal review remain PENDING OWNER
 * APPROVAL. See `app/privacy/page.tsx` and `app/returns/page.tsx`.
 */
export const policyLinks: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "Shipping & Delivery", href: "/shipping" },
];
