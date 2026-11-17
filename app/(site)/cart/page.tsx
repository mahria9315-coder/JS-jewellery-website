import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { ProductImageFrame } from "@/components/catalogue/ProductImageFrame";
import { CustomizationSummary } from "@/components/customization/CustomizationSummary";
import {
  Notice,
  buttonPrimary,
  buttonSecondary,
  inputClass,
  linkClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { formatPkr, type ProductImage } from "@/lib/catalogue";
import { getCartView } from "@/lib/cart/server";
import {
  MAX_QUANTITY_PER_ITEM,
} from "@/lib/cart/calculations";
import { getPublicDeliveryEstimate } from "@/lib/public-settings";
import { pageMetadata } from "@/lib/site";
import {
  removeFromCartAction,
  updateCartQuantityAction,
} from "@/lib/actions/cart";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Cart",
  description: "Review the items in your JS Jewellers cart.",
  path: "/cart",
  noIndex: true,
});

type CartPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const params = await searchParams;
  const [cart, deliveryEstimate] = await Promise.all([
    getCartView(),
    getPublicDeliveryEstimate(),
  ]);
  const notice =
    params.cart === "added"
      ? "Item added to your cart."
      : params.cart === "updated"
        ? "Cart updated."
        : params.cart === "removed"
          ? "Item removed from your cart."
          : null;
  const error =
    params.cartError === "unavailable"
      ? "That product is not currently available for ordering."
      : params.cartError === "invalid-customization"
        ? "The customization details were not accepted. Choose an approved font and colour, and keep the text to 20 characters or fewer."
        : params.error === "empty"
          ? "Your cart is empty."
          : params.error === "invalid"
            ? "That cart update was not valid. Please try again."
            : null;

  return (
    <section aria-labelledby="cart-heading">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Cart" }]}
        />

        <div className="mt-8 max-w-2xl">
          <p className="eyebrow">Your selection</p>
          <h1
            id="cart-heading"
            className="heading-page heading-gold mt-3 text-4xl md:text-5xl"
          >
            Shopping Cart
          </h1>
          <p className="body-copy mt-4 text-base">
            Prices and availability are checked on our server before you pay.
            Nothing is ordered until you complete checkout.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {notice ? <Notice tone="success">{notice}</Notice> : null}
          {error ? <Notice tone="error">{error}</Notice> : null}
          {cart.errors.map((message) => (
            <Notice key={message} tone="warning">
              {message}
            </Notice>
          ))}
        </div>

        {cart.lines.length === 0 ? (
          <div className={`${panelClass} mt-8 text-center`}>
            <h2 className="heading-editorial heading-champagne text-2xl">
              Your cart is empty
            </h2>
            <p className="body-copy mt-3 text-base">
              Browse the collections and add an available product to begin.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/collections" className={buttonPrimary}>
                Browse collections
              </Link>
              <Link href="/search" className={buttonSecondary}>
                Search jewellery
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
            <ul className="space-y-4">
              {cart.lines.map((line) => {
                const image: ProductImage | undefined = line.image ?? undefined;

                return (
                  <li key={line.productId} className={panelClass}>
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="w-full max-w-32 shrink-0">
                        <ProductImageFrame
                          image={image}
                          sizes="128px"
                          flush
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="heading-product text-xl">
                          {line.slug ? (
                            <Link
                              href={`/products/${line.slug}`}
                              className="hover:text-accent focus-visible:outline-focus"
                            >
                              {line.name}
                            </Link>
                          ) : (
                            line.name
                          )}
                        </h2>
                        <p className="mt-1 text-sm text-champagne/70">
                          {formatPkr({
                            amountMinor: line.unitPriceMinor,
                            currency: "PKR",
                          })}{" "}
                          each
                        </p>

                        <CustomizationSummary
                          customization={line.customization}
                        />

                        <div className="mt-4 flex flex-wrap items-end gap-4">
                          <form action={updateCartQuantityAction}>
                            <input
                              type="hidden"
                              name="productId"
                              value={line.productId}
                            />
                            <label
                              htmlFor={`quantity-${line.productId}`}
                              className="block text-xs font-semibold uppercase tracking-[0.16em] text-champagne/70"
                            >
                              Quantity
                            </label>
                            <div className="mt-1 flex items-center gap-2">
                              <input
                                id={`quantity-${line.productId}`}
                                name="quantity"
                                type="number"
                                min={1}
                                max={MAX_QUANTITY_PER_ITEM}
                                defaultValue={line.quantity}
                                className={`${inputClass} mt-0 w-20`}
                              />
                              <button
                                type="submit"
                                className={buttonSecondary}
                              >
                                Update
                              </button>
                            </div>
                          </form>

                          <form action={removeFromCartAction}>
                            <input
                              type="hidden"
                              name="productId"
                              value={line.productId}
                            />
                            <button
                              type="submit"
                              className="inline-flex min-h-11 items-center text-sm font-semibold text-red-200 underline decoration-red-300/50 underline-offset-4 transition-colors hover:text-red-100 focus-visible:outline-focus"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>

                      <p className="font-nav text-lg font-semibold text-accent sm:text-right">
                        {formatPkr({
                          amountMinor: line.lineTotalMinor,
                          currency: "PKR",
                        })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <aside className={`${panelClass} lg:sticky lg:top-28`}>
              <h2 className="heading-editorial heading-champagne text-2xl">
                Order summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-champagne/70">
                    Items ({cart.itemCount})
                  </dt>
                  <dd className="font-semibold text-white">
                    {formatPkr({
                      amountMinor: cart.subtotalMinor,
                      currency: "PKR",
                    })}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-champagne/70">Delivery</dt>
                  <dd className="text-right text-champagne">
                    Confirmed after payment verification
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-gold/20 pt-3">
                  <dt className="font-semibold text-white">Subtotal</dt>
                  <dd className="font-nav text-lg font-semibold text-accent">
                    {formatPkr({
                      amountMinor: cart.subtotalMinor,
                      currency: "PKR",
                    })}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-sm text-champagne/70">
                Delivery is estimated at {deliveryEstimate.display} for
                Pakistan after the order is confirmed. This is an estimate, not
                a guaranteed date.
              </p>

              <Link href="/checkout" className={`${buttonPrimary} mt-6 w-full`}>
                Proceed to checkout
              </Link>
              <Link
                href="/search"
                className={`${linkClass} mt-3 w-full justify-center`}
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
