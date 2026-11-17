/**
 * Demo-content safeguards (spec §4.1).
 *
 * Demo products and images are approved for development and preview only. They
 * must be visibly labelled as demo content, must never be published as the
 * production catalogue, and must never be orderable.
 *
 * The application has no demo records and no seed data. A record is treated as
 * demo content when its slug, SKU, or name begins with an explicit `DEMO`
 * marker (for example `demo-ring-01`, `DEMO-SKU-1`, or `DEMO Ring`). This keeps
 * the safeguard dependency-free and impossible to trigger accidentally for
 * genuine owner-supplied products.
 */

const DEMO_MARKER = /^(?:demo\b|\[demo\]|demo[-_ ])/i;

export type DemoProductIdentity = {
  slug?: string | null;
  sku?: string | null;
  name?: string | null;
};

export function isDemoProduct(identity: DemoProductIdentity): boolean {
  return [identity.slug, identity.sku, identity.name].some((value) => {
    const trimmed = value?.trim() ?? "";
    return trimmed !== "" && DEMO_MARKER.test(trimmed);
  });
}

export const DEMO_PRODUCT_PUBLICATION_BLOCKER =
  "Demo products are development/preview content and cannot be published.";

export const DEMO_PRODUCT_ORDER_BLOCKER =
  "Demo products are preview-only and cannot be ordered.";

/** Visible label for any demo record that is shown in a preview context. */
export const DEMO_PRODUCT_BADGE = "DEMO — preview only";
