import type { Metadata } from "next";
import { randomBytes } from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CustomizationSummary } from "@/components/customization/CustomizationSummary";
import {
  Notice,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { getCartView } from "@/lib/cart/server";
import { getCheckoutDeliveryCountries } from "@/lib/couriers/public";
import { formatPkr } from "@/lib/catalogue";
import { getCheckoutPaymentMethods } from "@/lib/payments/methods";
import { getPublicDeliveryEstimate } from "@/lib/public-settings";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Checkout",
  description: "Enter your delivery details for a JS Jewellers order.",
  path: "/checkout",
  noIndex: true,
});

export default async function CheckoutPage() {
  const [cart, deliveryEstimate, countries] = await Promise.all([
    getCartView(),
    getPublicDeliveryEstimate(),
    getCheckoutDeliveryCountries(),
  ]);

  if (cart.lines.length === 0) {
    redirect("/cart?error=empty");
  }

  if (cart.errors.length > 0) {
    redirect("/cart?cartError=unavailable");
  }

  const methods = getCheckoutPaymentMethods()
    .filter((method) => method.configured)
    .map((method) => ({ id: method.id, label: method.label }));
  const idempotencyKey = randomBytes(16).toString("hex");

  return (
    <section aria-labelledby="checkout-heading">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />

        <div className="mt-8 max-w-2xl">
          <p className="eyebrow">Secure checkout</p>
          <h1
            id="checkout-heading"
            className="heading-page heading-gold mt-3 text-4xl md:text-5xl"
          >
            Checkout
          </h1>
          <p className="body-copy mt-4 text-base">
            Enter the delivery details for this order. Your cart total is
            checked again on our server before the order is created.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className={panelClass}>
            {methods.length === 0 ? (
              <Notice tone="warning">
                Online checkout is temporarily unavailable because the payment
                details have not been configured yet. Please contact us to
                complete an order. No payment can be made through the site until
                this is resolved.
              </Notice>
            ) : (
              <CheckoutForm
                methods={methods}
                countries={countries}
                idempotencyKey={idempotencyKey}
              />
            )}

            {methods.length === 0 ? (
              <p className="mt-4 text-sm text-champagne/70">
                Return to the{" "}
                <Link
                  href="/cart"
                  className="font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                >
                  cart
                </Link>{" "}
                to review your items.
              </p>
            ) : null}
          </div>

          <aside className={`${panelClass} lg:sticky lg:top-28`}>
            <h2 className="heading-editorial heading-champagne text-2xl">
              Order summary
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {cart.lines.map((line) => (
                <li key={line.productId}>
                  <div className="flex justify-between gap-4">
                    <span className="text-champagne">
                      {line.name}
                      <span className="text-champagne/60"> × {line.quantity}</span>
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
            {countries.length > 1 ? (
              <p className="mt-4 text-sm text-champagne/70">
                Delivery times and any shipping charge depend on the selected
                country and are confirmed when the order is placed. Estimates
                are not guaranteed dates.
              </p>
            ) : (
              <p className="mt-4 text-sm text-champagne/70">
                Delivery is estimated at {deliveryEstimate.display} for Pakistan
                after the order is confirmed. It is not a guaranteed date.
              </p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
