import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";

type PolicyLayoutProps = {
  headingId: string;
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  children: ReactNode;
};

/**
 * Shared shell for the draft policy pages. Uses the existing theme tokens and
 * typography so both pages follow the Black Gold Galaxy and light themes.
 */
export function PolicyLayout({
  headingId,
  eyebrow,
  title,
  intro,
  lastUpdated,
  children,
}: PolicyLayoutProps) {
  return (
    <section aria-labelledby={headingId}>
      <div className="container-page py-section md:py-section-lg">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: title }]}
        />

        <div className="reveal-on-scroll mt-8 max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1
            id={headingId}
            className="heading-page heading-gold mt-3 text-4xl md:text-5xl"
          >
            {title}
          </h1>
          <p className="body-copy mt-4 text-base">{intro}</p>
          <p className="mt-3 text-sm text-champagne/70">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="mt-8 max-w-3xl space-y-6">{children}</div>
      </div>
    </section>
  );
}

type PendingApprovalNoticeProps = {
  id: string;
  children: ReactNode;
};

/**
 * Prominent, accessible notice for content that still requires owner approval.
 * The wording is deliberately explicit so the page is never mistaken for a
 * final legal or business policy.
 */
export function PendingApprovalNotice({
  id,
  children,
}: PendingApprovalNoticeProps) {
  return (
    <aside
      aria-labelledby={id}
      className="surface-panel rounded-card border border-gold/30 p-5 sm:p-6"
    >
      <p className="eyebrow">Approval status</p>
      <h2
        id={id}
        className="heading-editorial heading-ivory mt-2 text-2xl md:text-3xl"
      >
        PENDING OWNER APPROVAL
      </h2>
      <p className="body-copy mt-3 text-sm">{children}</p>
    </aside>
  );
}

type PolicySectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

/**
 * Consistent section wrapper for policy copy, with an accessible heading and
 * readable body text in both themes.
 */
export function PolicySection({ id, title, children }: PolicySectionProps) {
  return (
    <section
      aria-labelledby={id}
      className="border-t border-gold/20 pt-6 first:border-t-0 first:pt-0"
    >
      <h2
        id={id}
        className="heading-editorial heading-champagne text-2xl md:text-3xl"
      >
        {title}
      </h2>
      <div className="body-copy mt-3 space-y-3 text-base">{children}</div>
    </section>
  );
}
