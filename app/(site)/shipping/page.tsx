import type { Metadata } from "next";
import Link from "next/link";

import { CmsPolicyPage } from "@/components/policies/CmsPolicyPage";
import {
  PendingApprovalNotice,
  PolicyLayout,
  PolicySection,
} from "@/components/policies/PolicyLayout";
import { getPublishedContentPage } from "@/lib/admin/content";
import { getPublicDeliveryEstimate } from "@/lib/public-settings";
import { pageMetadata } from "@/lib/site";

const linkClass =
  "inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 transition-colors hover:text-champagne focus-visible:outline-focus";

export const instant = false;

const staticDescription =
  "Shipping and delivery information for JS Jewellers, including the client-approved delivery estimate for intended destinations, the current Pakistan-only destination scope, and the limits of that estimate. Delivery serviceability remains configurable and legal review is pending.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedContentPage("shipping").catch(() => null);

  if (page) {
    return pageMetadata({
      title: page.title,
      description: page.intro.slice(0, 160),
      path: "/shipping",
      noIndex: !page.isIndexable,
    });
  }

  return pageMetadata({
    title: "Shipping & Delivery",
    description: staticDescription,
    path: "/shipping",
    noIndex: true,
  });
}

function StaticShippingPage({ estimate }: { estimate: string }) {
  return (
    <PolicyLayout
      headingId="shipping-heading"
      eyebrow="Customer care"
      title="Shipping & Delivery"
      intro="This page explains the client-approved delivery estimate and the current limits of our delivery arrangements. It is published for review; operational details that have not been confirmed are not presented as working."
      lastUpdated="7 November 2026"
    >
      <PendingApprovalNotice id="shipping-approval-status">
        The client-approved delivery estimate of {estimate} is published, but the courier
        arrangements, tracking capability, delivery charges, customs handling,
        checkout-stage delivery information, and delivery serviceability outside
        the intended market remain{" "}
        <strong className="font-semibold text-accent">
          PENDING OWNER APPROVAL OR LEGAL REVIEW
        </strong>
        . This page does not promise a guaranteed delivery date.
      </PendingApprovalNotice>

      <PolicySection
        id="shipping-scope"
        title="1. Scope and Intended Destinations"
      >
        <p>
          JS Jewellers is the trading name of JS Jewellery, a business based in
          Karachi, Sindh, Pakistan. Pakistan is the intended market.
        </p>
        <p>
          Delivery serviceability is configurable. No destination outside
          Pakistan has been enabled, and no other country has been approved for
          delivery. An estimate on this page does not by itself confirm that we
          deliver to a particular country.
        </p>
        <p>
          If you are outside Pakistan, contact us before ordering so we can
          confirm whether delivery is available and which return terms would
          apply. Return terms for unconfigured destinations require
          confirmation.
        </p>
      </PolicySection>

      <PolicySection
        id="shipping-estimate"
        title="2. Estimated Delivery Time"
      >
        <p>
          The client-approved delivery estimate is{" "}
          <strong className="font-semibold text-accent">{estimate}</strong>{" "}
          for all intended customer destinations.
        </p>
        <p>
          This is an estimate, not a guaranteed delivery date. Actual timing may
          vary with order review, supplier availability, destination, and
          circumstances outside our control.
        </p>
      </PolicySection>

      <PolicySection
        id="shipping-estimate-limits"
        title="3. What the Estimate Does and Does Not Mean"
      >
        <p>
          The estimate describes the intended delivery window. It does not
          confirm that an order has been placed, accepted, forwarded to a
          supplier, shipped, or delivered. Placing an order records the estimate
          against that order, but every fulfilment step still requires recorded
          evidence before it is described as complete.
        </p>
        <p>
          We do not publish:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>A courier or delivery-partner name that has not been confirmed</li>
          <li>A tracking feature or tracking promise that is not implemented</li>
          <li>A delivery charge that has not been approved for publication</li>
          <li>A customs arrangement that has not been confirmed</li>
          <li>A guaranteed delivery date</li>
        </ul>
      </PolicySection>

      <PolicySection
        id="shipping-processing"
        title="4. Order Processing and Confirmation"
      >
        <p>
          This website has an online cart, checkout, and order record. Checkout
          accepts customers in Pakistan only. The {estimate} delivery estimate
          and the applicable delivery terms are shown before an order is
          completed, and the estimate is recorded against the order as an
          estimate only.
        </p>
        <p>
          An order will not be described as confirmed, forwarded, shipped, or
          delivered without recorded evidence. Online payment is not live: Bank
          Transfer and Easypaisa remain unavailable until their server-only
          account details are configured, and any submitted payment is verified
          manually by an administrator.
        </p>
      </PolicySection>

      <PolicySection
        id="shipping-charges"
        title="5. Delivery Charges"
      >
        <p>
          At present no separate delivery charge is added to an order because no
          customer-facing charge has been approved for publication. The order
          review step shows the amounts that apply to the order before you
          complete it.
        </p>
        <p>
          Do not rely on an unconfirmed statement about free delivery or a
          specific charge. If an approved delivery charge is introduced, it will
          be shown clearly before you complete an order.
        </p>
      </PolicySection>

      <PolicySection
        id="shipping-tracking"
        title="6. Courier and Tracking"
      >
        <p>
          No courier name, tracking capability, or tracking number is published
          because those arrangements have not been confirmed.
        </p>
        <p>
          If tracking becomes available, we will tell you how to use it without
          exposing supplier identities, internal costs, or other private
          information.
        </p>
      </PolicySection>

      <PolicySection
        id="shipping-international"
        title="7. International Delivery and Customs"
      >
        <p>
          No international delivery service is enabled. No customs arrangement,
          import duty, tax, or international delivery charge is published
          because none has been confirmed.
        </p>
        <p>
          We do not claim worldwide delivery or worldwide legal compliance. Any
          future destination must be reviewed and enabled deliberately, and its
          return terms must be disclosed before purchase.
        </p>
      </PolicySection>

      <PolicySection
        id="shipping-problems"
        title="8. Delivery Problems"
      >
        <p>
          If a delivery is late, damaged, incomplete, or not received, contact
          us using the details on our{" "}
          <Link href="/returns" className={linkClass}>
            Returns, Exchanges &amp; Refund Policy
          </Link>
          . We will investigate using the evidence available and will not claim
          a delivery outcome that has not been verified.
        </p>
      </PolicySection>

      <PolicySection id="shipping-updates" title="9. Policy Updates">
        <p>
          We may update this page when delivery arrangements, serviceable
          destinations, or applicable legal requirements change.
        </p>
        <p>
          Material changes will be published with a revised &quot;last
          updated&quot; date. This page remains a draft until the owner approves
          the final wording and legal review is complete.
        </p>
      </PolicySection>

      <PolicySection id="shipping-contact" title="10. Contact">
        <p>
          For delivery questions, contact us by email or WhatsApp using the
          details in the footer. Please include your order reference when one
          exists.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

export default async function ShippingPage() {
  const [page, estimate] = await Promise.all([
    getPublishedContentPage("shipping").catch(() => null),
    getPublicDeliveryEstimate(),
  ]);

  if (page) {
    return <CmsPolicyPage page={page} />;
  }

  return <StaticShippingPage estimate={estimate.display} />;
}
