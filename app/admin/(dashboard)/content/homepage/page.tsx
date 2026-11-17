import type { Metadata } from "next";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  updateHomeHeroAction,
  updateHomeSectionAction,
} from "@/lib/actions/admin-content";
import { listHomeSections } from "@/lib/admin/content";
import { getBusinessSettings } from "@/lib/admin/settings";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Homepage sections",
  description: "Private homepage content management.",
  path: "/admin/content/homepage",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomepageContentPage({ searchParams }: PageProps) {
  const context = await requireAdminPage("content.view");
  const params = await searchParams;
  const canManage = context.user.role.permissions.includes("content.manage");

  let sections: Awaited<ReturnType<typeof listHomeSections>> = [];
  let settings: Awaited<ReturnType<typeof getBusinessSettings>> | null = null;
  let unavailable = false;

  try {
    [sections, settings] = await Promise.all([
      listHomeSections(),
      getBusinessSettings(),
    ]);
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Website"
        title="Homepage sections"
        description="These headings and placeholders appear on the public homepage. Products are only shown when real published records exist; a section never invents inventory."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Pages", href: "/admin/content" },
          { label: "Homepage" },
        ]}
      />

      <AdminQueryNotice params={params} />

      {settings ? (
        <section className={panelClass} aria-labelledby="homepage-hero">
          <h3
            id="homepage-hero"
            className="heading-editorial heading-champagne text-xl"
          >
            Hero
          </h3>
          <p className="mt-2 text-sm text-champagne/70">
            The hero is the first section customers see. Leave a field blank to
            keep the approved default. Image paths must be local files under
            <span className="font-mono"> public/</span>.
          </p>
          <form action={updateHomeHeroAction} className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ["homepage.heroEyebrow", "Eyebrow", "text"],
              ["homepage.heroHeading", "Heading", "text"],
              ["homepage.heroImageSrc", "Image path", "text"],
              ["homepage.heroImageAlt", "Image alternative text", "text"],
              ["homepage.heroPrimaryLabel", "Primary button label", "text"],
              ["homepage.heroPrimaryHref", "Primary button destination", "text"],
              ["homepage.heroSecondaryLabel", "Secondary button label", "text"],
              ["homepage.heroSecondaryHref", "Secondary button destination", "text"],
            ].map(([key, label]) => (
              <div key={key}>
                <label htmlFor={key} className={labelClass}>
                  {label}
                </label>
                <input
                  id={key}
                  name={key}
                  defaultValue={settings[key as keyof typeof settings] ?? ""}
                  maxLength={key.endsWith("Href") ? 500 : 250}
                  className={inputClass}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label htmlFor="homepage.heroDescription" className={labelClass}>
                Description
              </label>
              <textarea
                id="homepage.heroDescription"
                name="homepage.heroDescription"
                rows={3}
                maxLength={1000}
                defaultValue={settings["homepage.heroDescription"]}
                className={inputClass}
              />
            </div>
            {canManage ? (
              <div className="sm:col-span-2">
                <SubmitButton>Save hero</SubmitButton>
              </div>
            ) : null}
          </form>
        </section>
      ) : null}

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Homepage content could not be loaded because the database is
            unavailable.
          </p>
        </div>
      ) : sections.length === 0 ? (
        <div className={panelClass}>
          <p className="text-sm text-champagne/70">
            No homepage sections recorded. The storefront falls back to the
            approved static copy.
          </p>
        </div>
      ) : (
        sections.map((section) => (
          <section key={section.id} className={panelClass} aria-labelledby={`section-${section.id}`}>
            <h3
              id={`section-${section.id}`}
              className="heading-editorial heading-champagne text-xl"
            >
              {section.heading}{" "}
              <span className="font-mono text-xs text-champagne/50">
                {section.key}
              </span>
            </h3>
            <form action={updateHomeSectionAction} className="mt-4 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={section.id} />
              <div>
                <label htmlFor={`eyebrow-${section.id}`} className={labelClass}>
                  Eyebrow
                </label>
                <input
                  id={`eyebrow-${section.id}`}
                  name="eyebrow"
                  defaultValue={section.eyebrow}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`heading-${section.id}`} className={labelClass}>
                  Heading
                </label>
                <input
                  id={`heading-${section.id}`}
                  name="heading"
                  required
                  defaultValue={section.heading}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`description-${section.id}`} className={labelClass}>
                  Description
                </label>
                <textarea
                  id={`description-${section.id}`}
                  name="description"
                  rows={2}
                  defaultValue={section.description}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`placeholderTitle-${section.id}`} className={labelClass}>
                  Placeholder title
                </label>
                <input
                  id={`placeholderTitle-${section.id}`}
                  name="placeholderTitle"
                  defaultValue={section.placeholderTitle}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`placeholderNote-${section.id}`} className={labelClass}>
                  Placeholder note
                </label>
                <input
                  id={`placeholderNote-${section.id}`}
                  name="placeholderNote"
                  defaultValue={section.placeholderNote}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`imageSrc-${section.id}`} className={labelClass}>
                  Image path (optional)
                </label>
                <input
                  id={`imageSrc-${section.id}`}
                  name="imageSrc"
                  defaultValue={section.imageSrc ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`imageAlt-${section.id}`} className={labelClass}>
                  Image alternative text
                </label>
                <input
                  id={`imageAlt-${section.id}`}
                  name="imageAlt"
                  defaultValue={section.imageAlt ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`ctaLabel-${section.id}`} className={labelClass}>
                  Button label (optional)
                </label>
                <input
                  id={`ctaLabel-${section.id}`}
                  name="ctaLabel"
                  defaultValue={section.ctaLabel ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`ctaHref-${section.id}`} className={labelClass}>
                  Button destination
                </label>
                <input
                  id={`ctaHref-${section.id}`}
                  name="ctaHref"
                  defaultValue={section.ctaHref ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`sortOrder-${section.id}`} className={labelClass}>
                  Sort order
                </label>
                <input
                  id={`sortOrder-${section.id}`}
                  name="sortOrder"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={section.sortOrder}
                  className={inputClass}
                />
              </div>
              <label className="flex items-start gap-2 text-sm text-champagne">
                <input
                  type="checkbox"
                  name="isVisible"
                  defaultChecked={section.isVisible}
                  className={checkboxClass}
                />
                Visible on the homepage
              </label>
              {canManage ? (
                <div className="sm:col-span-2">
                  <SubmitButton>Save section</SubmitButton>
                </div>
              ) : null}
            </form>
          </section>
        ))
      )}
    </div>
  );
}
