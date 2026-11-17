import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { OrderLookupForm } from "@/components/orders/OrderForms";
import { panelClass } from "@/components/ui/FormPrimitives";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Order lookup",
  description:
    "Find a private JS Jewellers order using the order number and checkout email.",
  path: "/orders/lookup",
  noIndex: true,
});

export default function OrderLookupPage() {
  return (
    <section aria-labelledby="lookup-heading">
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Order lookup" }]}
        />

        <div className="mt-8 max-w-2xl">
          <p className="eyebrow">Order support</p>
          <h1
            id="lookup-heading"
            className="heading-page heading-gold mt-3 text-4xl md:text-5xl"
          >
            Find your order
          </h1>
          <p className="body-copy mt-4 text-base">
            Enter the order number from your confirmation and the email address
            used at checkout. For your privacy, both must match.
          </p>
        </div>

        <div className={`${panelClass} mt-8 max-w-2xl`}>
          <OrderLookupForm />
        </div>
      </div>
    </section>
  );
}
