import type { Metadata } from "next";
import Link from "next/link";

import { CmsPolicyPage } from "@/components/policies/CmsPolicyPage";
import {
  PendingApprovalNotice,
  PolicyLayout,
  PolicySection,
} from "@/components/policies/PolicyLayout";
import { PolicyContact } from "@/components/policies/PolicyContact";
import { getPublishedContentPage } from "@/lib/admin/content";
import { BUSINESS_LEGAL_NAME, pageMetadata } from "@/lib/site";

/**
 * Draft website terms and conditions.
 *
 * This page records the commercial and legal positions the owner has approved
 * so far (manual payment verification, Pakistan delivery scope, the published
 * returns policy) without claiming legal review. Every open legal question is
 * explicitly marked PENDING OWNER APPROVAL and the page stays noindex until the
 * owner approves the final wording and legal review is complete.
 */
export const instant = false;

const staticDescription =
  "Draft terms and conditions for using the JS Jewellers website and placing an order, covering orders and acceptance, prices, manual payment verification, delivery, returns and refunds, intellectual property, liability, and governing law. Final owner approval and legal review are pending.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedContentPage("terms").catch(() => null);

  if (page) {
    return pageMetadata({
      title: page.title,
      description: page.intro.slice(0, 160),
      path: "/terms",
      noIndex: !page.isIndexable,
    });
  }

  return pageMetadata({
    title: "Terms & Conditions",
    description: staticDescription,
    path: "/terms",
    noIndex: true,
  });
}

