import type { Metadata } from "next";
import Link from "next/link";

import { CmsPolicyPage } from "@/components/policies/CmsPolicyPage";
import { CountryReturnPolicy } from "@/components/policies/CountryReturnPolicy";
import {
  PendingApprovalNotice,
  PolicyLayout,
  PolicySection,
} from "@/components/policies/PolicyLayout";
import { PolicyContact } from "@/components/policies/PolicyContact";
import { getPublishedContentPage } from "@/lib/admin/content";
import { getPublicDeliveryEstimate } from "@/lib/public-settings";
import { PAKISTAN_RETURN_EXAMPLE } from "@/lib/returns-policy";
import { pageMetadata } from "@/lib/site";

const SINDH_CONSUMER_ACT_URL =
  "https://sja.gos.pk/assets/Updated_Laws/Sindh%20Consumer%20Protection%20Act%2C%202014.pdf";
const SALE_OF_GOODS_ACT_URL =
  "https://punjabcode.punjab.gov.pk/uploads/articles/sale_of_goods_act-_1930-pdf.pdf";

const externalLinkClass =
  "inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 transition-colors hover:text-champagne focus-visible:outline-focus";

/**
 * Returns, exchanges, and refund policy. The client has approved the Pakistan
 * commercial terms (3-day change-of-mind window, 25% deduction, 75% refund),
 * the country-aware international position, and the configured delivery estimate.
 * Formal legal review is still pending, so the page stays noindex and keeps the
 * pending-approval notice. Countries outside Pakistan deliberately show that
 * their return terms require confirmation.
 */
export const instant = false;

const staticDescription =
  "The returns, exchanges, and refund policy for JS Jewellers. It explains the approved Pakistan 3-day change-of-mind window, the 25% deduction and 75% refund for eligible returns, safeguards for faulty or protected returns, country-specific international terms, the configured delivery estimate, and how to make a request. Legal review is pending.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedContentPage("returns").catch(() => null);

  if (page) {
    return pageMetadata({
      title: page.title,
      description: page.intro.slice(0, 160),
      path: "/returns",
      noIndex: !page.isIndexable,
    });
  }

  return pageMetadata({
    title: "Returns, Exchanges & Refund Policy",
    description: staticDescription,
    path: "/returns",
    noIndex: true,
  });
}

