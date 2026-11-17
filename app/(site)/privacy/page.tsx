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
import { pageMetadata } from "@/lib/site";

/**
 * Jurisdiction-aware privacy draft for the Pakistan market. The owner has
 * supplied the core wording and confirmed the business name, Karachi location,
 * business email, and WhatsApp number. Final approval, legal review, retention
 * periods, security arrangements, and any third-party services remain
 * outstanding. Keep the page noindex until those are resolved.
 */
export const instant = false;

const staticDescription =
  "The draft privacy policy for JS Jewellers, explaining what customer information is collected, how it is used and shared for order fulfilment, retention, security, cookies, and customer requests. Final approval and legal review are pending.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedContentPage("privacy").catch(() => null);

  if (page) {
    return pageMetadata({
      title: page.title,
      description: page.intro.slice(0, 160),
      path: "/privacy",
      noIndex: !page.isIndexable,
    });
  }

  return pageMetadata({
    title: "Privacy Policy",
    description: staticDescription,
    path: "/privacy",
    noIndex: true,
  });
}

function StaticPrivacyPage() {
  return (
    <PolicyLayout
      headingId="privacy-heading"
      eyebrow="Customer care"
      title="Privacy Policy"
      intro="This policy explains how JS Jewellers handles personal information when you use this website, contact us, or place an order through our published contact channels. It has been prepared for our Pakistan market and is published for review; final owner approval and legal review are pending."
      lastUpdated="7 November 2026"
    >
      <PendingApprovalNotice id="privacy-approval-status">
        This policy has not been finally approved or legally reviewed. Specific
        retention periods, security arrangements, payment-verification details,
        any future cookies or third-party services, and some operational
        processes remain{" "}
        <strong className="font-semibold text-accent">
          PENDING OWNER APPROVAL
        </strong>
        . This notice will be removed only after the owner approves the final
        wording and legal review is complete.
      </PendingApprovalNotice>

      <PolicySection id="privacy-who-we-are" title="1. Who We Are and Scope">
        <p>
          JS Jewellers is the trading name of JS Jewellery, a business based in
          Karachi, Sindh, Pakistan.
        </p>
        <p>
          This policy applies when you use this website, contact us on WhatsApp,
          or place an order through a published JS Jewellers contact channel. It
          covers the personal information we collect and how we use and share
          it.
        </p>
        <p>
          We currently intend to serve customers in Pakistan only. Checkout
          accepts customers in Pakistan only, and no other country has been
          approved for delivery. If we begin offering products to customers in
          another province or country, we will review this policy for the laws
          that apply there before doing so.
        </p>
        <p>
          This is a draft policy published for review. It does not claim
          compliance with any specific data protection law or legal approval.
        </p>
      </PolicySection>

      <PolicySection
        id="privacy-information-collected"
        title="2. Information We Collect"
      >
        <p>We aim to collect only the information we reasonably need.</p>
        <p>
          <strong className="font-semibold text-accent">
            Information you give us:
          </strong>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your name and contact details, including your mobile number</li>
          <li>Your delivery address and any delivery instructions</li>
          <li>
            Order details, including the products ordered and any customization
            details
          </li>
          <li>
            Messages you send us, including return, exchange, or refund requests
            and any photographs or other evidence you provide
          </li>
        </ul>
        <p>
          <strong className="font-semibold text-accent">
            Order and payment information:
          </strong>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>The payment method selected</li>
          <li>Order amount and payment status</li>
          <li>
            A transaction or transfer reference needed to confirm a bank
            transfer
          </li>
        </ul>
        <p>
          <strong className="font-semibold text-accent">
            Technical information:
          </strong>{" "}
          Our hosting and security systems may process standard technical
          information such as your IP address, browser and device type, the
          pages you request, and the time of your request. We use this
          information to operate the website, investigate errors, and protect
          against misuse.
        </p>
        <p>
          <strong className="font-semibold text-accent">
            Theme preference:
          </strong>{" "}
          If you switch between the dark and light theme, the website stores
          your choice in your browser&apos;s local storage. This preference is
          not used to track you across other websites.
        </p>
        <p>
          We do not ask for your password, one-time password (OTP), full card
          number, or bank login credentials through WhatsApp, email, or any other
          ordinary message. Please do not send us those details.
        </p>
      </PolicySection>

      <PolicySection id="privacy-use" title="3. How We Use Information">
        <p>We may use personal information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Receive, process, and manage your order</li>
          <li>Arrange delivery and share the minimum delivery information needed</li>
          <li>Respond to questions and provide customer support</li>
          <li>Handle returns, exchanges, refunds, and product complaints</li>
          <li>Confirm payments and prevent fraud or misuse</li>
          <li>Maintain the security and operation of the website</li>
          <li>Meet legal, tax, accounting, and regulatory obligations</li>
        </ul>
        <p>We do not sell or rent your personal information.</p>
      </PolicySection>

      <PolicySection
        id="privacy-sharing"
        title="4. Sharing Information"
      >
        <p>
          <strong className="font-semibold text-accent">
            Suppliers and delivery providers:
          </strong>{" "}
          JS Jewellers uses a supplier-fulfilment model. We may share the
          customer name, delivery details, order details, and any customization
          details needed with the relevant supplier or delivery provider, but
          only to the extent reasonably necessary to fulfil the order or handle
          a return or complaint.
        </p>
        <p>
          <strong className="font-semibold text-accent">
            Payment providers and banks:
          </strong>{" "}
          We may share information with a bank or payment provider where needed
          to confirm or refund a payment, or where required by law.
        </p>
        <p>
          <strong className="font-semibold text-accent">
            Professional advisers and authorities:
          </strong>{" "}
          We may disclose information where required by law, a court order, or a
          lawful request from a public authority, or where reasonably necessary
          to establish, exercise, or defend a legal claim.
        </p>
        <p>
          Some suppliers or service providers may be located outside Pakistan.
          Where that happens, we will share only the information necessary for
          the relevant purpose and take reasonable steps consistent with
          applicable law.
        </p>
        <p>
          Our public pages do not disclose supplier identities, internal costs,
          agreements, or business margins. Any supplier receiving customer
          information for fulfilment is expected to use it only for that
          purpose.
        </p>
      </PolicySection>

      <PolicySection id="privacy-payments" title="5. Payments">
        <p>
          The payment methods approved for use are Bank Transfer (Islamic
          Bank) and Easypaisa. Both remain unavailable at checkout until their
          server-side account details are configured, so no payment instructions
          or account details are shown on public pages.
        </p>
        <p>
          Approved payment instructions are shown only at the payment step after
          you select a configured method. Payment account details are kept in
          server-side configuration and are never placed in public pages, public
          APIs, or client-side bundles.
        </p>
        <p>
          Selecting a payment method or submitting an order does not by itself
          mean that payment has been received or verified. Payment will remain
          unverified until an authorised person confirms it. No payment gateway,
          card processor, or automated payment integration is described as
          working.
        </p>
        <p>
          Never send a password, OTP, full card number, PIN, or bank login
          credentials through WhatsApp, email, or another ordinary message. We
          do not ask for those details.
        </p>
      </PolicySection>

      <PolicySection
        id="privacy-cookies"
        title="6. Cookies, Analytics, and Local Storage"
      >
        <p>
          This website currently does not set advertising or analytics cookies,
          and no analytics, advertising pixel, or similar tracking service is
          described as active.
        </p>
        <p>
          The website stores your dark or light theme preference in your
          browser&apos;s local storage. This is used only to remember your
          display choice.
        </p>
        <p>
          If we add analytics, advertising, or other third-party services, we
          will update this policy and, where required, ask for consent before
          using them. The specific future arrangements remain{" "}
          <strong className="font-semibold text-accent">
            PENDING OWNER APPROVAL
          </strong>
          .
        </p>
      </PolicySection>

      <PolicySection id="privacy-retention" title="7. Data Retention">
        <p>
          We keep personal information only for as long as we reasonably need it
          to fulfil orders, handle returns and complaints, maintain business
          records, prevent fraud, and meet legal, tax, and accounting
          requirements.
        </p>
        <p>
          When information is no longer needed, we will take reasonable steps to
          delete it or remove the details that identify you. Specific retention
          periods have not been finalised and remain{" "}
          <strong className="font-semibold text-accent">
            PENDING OWNER APPROVAL
          </strong>
          .
        </p>
      </PolicySection>

      <PolicySection id="privacy-security" title="8. How We Protect Information">
        <p>
          We intend to use reasonable technical and organisational measures to
          protect personal information, limit access to people who need it for
          their role, and reduce the risk of loss, misuse, or unauthorised
          access.
        </p>
        <p>
          No method of transmission or storage is completely secure, so we
          cannot promise absolute security. Specific security arrangements
          remain{" "}
          <strong className="font-semibold text-accent">
            PENDING OWNER APPROVAL
          </strong>
          .
        </p>
        <p>
          If you believe your information has been compromised, contact us by
          email or WhatsApp so we can investigate.
        </p>
      </PolicySection>

      <PolicySection
        id="privacy-requests"
        title="9. Your Privacy Requests and Choices"
      >
        <p>
          You may contact us to ask what personal information we hold about you,
          request a correction, ask us to delete information, or raise a concern
          about how your information is used.
        </p>
        <p>
          We may need to verify your identity before acting on a request. Some
          information may need to be retained for legal, tax, accounting, or
          dispute-resolution reasons, and we will explain any limitation that
          applies.
        </p>
        <p>
          We will respond within a reasonable period. The final request process
          and response times remain{" "}
          <strong className="font-semibold text-accent">
            PENDING OWNER APPROVAL
          </strong>
          .
        </p>
        <p>
          We do not currently send marketing messages. If we introduce marketing
          in future, we will provide a way to opt out.
        </p>
      </PolicySection>

      <PolicySection id="privacy-children" title="10. Children's Privacy">
        <p>
          This website is not directed at children. We do not knowingly collect
          personal information from children. If you believe a child has
          provided personal information to us, please contact us so we can review
          and delete it where appropriate.
        </p>
      </PolicySection>

      <PolicySection id="privacy-updates" title="11. Policy Updates">
        <p>
          We may update this policy when our website features, business
          practices, or applicable legal requirements change.
        </p>
        <p>
          Material changes will be published on this page with a revised
          &quot;last updated&quot; date. This policy remains a draft until the
          owner approves the final wording and legal review is complete.
        </p>
      </PolicySection>

      <PolicySection id="privacy-contact" title="12. Contact and Complaints">
        <PolicyContact />
        <p>
          For privacy questions or requests, contact us by email or WhatsApp
          using the details above. Please include enough information for us to
          identify your request without sending sensitive credentials.
        </p>
        <p>
          If you are not satisfied with our response, you may have rights under
          applicable Pakistani law, including the consumer complaint process
          described on our{" "}
          <Link
            href="/returns"
            className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 transition-colors hover:text-champagne focus-visible:outline-focus"
          >
            Returns, Exchanges &amp; Refund Policy
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

export default async function PrivacyPage() {
  const page = await getPublishedContentPage("privacy").catch(() => null);

  if (page) {
    return <CmsPolicyPage page={page} />;
  }

  return <StaticPrivacyPage />;
}
