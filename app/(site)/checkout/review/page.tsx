import type { Metadata } from "next";
import { cookies } from "next/headers";
import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { PlaceOrderForm } from "@/components/checkout/PlaceOrderForm";
import { CustomizationSummary } from "@/components/customization/CustomizationSummary";
import {
  Notice,
  buttonSecondary,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { getCartView } from "@/lib/cart/server";
import {
  countryDisplayName,
  getIndicativeCourierShippingForCountry,
} from "@/lib/couriers/public";
import { formatPkr } from "@/lib/catalogue";
import type { CheckoutValue } from "@/lib/checkout/validation";
import { isPaymentMethodConfigured } from "@/lib/payments/methods";
import { paymentMethodLabel } from "@/lib/payments/reference";
import { getPublicDeliveryEstimate } from "@/lib/public-settings";
import { scopeForCountry } from "@/lib/couriers/selection";
import { verifyPayload } from "@/lib/security/signed-payload";
import { pageMetadata } from "@/lib/site";
import { CHECKOUT_DRAFT_COOKIE } from "@/lib/checkout/draft-cookie";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Review your order",
  description: "Review your JS Jewellers order before placing it.",
  path: "/checkout/review",
  noIndex: true,
});

export default async function CheckoutReviewPage() {
  // Verifying the signed checkout draft depends on the current time, and the
  // page is per-visitor (draft cookie), so render it entirely at request
  // time. Without this, the prerender pass would evaluate the draft's
  // expiry check and reject the unstable Date.now() read.
  await connection();

  const cookieStore = await cookies();
  const token = cookieStore.get(CHECKOUT_DRAFT_COOKIE)?.value;
  const draft = token
    ? verifyPayload<{ checkout: CheckoutValue }>(token)
    : null;

  if (!draft?.checkout) {
    redirect("/checkout");
  }

  const checkout = draft.checkout;
  const [cart, deliveryEstimate, indicativeShipping] = await Promise.all([
    getCartView(),
    getPublicDeliveryEstimate(),
    getIndicativeCourierShippingForCountry(checkout.countryCode),
  ]);

  const courierEstimate = indicativeShipping.available ? indicativeShipping : null;
  const deliveryCountryName = countryDisplayName(checkout.countryCode);

  if (cart.lines.length === 0) {
    redirect("/cart?error=empty");
  }

  if (cart.errors.length > 0) {
    redirect("/cart?cartError=unavailable");
  }

  if (!isPaymentMethodConfigured(checkout.paymentMethod)) {
    redirect("/checkout");
  }

  return (
    <section aria-labelledby="review-heading">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout", href: "/checkout" },
            { label: "Review" },
          ]}
        />

        <div className="mt-8 max-w-2xl">
          <p className="eyebrow">Almost there</p>
          <h1
            id="review-heading"
            className="heading-page heading-gold mt-3 text-4xl md:text-5xl"
          >
            Review your order
          </h1>
          <p className="body-copy mt-4 text-base">
            Check the details below. The order is created with payment pending;
            no money is taken automatically.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="space-y-6">
            <section className={`${panelClass}`} aria-labelledby="review-items">
              <h2
                id="review-items"
                className="heading-editorial heading-champagne text-2xl"
              >
                Items
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {cart.lines.map((line) => (
                  <li
                    key={line.productId}
                  >
                    <div className="flex justify-between gap-4">
                      <span className="text-champagne">
                        {line.name}
                        <span className="text-champagne/60">
                          {" "}
                          × {line.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold text-white">
                        {formatPkr({
                          amountMinor: line.lineTotalMinor,
                          currency: "PKR",
                        })}
                      </span>
                    </div>
                    <CustomizationSummary customization={line.customization} />
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between gap-4 border-t border-gold/20 pt-4">
                <span className="font-semibold text-white">Subtotal</span>
                <span className="font-nav text-lg font-semibold text-accent">
                  {formatPkr({
                    amountMinor: cart.subtotalMinor,
                    currency: "PKR",
                  })}
                </span>
              </div>
            </section>

            <section className={panelClass} aria-labelledby="review-delivery">
              <h2
                id="review-delivery"
                className="heading-editorial heading-champagne text-2xl"
              >
                Delivery details
              </h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-champagne/60">Name</dt>
                  <dd className="mt-0.5 text-white">{checkout.fullName}</dd>
                </div>
                <div>
                  <dt className="text-champagne/60">Mobile</dt>
                  <dd className="mt-0.5 text-white">{checkout.phone}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-champagne/60">Email</dt>
                  <dd className="mt-0.5 text-white">{checkout.email}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-champagne/60">Address</dt>
                  <dd className="mt-0.5 text-white">
                    {checkout.addressLine1}
                    {checkout.addressLine2
                      ? `, ${checkout.addressLine2}`
                      : ""}
                    , {checkout.city}, {deliveryCountryName}
                    {checkout.postalCode ? ` ${checkout.postalCode}` : ""}
                  </dd>
                </div>
                {checkout.customerNotes ? (
                  <div className="sm:col-span-2">
                    <dt className="text-champagne/60">Notes</dt>
                    <dd className="mt-0.5 whitespace-pre-line text-white">
                      {checkout.customerNotes}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {courierEstimate?.estimateDisplay ? (
                <p className="mt-4 text-sm text-champagne/70">
                  Delivery is estimated at {courierEstimate.estimateDisplay} via{" "}
                  {courierEstimate.courierDisplayName} after confirmation. This
                  is an estimate, not a guaranteed delivery date.
                </p>
              ) : scopeForCountry(checkout.countryCode) === "DOMESTIC_PK" ? (
                <p className="mt-4 text-sm text-champagne/70">
                  Delivery is estimated at {deliveryEstimate.display} for
                  Pakistan after confirmation. This is an estimate, not a
                  guaranteed delivery date.
                </p>
              ) : (
                <Notice tone="warning">
                  Delivery to {deliveryCountryName} is not currently available.
                  Return to checkout to choose an available country, or contact
                  us before ordering.
                </Notice>
              )}
            </section>

            <section className={panelClass} aria-labelledby="review-payment">
              <h2
                id="review-payment"
                className="heading-editorial heading-champagne text-2xl"
              >
                Payment method
              </h2>
              <p className="mt-3 text-base text-white">
                {paymentMethodLabel(checkout.paymentMethod)}
              </p>
              <p className="mt-2 text-sm text-champagne/70">
                The account instructions and your unique payment reference are
                shown on the order page after you place the order. Every payment
                is verified manually by our team.
              </p>

              <PlaceOrderForm />

              <Link
                href="/checkout"
                className={`${buttonSecondary} mt-3`}
              >
                Back to details
              </Link>
            </section>
          </div>

          <aside className={`${panelClass} lg:sticky lg:top-28`}>
            <h2 className="heading-editorial heading-champagne text-2xl">
              Total
            </h2>
            {courierEstimate ? (
              <>
                <p className="font-nav mt-3 text-2xl font-semibold text-accent">
                  {formatPkr({
                    amountMinor: cart.subtotalMinor + courierEstimate.shippingMinor,
                    currency: "PKR",
                  })}
                </p>
                <p className="mt-3 text-sm text-champagne/70">
                  Items{" "}
                  {formatPkr({
                    amountMinor: cart.subtotalMinor,
                    currency: "PKR",
                  })}{" "}
                  plus shipping{" "}
                  {formatPkr({
                    amountMinor: courierEstimate.shippingMinor,
                    currency: "PKR",
                  })}{" "}
                  via {courierEstimate.courierDisplayName} to{" "}
                  {deliveryCountryName}. The shipping charge is confirmed again
                  when the order is placed. No amount is charged automatically.
                </p>
              </>
            ) : (
              <>
                <p className="font-nav mt-3 text-2xl font-semibold text-accent">
                  {formatPkr({
                    amountMinor: cart.subtotalMinor,
                    currency: "PKR",
                  })}
                </p>
                <p className="mt-3 text-sm text-champagne/70">
                  Shipping and any applicable charges are confirmed by our team
                  after the order is reviewed. No amount is charged
                  automatically.
                </p>
              </>
            )}
            <Notice tone="info">
              Payment status starts as pending. It only becomes verified after
              an administrator confirms the transfer or Easypaisa payment.
            </Notice>
          </aside>
        </div>
      </div>
    </section>
  );
}
