import type { Metadata } from "next";
import Link from "next/link";

import { AdminQueryNotice, firstParam } from "@/components/admin/AdminQueryNotice";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
  StatusPill,
  formatDate,
} from "@/components/admin/AdminUI";
import { buttonSecondary, inputClass, labelClass, panelClass } from "@/components/ui/FormPrimitives";
import {
  INVENTORY_REASON_LABELS,
  type InventoryReason,
  listInventory,
  listRecentInventoryMovements,
} from "@/lib/admin/inventory";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Inventory",
  description: "Private stock management.",
  path: "/admin/inventory",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InventoryPage({ searchParams }: PageProps) {
  await requireAdminPage("inventory.view");
  const params = await searchParams;
  const search = firstParam(params, "q") ?? "";

  let products: Awaited<ReturnType<typeof listInventory>> = [];
  let movements: Awaited<ReturnType<typeof listRecentInventoryMovements>> = [];
  let unavailable = false;

  try {
    [products, movements] = await Promise.all([
      listInventory(search),
      listRecentInventoryMovements(40),
    ]);
  } catch {
    unavailable = true;
  }

  const lowStock = products.filter(
    (product) =>
      product.stockQuantity !== null &&
      product.stockQuantity <= product.lowStockThreshold,
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Inventory"
        description="Stock is adjusted only through recorded movements. Each change is transactional and appears in the history below. A product with no supplier-confirmed count cannot be adjusted."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Inventory" },
        ]}
      />

      <AdminQueryNotice params={params} />

      <form method="get" className={`${panelClass} flex flex-wrap items-end gap-4`}>
        <div className="min-w-[16rem] flex-1">
          <label htmlFor="q" className={labelClass}>
            Search products
          </label>
          <input
            id="q"
            name="q"
            defaultValue={search}
            placeholder="Product name or SKU"
            className={inputClass}
          />
        </div>
        <button type="submit" className={buttonSecondary}>
          Search
        </button>
        {search ? (
          <Link href="/admin/inventory" className={buttonSecondary}>
            Clear
          </Link>
        ) : null}
      </form>

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Inventory data could not be loaded because the database is
            unavailable.
          </p>
        </div>
      ) : (
        <>
          {lowStock.length > 0 ? (
            <p className="rounded-card border border-amber-400/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
              {lowStock.length} product{lowStock.length === 1 ? "" : "s"} at or
              below the low-stock threshold.
            </p>
          ) : null}

          {products.length === 0 ? (
            <div className={panelClass}>
              <p className="text-sm text-champagne/70">
                {search
                  ? "No products match this search."
                  : "No products exist yet. Create a product and record a confirmed supplier stock count first."}
              </p>
            </div>
          ) : (
            <AdminTable caption="Product stock levels" minWidth="60rem">
              <thead>
                <tr>
                  <AdminTh>Product</AdminTh>
                  <AdminTh>SKU</AdminTh>
                  <AdminTh align="right">Stock</AdminTh>
                  <AdminTh align="right">Low at</AdminTh>
                  <AdminTh>Availability</AdminTh>
                  <AdminTh>Status</AdminTh>
                  <AdminTh>Updated</AdminTh>
                  <AdminTh>Open</AdminTh>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isLow =
                    product.stockQuantity !== null &&
                    product.stockQuantity <= product.lowStockThreshold;

                  return (
                    <tr key={product.id}>
                      <AdminTd>
                        <span className="font-semibold text-white">
                          {product.name}
                        </span>
                        {product.isArchived ? (
                          <span className="ml-2 text-xs text-red-300">Archived</span>
                        ) : null}
                      </AdminTd>
                      <AdminTd>
                        <span className="font-mono text-xs">{product.sku}</span>
                      </AdminTd>
                      <AdminTd align="right">
                        <StatusPill
                          status={
                            product.stockQuantity === null
                              ? "Not recorded"
                              : String(product.stockQuantity)
                          }
                          tone={
                            product.stockQuantity === null
                              ? "neutral"
                              : isLow
                                ? "danger"
                                : "success"
                          }
                        />
                      </AdminTd>
                      <AdminTd align="right">{product.lowStockThreshold}</AdminTd>
                      <AdminTd>{product.availability.replaceAll("_", " ")}</AdminTd>
                      <AdminTd>{product.publicationStatus.replaceAll("_", " ")}</AdminTd>
                      <AdminTd>{formatDate(product.updatedAt)}</AdminTd>
                      <AdminTd>
                        <Link
                          href={`/admin/inventory/${product.id}`}
                          className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                        >
                          Adjust
                        </Link>
                      </AdminTd>
                    </tr>
                  );
                })}
              </tbody>
            </AdminTable>
          )}

          <section aria-labelledby="movements">
            <h3 id="movements" className="heading-editorial heading-champagne text-xl">
              Recent stock movements
            </h3>
            {movements.length === 0 ? (
              <p className="mt-3 text-sm text-champagne/70">
                No stock movements recorded yet.
              </p>
            ) : (
              <div className="mt-4">
                <AdminTable caption="Recent stock movements" minWidth="56rem">
                  <thead>
                    <tr>
                      <AdminTh>When</AdminTh>
                      <AdminTh>Product</AdminTh>
                      <AdminTh>Reason</AdminTh>
                      <AdminTh align="right">Change</AdminTh>
                      <AdminTh align="right">Before</AdminTh>
                      <AdminTh align="right">After</AdminTh>
                      <AdminTh>By</AdminTh>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((movement) => (
                      <tr key={movement.id}>
                        <AdminTd>{formatDate(movement.createdAt)}</AdminTd>
                        <AdminTd>
                          {movement.product.name}
                          <span className="block font-mono text-xs text-champagne/60">
                            {movement.product.sku}
                          </span>
                        </AdminTd>
                        <AdminTd>
                          {INVENTORY_REASON_LABELS[
                            movement.reason as InventoryReason
                          ] ?? movement.reason}
                          {movement.note ? (
                            <span className="block text-xs text-champagne/60">
                              {movement.note}
                            </span>
                          ) : null}
                        </AdminTd>
                        <AdminTd align="right">
                          {movement.delta > 0 ? "+" : ""}
                          {movement.delta}
                        </AdminTd>
                        <AdminTd align="right">{movement.previousStock ?? "-"}</AdminTd>
                        <AdminTd align="right">{movement.newStock ?? "-"}</AdminTd>
                        <AdminTd>{movement.actor}</AdminTd>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
