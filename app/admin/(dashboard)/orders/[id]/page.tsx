import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Notice,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { PrintButton } from "@/components/admin/PrintButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { getOrderForAdminById } from "@/lib/orders/queries";
import { hasPermission } from "@/lib/admin/permissions";
import { requireAdminPage } from "@/lib/admin/session";
import {
  ORDER_STATUS_LABELS,
  getAllowedOrderTransitions,
  type OrderState,
} from "@/lib/orders/status";
import {
  PRODUCTION_STATUS_LABELS,
  getAllowedProductionTransitions,
  type ProductionState,
} from "@/lib/orders/production-status";
import {
  COURIER_FULFILMENT_STATUS_LABELS,
  getAllowedCourierFulfilmentTransitions,
  type CourierFulfilmentState,
} from "@/lib/orders/courier-status";
import { CustomizationSummary } from "@/components/customization/CustomizationSummary";
import {
  PAYMENT_STATUS_LABELS,
  type PaymentState,
} from "@/lib/payments/transitions";
import { formatPkr } from "@/lib/catalogue";
import { pageMetadata } from "@/lib/site";
import {
  rejectPaymentAction,
  updateOrderCourierAction,
  updateOrderStatusAction,
  updateProductionStatusAction,
  verifyPaymentAction,
} from "@/lib/actions/admin";
import {
  cancelOrderAction,
  saveOrderNoteAction,
} from "@/lib/actions/admin-content";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Order details",
  description: "Private order management.",
  path: "/admin/orders",
  noIndex: true,
});

type OrderAdminPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminOrderPage({
  params,
  searchParams,
}: OrderAdminPageProps) {
  const context = await requireAdminPage("orders.view");
  const { id } = await params;
  const query = await searchParams;
  const permissions = context.user.role.permissions;
  const canManage = hasPermission(permissions, "orders.manage");
  const canCancel = hasPermission(permissions, "orders.cancel");
  const canVerifyPayment = hasPermission(permissions, "payments.verify");
  const order = await getOrderForAdminById(id);

  if (!order) {
    notFound();
  }

  const orderState = order.orderStatus as OrderState;
  const paymentState = order.paymentStatus as PaymentState;
  const productionState = order.productionStatus as ProductionState;
  const courierFulfilmentState = order.courierFulfilmentStatus as CourierFulfilmentState;
  const allowedTransitions = getAllowedOrderTransitions(orderState);
  const allowedProductionTransitions =
    getAllowedProductionTransitions(productionState);
  const allowedCourierTransitions =
    getAllowedCourierFulfilmentTransitions(courierFulfilmentState);
  const marginMinor = order.items.reduce(
    (total, item) => total + item.marginMinor,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading-editorial heading-champagne text-2xl font-mono">
            {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-champagne/70">
            Placed {new Date(order.createdAt).toLocaleString("en-PK")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 print:hidden">
          <PrintButton label="Print order" />
          <Link
            href="/admin/orders"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
          >
            Back to orders
          </Link>
        </div>
      </div>

      {first(query.error) ? <Notice tone="error">{first(query.error)}</Notice> : null}
      {query.order === "updated" ? (
        <Notice tone="success">Order status updated.</Notice>
      ) : null}
      {query.order === "cancelled" ? (
        <Notice tone="warning">Order cancelled and reserved stock restored where applicable.</Notice>
      ) : null}
      {query.order === "note" ? (
        <Notice tone="success">Internal order note saved.</Notice>
      ) : null}
      {query.payment === "verified" ? (
        <Notice tone="success">Payment marked verified.</Notice>
      ) : null}
      {query.payment === "rejected" ? (
        <Notice tone="warning">Payment marked rejected.</Notice>
      ) : null}
      {query.production === "updated" ? (
        <Notice tone="success">Production status updated.</Notice>
      ) : null}
      {query.courier === "updated" ? (
        <Notice tone="success">Courier shipment updated.</Notice>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={panelClass} aria-labelledby="admin-order-customer">
          <h3 id="admin-order-customer" className="heading-editorial heading-champagne text-xl">
            Customer and delivery
          </h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-champagne/60">Name</dt>
              <dd className="text-white">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-champagne/60">Email</dt>
              <dd className="text-white">{order.customerEmail}</dd>
            </div>
            <div>
              <dt className="text-champagne/60">Phone</dt>
              <dd className="text-white">{order.customerPhone}</dd>
            </div>
            <div>
              <dt className="text-champagne/60">Address</dt>
              <dd className="text-white">
                {order.addressLine1}
                {order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.city},{" "}
                {order.countryCode}
                {order.postalCode ? ` ${order.postalCode}` : ""}
              </dd>
            </div>
            {order.customerNotes ? (
              <div>
                <dt className="text-champagne/60">Customer notes</dt>
                <dd className="whitespace-pre-line text-white">{order.customerNotes}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-champagne/60">Delivery estimate</dt>
              <dd className="text-white">{order.deliveryEstimate}</dd>
            </div>
            <div>
              <dt className="text-champagne/60">Policy version</dt>
              <dd className="font-mono text-xs text-white">{order.policyVersion}</dd>
            </div>
          </dl>
        </section>

        <section className={panelClass} aria-labelledby="admin-order-payment">
          <h3 id="admin-order-payment" className="heading-editorial heading-champagne text-xl">
            Payment verification
          </h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-champagne/60">Method</dt>
              <dd className="text-white">
                {order.paymentMethod.replaceAll("_", " ").toLowerCase()}
              </dd>
            </div>
            <div>
              <dt className="text-champagne/60">Status</dt>
              <dd className="text-white">
                {PAYMENT_STATUS_LABELS[paymentState] ?? order.paymentStatus}
              </dd>
            </div>
            <div>
              <dt className="text-champagne/60">Customer reference</dt>
              <dd className="select-all text-white">
                {order.paymentReference ?? "none submitted"}
              </dd>
            </div>
            <div>
              <dt className="text-champagne/60">Submitted</dt>
              <dd className="text-white">
                {order.paymentSubmittedAt
                  ? new Date(order.paymentSubmittedAt).toLocaleString("en-PK")
                  : "not submitted"}
              </dd>
            </div>
            <div>
              <dt className="text-champagne/60">Verified</dt>
              <dd className="text-white">
                {order.paymentVerifiedAt
                  ? `${new Date(order.paymentVerifiedAt).toLocaleString("en-PK")} by ${order.paymentVerifiedBy ?? "an administrator"}`
                  : "not verified"}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-sm text-champagne/70">
            Confirm the money actually arrived in the approved account before
            verifying. This action is recorded in the audit log.
          </p>

          {canVerifyPayment && paymentState === "SUBMITTED" ? (
            <div className="mt-4 space-y-4">
              <form action={verifyPaymentAction} className="space-y-3">
                <input type="hidden" name="orderId" value={order.id} />
                <div>
                  <label htmlFor="verifyNote" className={labelClass}>
                    Verification note
                  </label>
                  <input
                    id="verifyNote"
                    name="note"
                    required
                    minLength={3}
                    maxLength={500}
                    placeholder="Transaction matched in the bank statement."
                    className={inputClass}
                  />
                </div>
                <button type="submit" className={buttonPrimary}>
                  Mark payment verified
                </button>
              </form>

              <form action={rejectPaymentAction} className="space-y-3">
                <input type="hidden" name="orderId" value={order.id} />
                <div>
                  <label htmlFor="rejectNote" className={labelClass}>
                    Rejection note
                  </label>
                  <input
                    id="rejectNote"
                    name="note"
                    required
                    minLength={3}
                    maxLength={500}
                    placeholder="No matching transfer was received."
                    className={inputClass}
                  />
                </div>
                <button type="submit" className={buttonDanger}>
                  Reject payment
                </button>
              </form>
            </div>
          ) : canVerifyPayment && paymentState === "PENDING" ? (
            <Notice tone="info">
              This order is awaiting a customer payment reference. Verify or
              reject is available only after a reference has been submitted.
            </Notice>
          ) : !canVerifyPayment && paymentState === "SUBMITTED" ? (
            <p className="mt-4 text-sm text-champagne/60">
              Payment verification requires the payments.verify permission.
            </p>
          ) : null}
        </section>
      </div>

      <section className={panelClass} aria-labelledby="admin-order-items">
        <h3 id="admin-order-items" className="heading-editorial heading-champagne text-xl">
          Items and private margin
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-champagne/70">
                <th scope="col" className="py-2 pr-4 font-semibold">Product</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Supplier (private)</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Qty</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Price</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Cost (private)</th>
                <th scope="col" className="py-2 font-semibold">Margin</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gold/10">
                  <td className="py-3 pr-4 text-white">
                    {item.productName}
                    <span className="block font-mono text-xs text-champagne/60">
                      {item.sku}
                    </span>
                    {item.customizationText &&
                    item.customizationFont &&
                    item.customizationColour ? (
                      <CustomizationSummary
                        customization={{
                          text: item.customizationText,
                          font: item.customizationFont,
                          colour: item.customizationColour,
                          instructions: item.customizationInstructions,
                        }}
                      />
                    ) : null}
                  </td>
                  <td className="py-3 pr-4 text-champagne">{item.supplierName}</td>
                  <td className="py-3 pr-4 text-champagne">{item.quantity}</td>
                  <td className="py-3 pr-4 text-champagne">
                    {formatPkr({ amountMinor: item.lineTotalMinor, currency: "PKR" })}
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {formatPkr({
                      amountMinor: item.supplierCostMinor * item.quantity,
                      currency: "PKR",
                    })}
                  </td>
                  <td className="py-3 text-champagne">
                    {formatPkr({ amountMinor: item.marginMinor, currency: "PKR" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-champagne/70">
          Order margin: {formatPkr({ amountMinor: marginMinor, currency: "PKR" })}.
          Supplier cost and margin are never shown on public pages.
        </p>
      </section>

      <section className={panelClass} aria-labelledby="admin-order-status">
        <h3 id="admin-order-status" className="heading-editorial heading-champagne text-xl">
          Order status
        </h3>
        <p className="mt-2 text-sm text-champagne/70">
          Current: {ORDER_STATUS_LABELS[orderState] ?? order.orderStatus}. Status
          changes require a note or evidence reference and are audited.
        </p>

        {allowedTransitions.length === 0 ? (
          <p className="mt-3 text-sm text-champagne">
            This order has reached a terminal status.
          </p>
        ) : canManage ? (
          <form action={updateOrderStatusAction} className="mt-4 flex flex-wrap items-end gap-4">
            <input type="hidden" name="orderId" value={order.id} />
            <div>
              <label htmlFor="to" className={labelClass}>New status</label>
              <select id="to" name="to" required className={inputClass}>
                {allowedTransitions.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-64 flex-1">
              <label htmlFor="statusNote" className={labelClass}>
                Note or evidence reference
              </label>
              <input
                id="statusNote"
                name="note"
                required
                minLength={3}
                maxLength={500}
                className={inputClass}
              />
            </div>
            <button type="submit" className={buttonSecondary}>
              Update status
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-champagne/60">
            Updating order status requires the orders.manage permission.
          </p>
        )}

        {order.statusEvents.length > 0 ? (
          <ol className="mt-5 space-y-2 border-t border-gold/20 pt-4 text-sm text-champagne/70">
            {order.statusEvents.map((event) => (
              <li key={event.id}>
                <span className="text-white">
                  {ORDER_STATUS_LABELS[event.toStatus as OrderState] ??
                    event.toStatus}
                </span>{" "}
                — {new Date(event.createdAt).toLocaleString("en-PK")}
                {event.note ? ` — ${event.note}` : ""}
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      <section className={panelClass} aria-labelledby="admin-order-production">
        <h3
          id="admin-order-production"
          className="heading-editorial heading-champagne text-xl"
        >
          Production status
        </h3>
        <p className="mt-2 text-sm text-champagne/70">
          Current:{" "}
          {PRODUCTION_STATUS_LABELS[productionState] ?? order.productionStatus}.
          This workflow is separate from payment and order status, and is never
          advanced automatically when a payment is verified.
        </p>

        {allowedProductionTransitions.length === 0 ? (
          <p className="mt-3 text-sm text-champagne">
            Production is complete for this order.
          </p>
        ) : canManage ? (
          <form
            action={updateProductionStatusAction}
            className="mt-4 flex flex-wrap items-end gap-4"
          >
            <input type="hidden" name="orderId" value={order.id} />
            <div>
              <label htmlFor="productionTo" className={labelClass}>
                New production status
              </label>
              <select
                id="productionTo"
                name="to"
                required
                className={inputClass}
              >
                {allowedProductionTransitions.map((status) => (
                  <option key={status} value={status}>
                    {PRODUCTION_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-64 flex-1">
              <label htmlFor="productionNote" className={labelClass}>
                Note or evidence reference
              </label>
              <input
                id="productionNote"
                name="note"
                required
                minLength={3}
                maxLength={500}
                className={inputClass}
              />
            </div>
            <button type="submit" className={buttonSecondary}>
              Update production
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-champagne/60">
            Updating production status requires the orders.manage permission.
          </p>
        )}

        {order.productionStatusEvents.length > 0 ? (
          <ol className="mt-5 space-y-2 border-t border-gold/20 pt-4 text-sm text-champagne/70">
            {order.productionStatusEvents.map((event) => (
              <li key={event.id}>
                <span className="text-white">
                  {PRODUCTION_STATUS_LABELS[event.toStatus as ProductionState] ??
                    event.toStatus}
                </span>{" "}
                — {new Date(event.createdAt).toLocaleString("en-PK")}
                {event.note ? ` — ${event.note}` : ""}
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      <section className={panelClass} aria-labelledby="admin-order-courier">
        <h3 id="admin-order-courier" className="heading-editorial heading-champagne text-xl">
          Courier shipment
        </h3>
        {order.courierCode ? (
          <>
            <p className="mt-2 text-sm text-champagne/70">
              Courier: {order.courierName ?? order.courierCode} (
              {order.courierCode}). Current:{" "}
              {COURIER_FULFILMENT_STATUS_LABELS[courierFulfilmentState] ??
                order.courierFulfilmentStatus}
              . This workflow is separate from payment, order, and production
              status and is never advanced automatically.
            </p>
            {order.courierTrackingNumber ? (
              <p className="mt-2 text-sm text-champagne">
                Tracking reference:{" "}
                <span className="select-all font-mono text-white">
                  {order.courierTrackingNumber}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-champagne/70">
                No tracking reference recorded yet.
              </p>
            )}
            {allowedCourierTransitions.length === 0 ? (
              <p className="mt-3 text-sm text-champagne">
                This courier shipment has reached a terminal state.
              </p>
            ) : canManage ? (
              <form
                action={updateOrderCourierAction}
                className="mt-4 flex flex-wrap items-end gap-4"
              >
                <input type="hidden" name="orderId" value={order.id} />
                <div>
                  <label htmlFor="courierTo" className={labelClass}>
                    New courier status
                  </label>
                  <select
                    id="courierTo"
                    name="courierFulfilmentStatus"
                    required
                    className={inputClass}
                  >
                    {allowedCourierTransitions.map((status) => (
                      <option key={status} value={status}>
                        {COURIER_FULFILMENT_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="courierTracking" className={labelClass}>
                    Tracking reference
                  </label>
                  <input
                    id="courierTracking"
                    name="courierTrackingNumber"
                    defaultValue={order.courierTrackingNumber ?? ""}
                    maxLength={40}
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-champagne/50">
                    Use the courier reference exactly as printed on the
                    consignment or booking receipt.
                  </p>
                </div>
                <div className="min-w-64 flex-1">
                  <label htmlFor="courierNote" className={labelClass}>
                    Note or evidence reference
                  </label>
                  <input
                    id="courierNote"
                    name="note"
                    required
                    minLength={3}
                    maxLength={500}
                    className={inputClass}
                  />
                </div>
                <button type="submit" className={buttonSecondary}>
                  Update courier shipment
                </button>
              </form>
            ) : (
              <p className="mt-3 text-sm text-champagne/60">
                Updating the courier shipment requires the orders.manage
                permission.
              </p>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-champagne/70">
            This order was created without an approved courier (Pakistan
            orders keep working this way until a domestic courier is fully
            approved), so there is no courier shipment to manage here. Record
            any courier booking for this order in the internal note instead.
          </p>
        )}
      </section>

      <section className={panelClass} aria-labelledby="admin-order-notes">
        <h3 id="admin-order-notes" className="heading-editorial heading-champagne text-xl">
          Internal notes
        </h3>
        <p className="mt-2 text-sm text-champagne/70">
          Private fulfilment and review notes. Never shown to customers.
        </p>
        {canManage ? (
          <form action={saveOrderNoteAction} className="mt-4 space-y-3">
            <input type="hidden" name="orderId" value={order.id} />
            <div>
              <label htmlFor="internalNote" className={labelClass}>
                Internal note
              </label>
              <textarea
                id="internalNote"
                name="note"
                rows={4}
                maxLength={4000}
                defaultValue={order.internalNotes ?? ""}
                className={inputClass}
              />
            </div>
            <SubmitButton variant="secondary">Save note</SubmitButton>
          </form>
        ) : (
          <p className="mt-4 whitespace-pre-wrap text-sm text-champagne">
            {order.internalNotes || "No internal note recorded."}
          </p>
        )}
      </section>

      {canCancel ? (
        <section className={panelClass} aria-labelledby="admin-order-cancel">
          <h3 id="admin-order-cancel" className="heading-editorial heading-champagne text-xl">
            Cancel order
          </h3>
          <p className="mt-2 text-sm text-champagne/70">
            Cancellation is audited and restores reserved stock only where the
            order was not already fulfilled. This does not transfer a refund.
          </p>
          <form action={cancelOrderAction} className="mt-4 space-y-3">
            <input type="hidden" name="orderId" value={order.id} />
            <div>
              <label htmlFor="cancelNote" className={labelClass}>
                Cancellation reason
              </label>
              <input
                id="cancelNote"
                name="note"
                required
                minLength={3}
                maxLength={500}
                className={inputClass}
              />
            </div>
            <SubmitButton variant="danger">Cancel order</SubmitButton>
          </form>
        </section>
      ) : null}

      <section className={panelClass} aria-labelledby="admin-order-returns">
        <h3 id="admin-order-returns" className="heading-editorial heading-champagne text-xl">
          Returns
        </h3>
        {order.returnRequests.length === 0 ? (
          <p className="mt-2 text-sm text-champagne/70">
            No return request for this order.
          </p>
        ) : (
          <ul className="mt-3 space-y-3 text-sm">
            {order.returnRequests.map((request) => (
              <li key={request.id} className="rounded-brand border border-gold/20 p-4">
                <p className="font-semibold text-white">
                  {request.reason.replaceAll("_", " ").toLowerCase()} —{" "}
                  {request.status.replaceAll("_", " ").toLowerCase()}
                </p>
                <p className="mt-1 text-champagne/70">
                  Refund:{" "}
                  {formatPkr({ amountMinor: request.refundAmountMinor, currency: "PKR" })}
                  {request.deductionMinor > 0
                    ? ` after a ${request.deductionPercent}% deduction.`
                    : " with no deduction."}
                </p>
                <Link
                  href="/admin/returns"
                  className="mt-2 inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                >
                  Manage on the returns page
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
