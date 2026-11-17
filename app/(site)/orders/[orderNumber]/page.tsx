import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { CustomizationSummary } from "@/components/customization/CustomizationSummary";
import {
  PaymentSubmissionForm,
  ReturnRequestForm,
} from "@/components/orders/OrderForms";
import {
  Notice,
  linkClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { formatPkr } from "@/lib/catalogue";
import { buildTrackingUrl } from "@/lib/couriers/config";
import { getPublicCourierByCode } from "@/lib/couriers/public";
import { getReturnEligibility } from "@/lib/admin/returns";
import { getOrderForCustomer } from "@/lib/orders/queries";
import {
  ORDER_STATUS_LABELS,
  type OrderState,
} from "@/lib/orders/status";
import {
  PRODUCTION_STATUS_LABELS,
  type ProductionState,
} from "@/lib/orders/production-status";
import { PAYMENT_STATUS_LABELS, type PaymentState } from "@/lib/payments/transitions";
import {
  fromDatabasePaymentMethod,
  formatPaymentReference,
  paymentMethodLabel,
} from "@/lib/payments/reference";
import { getPaymentInstructions } from "@/lib/payments/methods";
import {
  RETURN_REASON_LABELS,
  RETURN_REASON_CATEGORIES,
} from "@/lib/returns/refund";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Your order",
  description: "Private JS Jewellers order confirmation and payment status.",
  path: "/orders/lookup",
  noIndex: true,
});

type OrderPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

const OPEN_RETURN_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"];

const RETURN_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted — awaiting review",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved — refund pending",
  REJECTED: "Rejected",
  REFUND_PROCESSED: "Refund processed",
};

