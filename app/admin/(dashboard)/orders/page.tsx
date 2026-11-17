import type { Metadata } from "next";
import Link from "next/link";

import { AdminSearchForm } from "@/components/admin/AdminSearchForm";
import { firstParam } from "@/components/admin/AdminQueryNotice";
import { listOrdersForAdmin } from "@/lib/orders/queries";
import { requireAdminPage } from "@/lib/admin/session";
import { inputClass, labelClass, panelClass } from "@/components/ui/FormPrimitives";
import { formatPkr } from "@/lib/catalogue";
import { ORDER_STATUS_LABELS, type OrderState } from "@/lib/orders/status";
import {
  PAYMENT_STATUS_LABELS,
  type PaymentState,
} from "@/lib/payments/transitions";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Orders",
  description: "Private order management.",
  path: "/admin/orders",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ORDER_STATES = Object.keys(ORDER_STATUS_LABELS) as OrderState[];
const PAYMENT_STATES = Object.keys(PAYMENT_STATUS_LABELS) as PaymentState[];

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  await requireAdminPage("orders.view");
  const params = await searchParams;
  const search = (firstParam(params, "q") ?? "").trim();
  const orderStatus = (firstParam(params, "orderStatus") ?? "") as OrderState | "";
  const paymentStatus = (firstParam(params, "paymentStatus") ?? "") as
    | PaymentState
    | "";

  let orders: Awaited<ReturnType<typeof listOrdersForAdmin>> = [];
  let unavailable = false;

  try {
    orders = await listOrdersForAdmin({
      search: search || undefined,
      orderStatus: ORDER_STATES.includes(orderStatus as OrderState)
        ? (orderStatus as OrderState)
        : undefined,
      paymentStatus: PAYMENT_STATES.includes(paymentStatus as PaymentState)
        ? (paymentStatus as PaymentState)
        : undefined,
      limit: 120,
    });
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-editorial heading-champagne text-2xl">Orders</h2>
        <p className="mt-2 max-w-3xl text-sm text-champagne/70">
          Verify each manual payment before changing a payment to VERIFIED. Order
          status and payment status are separate: confirming an order does not
          confirm the money.
        </p>
      </div>

      <section className={panelClass} aria-label="Order filters">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
          <AdminSearchForm
            action="/admin/orders"
            defaultValue={search}
            label="Search orders"
            placeholder="Order number, customer, email, or reference…"
            extra={{
              orderStatus: orderStatus || undefined,
              paymentStatus: paymentStatus || undefined,
            }}
          />
          <form action="/admin/orders" method="get" className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="q" value={search} />
            <div>
              <label htmlFor="orderStatus" className={labelClass}>
                Order status
              </label>
              <select
                id="orderStatus"
                name="orderStatus"
                defaultValue={orderStatus}
                className={inputClass}
              >
                <option value="">All</option>
                {ORDER_STATES.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="paymentStatus" className={labelClass}>
                Payment
              </label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                defaultValue={paymentStatus}
                className={inputClass}
              >
                <option value="">All</option>
                {PAYMENT_STATES.map((status) => (
                  <option key={status} value={status}>
                    {PAYMENT_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-brand border border-gold/40 bg-charcoal px-4 text-sm font-semibold text-champagne hover:bg-black focus-visible:outline-focus"
            >
              Apply
            </button>
          </form>
        </div>
      </section>

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Orders could not be loaded because the database is unavailable.
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className={panelClass}>
          <p className="text-sm text-champagne/70">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[50rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-champagne/70">
                <th scope="col" className="py-2 pr-4 font-semibold">Order</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Customer</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Payment</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Order status</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Total</th>
                <th scope="col" className="py-2 font-semibold">Open</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gold/10">
                  <td className="py-3 pr-4 font-mono text-xs text-white">
                    {order.orderNumber}
                    <span className="block text-champagne/60">
                      {new Date(order.createdAt).toLocaleDateString("en-PK")}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {order.customerName}
                    <span className="block text-xs text-champagne/60">
                      {order.customerEmail}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentState] ??
                      order.paymentStatus}
                    <span className="block text-xs text-champagne/60">
                      {order.paymentMethod.replaceAll("_", " ").toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {ORDER_STATUS_LABELS[order.orderStatus as OrderState] ??
                      order.orderStatus}
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {formatPkr({ amountMinor: order.totalMinor, currency: "PKR" })}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                    >
                      Manage
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
