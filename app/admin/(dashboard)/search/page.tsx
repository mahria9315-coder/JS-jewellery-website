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
import { AdminSearchForm } from "@/components/admin/AdminSearchForm";
import { panelClass } from "@/components/ui/FormPrimitives";
import { listCustomers } from "@/lib/admin/customers";
import { listAdminProducts } from "@/lib/admin/products";
import { listSuppliers } from "@/lib/admin/suppliers";
import { requireAdminPage } from "@/lib/admin/session";
import { listOrdersForAdmin } from "@/lib/orders/queries";
import { formatPkr } from "@/lib/catalogue";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Administration search",
  description: "Private administration search.",
  path: "/admin/search",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSearchPage({ searchParams }: PageProps) {
  const context = await requireAdminPage();
  const params = await searchParams;
  const query = (firstParam(params, "q") ?? "").trim();
  const permissions = context.user.role.permissions;
  const canProducts = permissions.includes("products.view");
  const canOrders = permissions.includes("orders.view");
  const canCustomers = permissions.includes("customers.view");
  const canSuppliers = permissions.includes("suppliers.view");
  const canSearchAnything =
    canProducts || canOrders || canCustomers || canSuppliers;

  let products: Awaited<ReturnType<typeof listAdminProducts>> = [];
  let orders: Awaited<ReturnType<typeof listOrdersForAdmin>> = [];
  let customers: Awaited<ReturnType<typeof listCustomers>> = [];
  let suppliers: Awaited<ReturnType<typeof listSuppliers>> = [];
  let unavailable = false;

  if (query.length > 0 && canSearchAnything) {
    const needle = query.toLowerCase();

    try {
      const [productRows, orderRows, customerRows, supplierRows] =
        await Promise.all([
          canProducts ? listAdminProducts() : Promise.resolve([]),
          canOrders
            ? listOrdersForAdmin({ search: query, limit: 25 })
            : Promise.resolve([]),
          canCustomers ? listCustomers(query) : Promise.resolve([]),
          canSuppliers ? listSuppliers() : Promise.resolve([]),
        ]);

      products = canProducts
        ? productRows
            .filter(
              (product) =>
                product.name.toLowerCase().includes(needle) ||
                product.sku.toLowerCase().includes(needle) ||
                product.slug.toLowerCase().includes(needle),
            )
            .slice(0, 25)
        : [];
      orders = orderRows.slice(0, 25);
      customers = customerRows.slice(0, 25);
      suppliers = canSuppliers
        ? supplierRows
            .filter(
              (supplier) =>
                supplier.legalName.toLowerCase().includes(needle) ||
                (supplier.tradingName ?? "").toLowerCase().includes(needle),
            )
            .slice(0, 25)
        : [];
    } catch {
      unavailable = true;
    }
  }

  const total =
    products.length + orders.length + customers.length + suppliers.length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Administration"
        title="Search"
        description="Results are limited to the areas your role can view. Supplier and customer details stay private to administrators."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Search" },
        ]}
      />

      <AdminQueryNotice params={params} />

      <section className={panelClass}>
        <AdminSearchForm
          action="/admin/search"
          defaultValue={query}
          label="Search"
          placeholder="Order number, product, SKU, customer, supplier…"
        />
      </section>

      {!canSearchAnything ? (
        <p className="text-sm text-champagne/70">
          Your role does not include searchable records.
        </p>
      ) : query.length === 0 ? (
        <p className="text-sm text-champagne/70">
          Enter a search term to look through the records you can access.
        </p>
      ) : unavailable ? (
        <p className="text-sm text-amber-200">
          Records could not be searched because the database is unavailable.
        </p>
      ) : total === 0 ? (
        <p className="text-sm text-champagne/70">
          No records match “{query}”.
        </p>
      ) : (
        <>
          <p className="text-sm text-champagne/60">
            {total} result{total === 1 ? "" : "s"} for “{query}”.
          </p>

          {canOrders && orders.length > 0 ? (
            <section aria-labelledby="search-orders">
              <h3
                id="search-orders"
                className="heading-editorial heading-champagne text-xl"
              >
                Orders
              </h3>
              <div className="mt-3">
                <AdminTable caption="Matching orders" minWidth="48rem">
                  <thead>
                    <tr>
                      <AdminTh>Order</AdminTh>
                      <AdminTh>Customer</AdminTh>
                      <AdminTh>Status</AdminTh>
                      <AdminTh>Payment</AdminTh>
                      <AdminTh align="right">Total</AdminTh>
                      <AdminTh>Placed</AdminTh>
                      <AdminTh>Open</AdminTh>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <AdminTd>
                          <span className="font-mono text-xs">
                            {order.orderNumber}
                          </span>
                        </AdminTd>
                        <AdminTd>{order.customerName}</AdminTd>
                        <AdminTd>{order.orderStatus.replaceAll("_", " ")}</AdminTd>
                        <AdminTd>{order.paymentStatus.replaceAll("_", " ")}</AdminTd>
                        <AdminTd align="right">
                          {formatPkr({
                            amountMinor: order.totalMinor,
                            currency: "PKR",
                          })}
                        </AdminTd>
                        <AdminTd>{formatDate(order.createdAt)}</AdminTd>
                        <AdminTd>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                          >
                            Manage
                          </Link>
                        </AdminTd>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </div>
            </section>
          ) : null}

          {canProducts && products.length > 0 ? (
            <section aria-labelledby="search-products">
              <h3
                id="search-products"
                className="heading-editorial heading-champagne text-xl"
              >
                Products
              </h3>
              <div className="mt-3">
                <AdminTable caption="Matching products" minWidth="48rem">
                  <thead>
                    <tr>
                      <AdminTh>Product</AdminTh>
                      <AdminTh>SKU</AdminTh>
                      <AdminTh>Publication</AdminTh>
                      <AdminTh align="right">Price</AdminTh>
                      <AdminTh>Open</AdminTh>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <AdminTd>
                          <span className="font-semibold text-white">
                            {product.name}
                          </span>
                          <span className="block font-mono text-xs text-champagne/60">
                            {product.slug}
                          </span>
                        </AdminTd>
                        <AdminTd>
                          <span className="font-mono text-xs">{product.sku}</span>
                        </AdminTd>
                        <AdminTd>
                          <StatusPill
                            status={product.publicationStatus.replaceAll("_", " ")}
                          />
                        </AdminTd>
                        <AdminTd align="right">
                          {formatPkr({
                            amountMinor: product.sellingPriceMinor,
                            currency: "PKR",
                          })}
                        </AdminTd>
                        <AdminTd>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                          >
                            Open
                          </Link>
                        </AdminTd>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </div>
            </section>
          ) : null}

          {canCustomers && customers.length > 0 ? (
            <section aria-labelledby="search-customers">
              <h3
                id="search-customers"
                className="heading-editorial heading-champagne text-xl"
              >
                Customers
              </h3>
              <div className="mt-3">
                <AdminTable caption="Matching customers" minWidth="44rem">
                  <thead>
                    <tr>
                      <AdminTh>Customer</AdminTh>
                      <AdminTh>Phone</AdminTh>
                      <AdminTh>Status</AdminTh>
                      <AdminTh align="right">Orders</AdminTh>
                      <AdminTh>Open</AdminTh>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <AdminTd>
                          <span className="font-semibold text-white">
                            {customer.name}
                          </span>
                          <span className="block text-xs text-champagne/60">
                            {customer.email}
                          </span>
                        </AdminTd>
                        <AdminTd>{customer.phone}</AdminTd>
                        <AdminTd>
                          <StatusPill
                            status={
                              customer.status === "ACTIVE" ? "Active" : "Disabled"
                            }
                            tone={
                              customer.status === "ACTIVE" ? "success" : "danger"
                            }
                          />
                        </AdminTd>
                        <AdminTd align="right">{customer._count.orders}</AdminTd>
                        <AdminTd>
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                          >
                            Open
                          </Link>
                        </AdminTd>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </div>
            </section>
          ) : null}

          {canSuppliers && suppliers.length > 0 ? (
            <section aria-labelledby="search-suppliers">
              <h3
                id="search-suppliers"
                className="heading-editorial heading-champagne text-xl"
              >
                Suppliers
              </h3>
              <div className="mt-3">
                <AdminTable caption="Matching suppliers" minWidth="44rem">
                  <thead>
                    <tr>
                      <AdminTh>Supplier</AdminTh>
                      <AdminTh>Status</AdminTh>
                      <AdminTh>Verification</AdminTh>
                      <AdminTh align="right">Products</AdminTh>
                      <AdminTh>Open</AdminTh>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <AdminTd>
                          <span className="font-semibold text-white">
                            {supplier.tradingName ?? supplier.legalName}
                          </span>
                          <span className="block text-xs text-champagne/60">
                            {supplier.legalName}
                          </span>
                        </AdminTd>
                        <AdminTd>{supplier.status.replaceAll("_", " ")}</AdminTd>
                        <AdminTd>
                          {supplier.verificationStatus.replaceAll("_", " ")}
                        </AdminTd>
                        <AdminTd align="right">
                          {supplier._count.products}
                        </AdminTd>
                        <AdminTd>
                          <Link
                            href={`/admin/suppliers/${supplier.id}`}
                            className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                          >
                            Open
                          </Link>
                        </AdminTd>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