function StaticReturnsPage({ estimate }: { estimate: string }) {
  return (
    <PolicyLayout
      headingId="returns-heading"
      eyebrow="Customer care"
      title="Returns, Exchanges & Refund Policy"
      intro="This policy explains how JS Jewellers handles returns, exchanges, and refunds. It separates the client-approved Pakistan change-of-mind terms from statutory remedies and from country-specific international rules. It is published for review; formal legal review and final owner approval of the legal wording are still pending."
      lastUpdated="7 November 2026"
    >
      <PendingApprovalNotice id="returns-approval-status">
        The client has approved the commercial terms on this page, including the
        Pakistan 3-day change-of-mind window and the 25% deduction / 75% refund,
        but those terms are not a substitute for legal approval. Formal legal
        review, the return address, the refund timeline, checkout-stage
        disclosure, and any destination outside Pakistan remain{" "}
        <strong className="font-semibold text-accent">
          PENDING OWNER APPROVAL OR LEGAL REVIEW
        </strong>
        . This notice will be removed only after the owner approves the final
        wording and legal review is complete.
      </PendingApprovalNotice>

      <PolicySection
        id="returns-scope"
        title="1. Scope and Applicable Law"
      >
        <p>
          JS Jewellers is the trading name of JS Jewellery, a business based in
          Karachi, Sindh, Pakistan. This policy applies to products purchased
          from us through this website or a published JS Jewellers contact
          channel.
        </p>
        <p>
          Pakistan is our intended market. Checkout accepts customers in
          Pakistan only, and no destination outside Pakistan has been enabled for
          delivery. Return terms for other destinations require confirmation and
          are described in section 10.
        </p>
        <p>
          This policy has been prepared with reference to the Sindh Consumer
          Protection Act 2014, as amended, and the Sale of Goods Act 1930. If
          the mandatory consumer law of another province or country applies to
          your purchase, nothing in this policy limits those rights.
        </p>
        <p>
          This is a draft policy published for review. It does not claim legal
          approval or compliance with any law that has not been reviewed.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-statutory-rights"
        title="2. Your Statutory Rights"
      >
        <p>
          Under the Sale of Goods Act 1930, goods sold must correspond with
          their description, be of merchantable quality, and be reasonably fit
          for the purpose made known to the seller in the circumstances described
          in the Act. The seller must also inform the buyer of a known defect in
          the goods (sections 16-A and 17).
        </p>
        <p>
          Under the Sindh Consumer Protection Act 2014, consumers are protected
          against defective products and false or misleading representations.
          Liability for defective products cannot be limited or excluded by a
          contract term or notice (section 12). The Consumer Court may order
          remedies including repair, replacement, refund of the price or charges
          paid, compensation, and costs (section 32).
        </p>
        <p>
          Nothing in this policy excludes or limits those statutory rights. The
          25% deduction described below applies only to eligible change-of-mind
          returns where the law permits it. It does not apply to defective,
          faulty, damaged, incorrect, or otherwise legally protected returns.
        </p>
        <p>
          Official texts:{" "}
          <a
            href={SINDH_CONSUMER_ACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={externalLinkClass}
          >
            Sindh Consumer Protection Act 2014 (as amended)
            <span className="sr-only"> (opens a PDF in a new tab)</span>
          </a>{" "}
          and{" "}
          <a
            href={SALE_OF_GOODS_ACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={externalLinkClass}
          >
            Sale of Goods Act 1930
            <span className="sr-only"> (opens a PDF in a new tab)</span>
          </a>
          .
        </p>
      </PolicySection>

      <PolicySection id="returns-delivery" title="3. Delivery Estimate">
        <p>
          The client-approved delivery estimate is{" "}
          <strong className="font-semibold text-accent">{estimate}</strong>{" "}
          for all intended customer destinations.
        </p>
        <p>
          This is an estimate, not a guaranteed delivery date. Actual timing may
          vary with order review, supplier availability, destination, and
          circumstances outside our control. We do not publish a courier name,
          tracking promise, delivery charge, or customs arrangement that has not
          been confirmed.
        </p>
        <p>
          Delivery serviceability is configurable. No destination outside
          Pakistan has been enabled, and an estimate does not by itself confirm
          that we deliver to a country. See our{" "}
          <Link
            href="/shipping"
            className={externalLinkClass}
          >
            Shipping &amp; Delivery information
          </Link>{" "}
          for the full position.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-change-of-mind"
        title="4. Pakistan: 3-Day Change-of-Mind Returns"
      >
        <p>
          For eligible change-of-mind returns in Pakistan, you must submit your
          return request within{" "}
          <strong className="font-semibold text-accent">
            3 calendar days from delivery
          </strong>
          . The 3-day period starts on the date the order is delivered.
        </p>
        <p>
          This is a client-approved commercial term. It applies only where the
          law permits it and only when the term has been disclosed before
          purchase. It does not shorten or limit any longer period or stronger
          right provided by applicable law.
        </p>
        <p>
          To be eligible, the item must also meet the condition requirements in
          section 7. The return must be authorised by us before you send it, and
          the item must be returned within the period set out in the return
          instructions we provide.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-deduction"
        title="5. The 25% Deduction and 75% Refund"
      >
        <p>
          For an eligible change-of-mind return in Pakistan, we deduct{" "}
          <strong className="font-semibold text-accent">25%</strong> from the
          amount you paid and refund the remaining{" "}
          <strong className="font-semibold text-accent">75%</strong>.
        </p>
        <p>
          This deduction is applied only where the applicable law permits it and
          only after the term has been disclosed before purchase. If the law
          does not permit the deduction for your order, it will not be applied.
        </p>
        <p>
          <strong className="font-semibold text-accent">
            Worked example:
          </strong>{" "}
          If a customer paid PKR {PAKISTAN_RETURN_EXAMPLE.paidAmount.toLocaleString("en-PK")}:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            25% deduction ={" "}
            <strong className="font-semibold text-champagne">
              PKR {PAKISTAN_RETURN_EXAMPLE.deduction.toLocaleString("en-PK")}
            </strong>
          </li>
          <li>
            Remaining refund ={" "}
            <strong className="font-semibold text-champagne">
              PKR {PAKISTAN_RETURN_EXAMPLE.refund.toLocaleString("en-PK")}
            </strong>
          </li>
        </ul>
        <p>
          The deduction is calculated from the amount the customer actually
          paid, not from a separate delivery charge or an unverified value. We
          will confirm the exact refund amount in writing before you return the
          item.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-deduction-safeguards"
        title="6. When the 25% Deduction Does Not Apply"
      >
        <p>
          The 25% deduction applies only to eligible change-of-mind returns. It
          must not be applied to:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Defective, faulty, or damaged products</li>
          <li>Incorrect products or products that do not match the order</li>
          <li>Returns where the law does not permit a deduction</li>
          <li>Any return covered by a statutory consumer remedy</li>
        </ul>
        <p>
          For those returns, the remedies in section 9 apply and any refund will
          not be reduced by the 25% change-of-mind deduction. Statutory
          remedies remain separate from the voluntary change-of-mind terms and
          are not replaced by them.
        </p>
        <p>
          If you are unsure which category applies, contact us before returning
          the item so we can confirm the correct process.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-condition"
        title="7. Condition Requirements for Change-of-Mind Returns"
      >
        <p>To qualify for a change-of-mind return, the item should be:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Unworn, unused, and undamaged</li>
          <li>
            Returned with its original packaging, tags, certificates, and
            accessories
          </li>
          <li>Returned with any free gift or promotional item included</li>
          <li>Accompanied by proof of purchase or an order reference</li>
          <li>Not altered, resized, engraved, or repaired after delivery</li>
        </ul>
        <p>
          We may inspect the item when we receive it. If these conditions are
          not met, we may decline the change-of-mind return or offer a partial
          refund where that is lawful. This does not affect your rights for
          faulty, damaged, or incorrect items.
        </p>
        <p>
          The specific condition requirements remain subject to final owner
          approval and legal review.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-exceptions"
        title="8. Items That May Not Qualify for Change-of-Mind Returns"
      >
        <p>
          Because a change-of-mind return is a voluntary option, some items may
          not qualify where the law permits that exclusion. These may include:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Personalised, customised, or made-to-order items, such as name
            jewellery, once production has begun
          </li>
          <li>
            Pierced earrings or other hygiene-sensitive items where the hygiene
            seal has been broken
          </li>
          <li>
            Items damaged after delivery through misuse, accident, or normal wear
          </li>
          <li>Items returned without required components or proof of purchase</li>
        </ul>
        <p>
          These exclusions apply only to voluntary change-of-mind returns. They
          do not apply to faulty, damaged, or incorrect items. We will disclose
          any exclusion before purchase where required, and apply it only where
          lawful.
        </p>
        <p>
          The final list of condition rules and exclusions remains subject to
          final owner approval and legal review.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-faulty"
        title="9. Faulty, Damaged, or Incorrect Items"
      >
        <p>
          If your item arrives faulty, damaged, defective, or different from what
          you ordered, contact us as soon as reasonably possible after delivery.
          Please do not attempt to repair or alter the item before contacting us.
        </p>
        <p>
          We will ask for your order reference, a description of the problem,
          and relevant photographs or video, including the packaging where
          useful. We will review the issue and arrange an appropriate remedy,
          such as repair, replacement, refund, or another remedy required by
          applicable law.
        </p>
        <p>
          The 25% change-of-mind deduction does not apply to these returns. Where
          the law requires JS Jewellery to cover the cost of returning a faulty,
          damaged, or incorrect item, we will cover that cost. You will not be
          required to negotiate directly with an undisclosed supplier.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-international"
        title="10. International Orders and Country-Specific Terms"
      >
        <p>
          The client has approved that international returns and refunds follow
          the applicable rules of the customer&apos;s country. A 25% deduction
          may apply to eligible international returns only where that
          country&apos;s law permits it and the term has been disclosed before
          purchase. Where the deduction is legally permitted, the remaining 75%
          would be refunded.
        </p>
        <p>
          We have not yet researched or configured the return terms for any
          country outside Pakistan. No destination outside Pakistan is enabled
          for delivery. For an unconfigured destination, the correct answer is
          that its return terms require confirmation, not that Pakistan&apos;s
          3-day rule or 25% deduction automatically applies.
        </p>
        <CountryReturnPolicy />
        <p>
          This page does not claim worldwide legal compliance or guaranteed
          worldwide returns. A destination will be added only after its rules
          have been reviewed, approved, and disclosed before purchase.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-how-to-request"
        title="11. How to Request a Return"
      >
        <p>
          If you placed an order on this website, open your order using{" "}
          <Link href="/orders/lookup" className="text-accent underline">
            order lookup
          </Link>{" "}
          and submit a return request from the order page. You can also contact
          us on WhatsApp or by email using the details in section 18. Please
          provide:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your order reference</li>
          <li>The product name and the reason for the request</li>
          <li>Photographs or other evidence where useful</li>
          <li>Your preferred remedy, if you have one</li>
        </ul>
        <p>
          We will review the request and tell you whether a return is needed and,
          if so, the return instructions and address. Please do not send an item
          to a supplier or to an address that we have not confirmed.
        </p>
        <p>
          Keep proof of postage or courier collection until the return is
          complete.
        </p>
        <p>
          The final customer-request process and return address remain subject to
          final owner approval.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-shipping-costs"
        title="12. Return Shipping Costs"
      >
        <p>
          <strong className="font-semibold text-accent">
            Change of mind:
          </strong>{" "}
          Where it is lawful and disclosed before you order, you will be
          responsible for the cost of returning the item. If we arrange a
          collection, we will tell you the cost before proceeding.
        </p>
        <p>
          <strong className="font-semibold text-accent">
            Faulty, damaged, or incorrect:
          </strong>{" "}
          JS Jewellery will cover the cost of returning the item where required
          by applicable law.
        </p>
        <p>
          Any shipping-cost arrangement remains subject to final owner approval
          and legal review.
        </p>
      </PolicySection>

      <PolicySection id="returns-refunds" title="13. Refunds">
        <p>
          After we receive and inspect the returned item, or otherwise approve
          the refund, we will process it using an appropriate method.
        </p>
        <p>
          For an eligible change-of-mind return in Pakistan, the approved refund
          is 75% of the amount paid after the 25% deduction, subject to the
          safeguards in section 6. The deduction is not applied to faulty,
          damaged, incorrect, or legally protected returns.
        </p>
        <p>
          Where applicable law requires a refund through the original payment
          method, we will follow that requirement. In other lawful cases, an
          approved Bank Transfer or Easypaisa refund may be used. We will not
          replace a monetary refund with store credit without your agreement
          where a monetary refund is legally due.
        </p>
        <p>
          We will tell you what amount will be refunded before you return the
          item. Any deduction will be applied only where lawful and disclosed.
        </p>
        <p>
          We aim to process approved refunds promptly. The specific refund
          timeline remains subject to final owner approval, and any deadline
          required by law will be met.
        </p>
        <p>
          If we need payment details to process a refund, we will explain how to
          provide them securely. Never send a password, OTP, full card number,
          or bank login credentials.
        </p>
      </PolicySection>

      <PolicySection id="returns-exchanges" title="14. Exchanges">
        <p>
          You may request an exchange within the applicable return period.
          Exchange availability depends on product availability.
        </p>
        <p>
          If an exchange cannot be provided, we will explain the available
          remedies. For faulty, damaged, or incorrect items, your statutory
          remedies are not limited by exchange availability.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-supplier-orders"
        title="15. Supplier-Fulfilled Orders"
      >
        <p>JS Jewellers uses suppliers to fulfil certain orders.</p>
        <p>
          JS Jewellery remains your point of contact for returns, exchanges, and
          product complaints. Internal supplier arrangements do not remove or
          reduce your customer rights. Our public pages do not disclose supplier
          identities, costs, or margins.
        </p>
      </PolicySection>

      <PolicySection
        id="returns-complaints"
        title="16. Complaints and Consumer Court"
      >
        <p>
          If you are not satisfied with how we handle a return, refund, or
          product complaint, contact us first so we can try to resolve it.
        </p>
        <p>
          Under the Sindh Consumer Protection Act 2014, a consumer may need to
          give written notice to the trader before making a claim. The trader
          must reply within 15 days of receiving that notice. A claim is
          generally filed within 30 days of the cause of action, although the
          Consumer Court may allow more time within the limits set by the Act.
          The Consumer Court may order remedies such as repair, replacement,
          refund, compensation, and costs.
        </p>
        <p>
          This is a summary for general information, not legal advice. The
          official text of the{" "}
          <a
            href={SINDH_CONSUMER_ACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={externalLinkClass}
          >
            Sindh Consumer Protection Act 2014 (as amended)
            <span className="sr-only"> (opens a PDF in a new tab)</span>
          </a>{" "}
          should be consulted for the exact requirements and time limits.
        </p>
        <p>
          If you are outside Sindh, the consumer protection law and authority
          for your province or area may also apply.
        </p>
      </PolicySection>

      <PolicySection id="returns-updates" title="17. Policy Updates">
        <p>
          We may update this policy when our business practices, return
          arrangements, or applicable legal requirements change.
        </p>
        <p>
          Material changes will be published on this page with a revised
          &quot;last updated&quot; date. This policy remains a draft until the
          owner approves the final wording and legal review is complete.
        </p>
      </PolicySection>

      <PolicySection id="returns-contact" title="18. Contact">
        <PolicyContact />
        <p>
          For a return, exchange, refund, or product complaint, contact us by
          email or WhatsApp using the details above. Please include your order
          reference so we can find your order quickly.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

export default async function ReturnsPage() {
  const [page, estimate] = await Promise.all([
    getPublishedContentPage("returns").catch(() => null),
    getPublicDeliveryEstimate(),
  ]);

  if (page) {
    return <CmsPolicyPage page={page} />;
  }

  return <StaticReturnsPage estimate={estimate.display} />;
}