function StaticTermsPage() {
  return (
    <PolicyLayout
      headingId="terms-heading"
      eyebrow="Customer care"
      title="Terms & Conditions"
      intro="These terms explain the basis on which JS Jewellers offers this website and accepts orders. They are a draft published for review; final owner approval and legal review are pending, so nothing on this page should be read as legal advice or as a completed legal agreement."
      lastUpdated="12 November 2026"
    >
      <PendingApprovalNotice id="terms-approval-status">
        Final wording, governing-law clauses, liability limits, dispute
        resolution, order-acceptance mechanics, and consumer-law disclosures
        remain{" "}
        <strong className="font-semibold text-accent">
          PENDING OWNER APPROVAL
        </strong>
        . This notice will be removed only after the owner approves the final
        text and legal review is complete.
      </PendingApprovalNotice>

      <PolicySection id="terms-website" title="1. About These Terms">
        <p>
          This website is operated by {BUSINESS_LEGAL_NAME}, a business based in
          Karachi, Sindh, Pakistan. In these terms, &quot;we&quot;,
          &quot;us&quot;, and &quot;our&quot; refer to {BUSINESS_LEGAL_NAME},
          and &quot;you&quot; refers to the person using the website or placing
          an order.
        </p>
        <p>
          By using the website, you agree to these terms to the extent they
          apply. If you do not agree, please do not use the website or place an
          order. These terms sit alongside our published{" "}
          <Link className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus" href="/privacy">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus" href="/returns">
            Returns, Exchanges &amp; Refund Policy
          </Link>
          .
        </p>
        <p>
          We may update these terms when our website, products, or legal
          obligations change. The version published on this page at the time you
          place an order is the version that applies to that order.
        </p>
      </PolicySection>

      <PolicySection id="terms-orders" title="2. Orders and Acceptance">
        <p>
          An order is an offer to buy the selected product on these terms. A
          confirmation message or a payment step does not by itself mean the
          order has been accepted. The order is accepted only when we confirm
          that the product is available and the order details have been
          reviewed.
        </p>
        <p>
          We may decline or cancel an order where the product is unavailable, the
          price or product information was clearly incorrect, stock cannot be
          verified, a payment cannot be verified, or we reasonably suspect fraud
          or misuse. If we cancel an order and you have already paid, we will
          arrange a refund through the original payment method.
        </p>
        <p>
          You are responsible for giving accurate contact and delivery details.
          Please review your order carefully before submitting it, including any
          customization details such as names, spelling, colours, and fonts.
        </p>
      </PolicySection>

      <PolicySection id="terms-products" title="3. Products and Availability">
        <p>
          We aim to describe products accurately, but handcrafted and
          supplier-fulfilled jewellery can vary slightly in appearance, size,
          weight, finish, and colour reproduction. Photographs are illustrative.
        </p>
        <p>
          Availability is shown only when it has been verified. If an item is
          unavailable after you order, we will contact you to arrange an
          alternative, a delay, or a refund. We do not claim that every product
          is continuously in stock.
        </p>
        <p>
          Any customization is produced to the details you supply. Please check
          spelling and design details before ordering, because personalized
          items may not be returnable except where required by law or where the
          item is faulty.
        </p>
      </PolicySection>

      <PolicySection id="terms-prices" title="4. Prices and Currency">
        <p>
          Prices are shown in Pakistani Rupees (PKR) and include only what the
          product page states. Delivery charges, taxes, or other amounts, where
          applicable, are shown separately before you complete an order. A price
          is not confirmed until your order is accepted.
        </p>
        <p>
          We may correct an obvious pricing or product-information error before
          accepting an order. If a corrected price is not acceptable to you, you
          may cancel the order and receive a refund of any amount already paid.
        </p>
      </PolicySection>

      <PolicySection id="terms-payments" title="5. Payments">
        <p>
          The approved payment methods are Bank Transfer (Islamic Bank) and
          Easypaisa. They are available at checkout only when their server-side
          account details have been configured. No card payment, automated
          gateway, or instant online payment is offered.
        </p>
        <p>
          Choosing a payment method or submitting an order does not mean payment
          has been received. Payments require manual verification by an
          authorised person. We will never ask you for your password, PIN, OTP,
          full card number, or bank login credentials through WhatsApp, email, or
          another ordinary message.
        </p>
      </PolicySection>

      <PolicySection id="terms-delivery" title="6. Delivery">
        <p>
          The current delivery scope is Pakistan only. Delivery estimates are
          estimates, not guaranteed dates, and may be affected by supplier
          availability, courier operations, weather, public holidays, or events
          outside our reasonable control.
        </p>
        <p>
          Risk in the product passes as described by applicable law and our{" "}
          <Link className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus" href="/shipping">
            Shipping &amp; Delivery
          </Link>{" "}
          page. Please report visible damage or a missing item promptly so we can
          investigate with the delivery provider.
        </p>
      </PolicySection>

      <PolicySection id="terms-returns" title="7. Returns, Exchanges, and Refunds">
        <p>
          Returns, exchanges, and refunds are governed by our{" "}
          <Link className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus" href="/returns">
            Returns, Exchanges &amp; Refund Policy
          </Link>
          . That policy sets out the approved Pakistan change-of-mind window and
          the treatment of faulty, damaged, or incorrect items.
        </p>
        <p>
          Nothing in these terms is intended to exclude or limit a right you have
          under applicable consumer law that cannot lawfully be excluded. The
          final legal wording of this section remains{" "}
          <strong className="font-semibold text-accent">
            PENDING OWNER APPROVAL
          </strong>
          .
        </p>
      </PolicySection>

      <PolicySection id="terms-use" title="8. Acceptable Use and Intellectual Property">
        <p>
          You may use this website for lawful shopping and information purposes.
          You must not attempt to gain unauthorised access to the website or its
          administration area, interfere with its operation, submit false orders,
          or use automated tools in a way that harms the service.
        </p>
        <p>
          The website design, text, logos, and original photography are owned by
          or licensed to {BUSINESS_LEGAL_NAME}. Supplier product images are used
          only where the necessary rights have been recorded. You may not copy or
          reuse our content for commercial purposes without permission.
        </p>
      </PolicySection>

      <PolicySection id="terms-liability" title="9. Liability">
        <p>
          We do not exclude liability that cannot lawfully be excluded, including
          liability for fraud or for death or personal injury caused by
          negligence. Otherwise, and to the extent permitted by law, we are not
          liable for indirect or consequential loss arising from use of the
          website.
        </p>
        <p>
          Product and consumer guarantees, and the final wording of this
          liability section, remain subject to owner approval and legal review.
        </p>
      </PolicySection>

      <PolicySection id="terms-law" title="10. Governing Law and Disputes">
        <p>
          These terms are intended to be governed by the laws of Pakistan, with
          disputes subject to the courts of Karachi, Sindh. The final
          governing-law, jurisdiction, and dispute-resolution wording remains{" "}
          <strong className="font-semibold text-accent">
            PENDING OWNER APPROVAL
          </strong>{" "}
          and legal review.
        </p>
        <p>
          If you have a concern, please contact us first using the details below
          so we can try to resolve it. You may also have rights under applicable
          Pakistani consumer law.
        </p>
      </PolicySection>

      <PolicySection id="terms-contact" title="11. Contact">
        <PolicyContact />
        <p>
          For questions about these terms or an order, contact us by email or
          WhatsApp using the details above. Please do not send passwords, PINs,
          OTPs, or full card details.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

export default async function TermsPage() {
  const page = await getPublishedContentPage("terms").catch(() => null);

  if (page) {
    return <CmsPolicyPage page={page} />;
  }

  return <StaticTermsPage />;
}
