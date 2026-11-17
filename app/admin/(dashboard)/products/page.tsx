import type { Metadata } from "next";
import Link from "next/link";

import { listAdminProducts } from "@/lib/admin/products";
import { requireAdminPage } from "@/lib/admin/session";
import {
  buttonPrimary,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { formatPkr } from "@/lib/catalogue";
import { DEMO_PRODUCT_BADGE, isDemoProduct } from "@/lib/demo-products";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Products",
  description: "Private product onboarding.",
  path: "/admin/products",
  noIndex: true,
});

export default async function AdminProductsPage() {
  await requireAdminPage("products.view");
  const products = await listAdminProducts();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading-editorial heading-champagne text-2xl">Products</h2>
          <p className="mt-2 max-w-3xl text-sm text-champagne/70">
            Every product must be linked to its real supplier. Supplier cost and
            margin are private. Do not invent products, prices, stock, or image
            rights.
          </p>
        </div>
        <Link href="/admin/products/new" className={buttonPrimary}>
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className={panelClass}>
          <p className="text-sm text-champagne/70">
            No products exist yet. Add a supplier first, then onboard a real
            product with its confirmed SKU, price, cost, stock, and image
            rights.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[54rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-champagne/70">
                <th scope="col" className="py-2 pr-4 font-semibold">Product</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Supplier</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Price</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Cost</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Margin</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Stock</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Publication</th>
                <th scope="col" className="py-2 font-semibold">Open</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gold/10">
                  <td className="py-3 pr-4 text-white">
                    {product.name}
                    {isDemoProduct(product) ? (
                      <span className="ml-2 inline-flex rounded-brand border border-gold/40 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-accent">
                        {DEMO_PRODUCT_BADGE}
                      </span>
                    ) : null}
                    <span className="block font-mono text-xs text-champagne/60">
                      {product.sku}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {product.supplier.legalName}
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {formatPkr({ amountMinor: product.sellingPriceMinor, currency: "PKR" })}
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {formatPkr({ amountMinor: product.supplierCostMinor, currency: "PKR" })}
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {formatPkr({
                      amountMinor: product.sellingPriceMinor - product.supplierCostMinor,
                      currency: "PKR",
                    })}
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {product.stockQuantity ?? "not supplied"}
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {product.publicationStatus.toLowerCase()}
                    <span className="block text-xs text-champagne/60">
                      {product.availability.replaceAll("_", " ").toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
