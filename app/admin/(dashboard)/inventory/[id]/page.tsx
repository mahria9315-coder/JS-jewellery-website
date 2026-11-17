import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
  formatDate,
} from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  buttonSecondary,
  inputClass,
  labelClass,
  linkClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  adjustInventoryAction,
  updateLowStockThresholdAction,
} from "@/lib/actions/admin-content";
import {
  INVENTORY_REASON_LABELS,
  INVENTORY_REASONS,
  type InventoryReason,
  getInventoryProduct,
} from "@/lib/admin/inventory";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Stock adjustment",
  description: "Private stock adjustment.",
  path: "/admin/inventory",
  noIndex: true,
});

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InventoryProductPage({
  params,
  searchParams,
}: PageProps) {
  const context = await requireAdminPage("inventory.view");
  const { id } = await params;
  const query = await searchParams;
  const canManage = context.user.role.permissions.includes("inventory.manage");
  const product = await getInventoryProduct(id).catch(() => null);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Catalogue"
        title={product.name}
        description="Stock changes are recorded with a reason, note, and your administrator identity. Negative stock is never allowed here."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Inventory", href: "/admin/inventory" },
          { label: product.name },
        ]}
        actions={
          <Link href={`/admin/products/${product.id}`} className={linkClass}>
            Open product
          </Link>
        }
      />

      <AdminQueryNotice params={query} />

      <dl className="grid gap-4 sm:grid-cols-3">
        {[
          ["Recorded stock", product.stockQuantity ?? "Not recorded"],
          ["Low-stock threshold", product.lowStockThreshold],
          ["Availability", product.availability.replaceAll("_", " ")],
        ].map(([label, value]) => (
          <div key={label} className={panelClass}>
            <dt className="text-sm text-champagne/70">{label}</dt>
            <dd className="font-nav mt-2 text-xl font-semibold text-accent">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {product.stockQuantity === null ? (
        <p className="rounded-card border border-amber-400/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
          No supplier-confirmed stock count is recorded. Enter the confirmed
          count through the product record before adjusting stock here.
        </p>
      ) : canManage ? (
        <section className={panelClass} aria-labelledby="adjust-stock">
          <h3 id="adjust-stock" className="heading-editorial heading-champagne text-xl">
            Adjust stock
          </h3>
          <form action={adjustInventoryAction} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="productId" value={product.id} />
            <div>
              <label htmlFor="delta" className={labelClass}>
                Change (positive or negative whole units)
              </label>
              <input
                id="delta"
                name="delta"
                type="number"
                step="1"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="reason" className={labelClass}>
                Reason
              </label>
              <select id="reason" name="reason" required className={inputClass}>
                {INVENTORY_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {INVENTORY_REASON_LABELS[reason]}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="note" className={labelClass}>
                Note or reference
              </label>
              <input
                id="note"
                name="note"
                required
                minLength={3}
                maxLength={500}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton>Record adjustment</SubmitButton>
            </div>
          </form>
        </section>
      ) : (
        <p className="text-sm text-champagne/60">
          You have view-only access to inventory.
        </p>
      )}

      {canManage ? (
        <section className={panelClass} aria-labelledby="threshold">
          <h3 id="threshold" className="heading-editorial heading-champagne text-xl">
            Low-stock threshold
          </h3>
          <form
            action={updateLowStockThresholdAction}
            className="mt-4 flex flex-wrap items-end gap-4"
          >
            <input type="hidden" name="productId" value={product.id} />
            <div>
              <label htmlFor="threshold" className={labelClass}>
                Alert at or below
              </label>
              <input
                id="threshold"
                name="threshold"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={product.lowStockThreshold}
                className={inputClass}
              />
            </div>
            <SubmitButton variant="secondary">Save threshold</SubmitButton>
          </form>
        </section>
      ) : null}

      <section aria-labelledby="history">
        <h3 id="history" className="heading-editorial heading-champagne text-xl">
          Movement history
        </h3>
        {product.inventoryMovements.length === 0 ? (
          <p className="mt-3 text-sm text-champagne/70">
            No stock movements recorded for this product.
          </p>
        ) : (
          <div className="mt-4">
            <AdminTable caption="Stock movement history" minWidth="48rem">
              <thead>
                <tr>
                  <AdminTh>When</AdminTh>
                  <AdminTh>Reason</AdminTh>
                  <AdminTh>Note</AdminTh>
                  <AdminTh align="right">Change</AdminTh>
                  <AdminTh align="right">Stock</AdminTh>
                  <AdminTh>By</AdminTh>
                </tr>
              </thead>
              <tbody>
                {product.inventoryMovements.map((movement) => (
                  <tr key={movement.id}>
                    <AdminTd>{formatDate(movement.createdAt)}</AdminTd>
                    <AdminTd>
                      {INVENTORY_REASON_LABELS[movement.reason as InventoryReason] ??
                        movement.reason}
                    </AdminTd>
                    <AdminTd>{movement.note}</AdminTd>
                    <AdminTd align="right">
                      {movement.delta > 0 ? "+" : ""}
                      {movement.delta}
                    </AdminTd>
                    <AdminTd align="right">
                      {movement.previousStock ?? "-"} → {movement.newStock ?? "-"}
                    </AdminTd>
                    <AdminTd>{movement.actor}</AdminTd>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </div>
        )}
      </section>

      <div>
        <Link href="/admin/inventory" className={buttonSecondary}>
          Back to inventory
        </Link>
      </div>
    </div>
  );
}