export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const { orderNumber } = await params;
  const query = await searchParams;
  const token = first(query.token);

  const order = await getOrderForCustomer(orderNumber, token);

  if (!order) {
    notFound();
  }

  const methodId = fromDatabasePaymentMethod(order.paymentMethod);
  const instructions = getPaymentInstructions(methodId);
  const paymentStatus = order.paymentStatus as PaymentState;
  const paymentReference = formatPaymentReference(order.orderNumber);
  const returnEligibility = await getReturnEligibility(orderNumber, token);

  // Courier tracking link, shown only when both a tracking reference and an
  // approved courier tracking template exist. Never invented or inferred.
  const courier = await getPublicCourierByCode(order.courierCode);
  const courierTrackingUrl = buildTrackingUrl(
    courier?.trackingUrlTemplate ?? null,
    order.courierTrackingNumber,
  );
  const openReturn = order.returnRequests.some((request) =>
    OPEN_RETURN_STATUSES.includes(request.status),
  );
  const returnReasons = RETURN_REASON_CATEGORIES.map((reason) => ({
    value: reason,
    label: RETURN_REASON_LABELS[reason],
  }));

  return (
    <section aria-labelledby="order-heading">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Orders", href: "/orders/lookup" },
            { label: order.orderNumber },
          ]}
        />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Order confirmation</p>
            <h1
              id="order-heading"
              className="heading-page heading-gold mt-3 text-4xl md:text-5xl"
            >
              {order.orderNumber}
            </h1>
            <p className="body-copy mt-4 text-base">
              Thank you, {order.customerName}. Keep this private link: anyone
              with it can see this order. Do not share it publicly.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-champagne/70">
              Order status:{" "}
              <strong className="text-white">
                {ORDER_STATUS_LABELS[order.orderStatus as OrderState] ??
                  order.orderStatus}
              </strong>
            </p>
            <p className="text-champagne/70">
              Payment status:{" "}
              <strong className="text-white">
                {PAYMENT_STATUS_LABELS[paymentStatus] ?? order.paymentStatus}
              </strong>
            </p>
            <p className="text-champagne/70">
              Production status:{" "}
              <strong className="text-white">
                {PRODUCTION_STATUS_LABELS[
                  order.productionStatus as ProductionState
                ] ?? order.productionStatus}
              </strong>
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {query.payment === "submitted" ? (
            <Notice tone="success">
              Payment details received. Our team will verify the payment
              manually. Your order is not marked paid until then.
            </Notice>
          ) : null}
          {query.return === "submitted" ? (
            <Notice tone="success">
              Your return request was submitted for review.
            </Notice>
          ) : null}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_23rem] lg:items-start">
          <div className="space-y-6">
            <section className={panelClass} aria-labelledby="order-items">
              <h2
                id="order-items"
                className="heading-editorial heading-champagne text-2xl"
              >
                Items
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {order.items.map((item) => (
                  <li key={item.id}>
                    <div className="flex justify-between gap-4">
                      <span className="text-champagne">
                        {item.productName}
                        <span className="text-champagne/60">
                          {" "}
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold text-white">
                        {formatPkr({
                          amountMinor: item.lineTotalMinor,
                          currency: "PKR",
                        })}
                      </span>
                    </div>
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
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between gap-4 border-t border-gold/20 pt-4">
                <span className="font-semibold text-white">Subtotal</span>
                <span className="font-semibold text-white">
                  {formatPkr({
                    amountMinor: order.subtotalMinor,
                    currency: "PKR",
                  })}
                </span>
              </div>
              {order.shippingMinor > 0 ? (
                <div className="mt-2 flex justify-between gap-4 text-sm">
                  <span className="text-champagne">
                    Shipping{order.courierName ? ` (${order.courierName})` : ""}
                  </span>
                  <span className="font-semibold text-white">
                    {formatPkr({
                      amountMinor: order.shippingMinor,
                      currency: "PKR",
                    })}
                  </span>
                </div>
              ) : null}
              <div className="mt-2 flex justify-between gap-4 border-t border-gold/20 pt-4">
                <span className="font-semibold text-white">Total</span>
                <span className="font-nav text-lg font-semibold text-accent">
                  {formatPkr({
                    amountMinor: order.totalMinor,
                    currency: "PKR",
                  })}
                </span>
              </div>
              <p className="mt-3 text-sm text-champagne/70">
                Delivery estimate: {order.deliveryEstimate}. This is an estimate,
                not a guaranteed date.
              </p>
              {order.courierName && order.courierTrackingNumber ? (
                <p className="mt-3 text-sm text-champagne/70">
                  Courier: {order.courierName}. Tracking reference:{" "}
                  <span className="select-all font-mono text-white">
                    {order.courierTrackingNumber}
                  </span>
                  {courierTrackingUrl ? (
                    <>
                      {" — "}
                      <a
                        href={courierTrackingUrl}
                        className={linkClass}
                        rel="noopener noreferrer"
                      >
                        Track this shipment on the courier website
                      </a>
                    </>
                  ) : null}
                </p>
              ) : null}
            </section>

            <section className={panelClass} aria-labelledby="order-payment">
              <h2
                id="order-payment"
                className="heading-editorial heading-champagne text-2xl"
              >
                {paymentMethodLabel(methodId)}
              </h2>

              {instructions ? (
                <div className="mt-4 space-y-2 text-sm text-champagne">
                  {instructions.bankDisplayName ? (
                    <p>
                      Bank:{" "}
                      <strong className="text-white">
                        {instructions.bankDisplayName}
                      </strong>
                    </p>
                  ) : null}
                  <p>
                    Account number:{" "}
                    <strong className="select-all text-white">
                      {instructions.accountNumber}
                    </strong>
                  </p>
                  {instructions.accountHolder ? (
                    <p>
                      Account holder:{" "}
                      <strong className="text-white">
                        {instructions.accountHolder}
                      </strong>
                    </p>
                  ) : null}
                  <p>
                    Amount:{" "}
                    <strong className="text-white">
                      {formatPkr({
                        amountMinor: order.totalMinor,
                        currency: "PKR",
                      })}
                    </strong>
                  </p>
                  <p>
                    Payment reference:{" "}
                    <strong className="select-all text-white">
                      {paymentReference}
                    </strong>
                  </p>
                </div>
              ) : (
                <Notice tone="warning">
                  Payment instructions are not configured for this method yet.
                  Please contact us before sending any money. Do not transfer to
                  an unverified account.
                </Notice>
              )}

              <p className="mt-4 text-sm text-champagne/70">
                Send the exact total and include the payment reference. Our team
                verifies every payment manually. Never send money to an account
                that is not shown on this page.
              </p>

              {paymentStatus === "PENDING" || paymentStatus === "REJECTED" ? (
                <>
                  {paymentStatus === "REJECTED" ? (
                    <Notice tone="warning">
                      The previous payment details could not be verified. Submit
                      the corrected transaction reference below, or contact us.
                    </Notice>
                  ) : null}
                  {instructions ? (
                    <PaymentSubmissionForm
                      orderNumber={order.orderNumber}
                      accessToken={token}
                      suggestedReference={paymentReference}
                    />
                  ) : null}
                </>
              ) : null}

              {paymentStatus === "SUBMITTED" ? (
                <Notice tone="info">
                  Payment submitted
                  {order.paymentReference
                    ? ` (reference ${order.paymentReference})`
                    : ""}
                  . Awaiting manual verification.
                </Notice>
              ) : null}

              {paymentStatus === "VERIFIED" ? (
                <Notice tone="success">Payment verified. Thank you.</Notice>
              ) : null}

              {paymentStatus === "REFUNDED" ? (
                <Notice tone="info">This order has been refunded.</Notice>
              ) : null}

              {order.paymentEvents.length > 0 ? (
                <div className="mt-5 border-t border-gold/20 pt-4">
                  <h3 className="font-nav text-sm font-semibold uppercase tracking-[0.16em] text-champagne/70">
                    Payment history
                  </h3>
                  <ol className="mt-2 space-y-2 text-sm text-champagne/70">
                    {order.paymentEvents.map((event) => (
                      <li key={event.id}>
                        <span className="text-white">
                          {PAYMENT_STATUS_LABELS[event.toStatus as PaymentState] ??
                            event.toStatus}
                        </span>
                        <span>
                          {" "}
                          — {new Date(event.createdAt).toLocaleDateString("en-PK")}
                        </span>

                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </section>

            <section className={panelClass} aria-labelledby="order-returns">
              <h2
                id="order-returns"
                className="heading-editorial heading-champagne text-2xl"
              >
                Returns
              </h2>
              <p className="mt-2 text-sm text-champagne/70">
                {returnEligibility.reason}
              </p>

              {order.returnRequests.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {order.returnRequests.map((request) => (
                    <li
                      key={request.id}
                      className="rounded-brand border border-gold/20 p-4 text-sm"
                    >
                      <p className="font-semibold text-white">
                        {RETURN_REASON_LABELS[
                          request.reason as keyof typeof RETURN_REASON_LABELS
                        ] ?? request.reason}
                        :{" "}
                        {RETURN_STATUS_LABELS[request.status] ?? request.status}
                      </p>
                      <p className="mt-1 text-champagne/70">
                        Refund amount:{" "}
                        {formatPkr({
                          amountMinor: request.refundAmountMinor,
                          currency: "PKR",
                        })}
                        {request.deductionMinor > 0
                          ? ` after a ${request.deductionPercent}% change-of-mind deduction.`
                          : request.protectedCase
                            ? " (protected case — no deduction)."
                            : "."}
                      </p>
                      {request.status === "REJECTED" ? (
                        <p className="mt-1 text-champagne/70">
                          If you need help with this decision, contact JS
                          Jewellers with your order number.
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {returnEligibility.eligible && !openReturn ? (
                <ReturnRequestForm
                  orderNumber={order.orderNumber}
                  accessToken={token}
                  reasons={returnReasons}
                />
              ) : null}
            </section>
          </div>

          <aside className={`${panelClass} lg:sticky lg:top-28`}>
            <h2 className="heading-editorial heading-champagne text-2xl">
              Need help?
            </h2>
            <p className="mt-3 text-sm text-champagne/70">
              Contact us with your order number and we will help with payment
              verification, delivery, or a return.
            </p>
            <Link href="/orders/lookup" className={`${linkClass} mt-3`}>
              Look up another order
            </Link>
            <Link href="/shipping" className={`${linkClass} mt-2`}>
              Delivery information
            </Link>
            <Link href="/returns" className={`${linkClass} mt-2`}>
              Returns and refunds
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
