import Link from "next/link";

import { PolicyLayout, PolicySection } from "./PolicyLayout";

type PublishedPage = {
  slug: string;
  title: string;
  intro: string;
  updatedAt: Date;
  publishedAt: Date | null;
  sections: Array<{
    sectionKey: string;
    heading: string;
    body: string;
    ctaLabel: string | null;
    ctaHref: string | null;
  }>;
};

function BodyText({ body }: { body: string }) {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </>
  );
}

export function CmsPolicyPage({ page }: { page: PublishedPage }) {
  const lastUpdated = (page.publishedAt ?? page.updatedAt).toLocaleDateString(
    "en-PK",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <PolicyLayout
      headingId={`${page.slug}-heading`}
      eyebrow="Customer care"
      title={page.title}
      intro={page.intro}
      lastUpdated={lastUpdated}
    >
      {page.sections.map((section) => (
        <PolicySection
          key={section.sectionKey}
          id={`${page.slug}-${section.sectionKey}`}
          title={section.heading}
        >
          <BodyText body={section.body} />
          {section.ctaLabel && section.ctaHref ? (
            <p>
              <Link
                href={section.ctaHref}
                className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 transition-colors hover:text-champagne focus-visible:outline-focus"
              >
                {section.ctaLabel}
              </Link>
            </p>
          ) : null}
        </PolicySection>
      ))}
    </PolicyLayout>
  );
}
