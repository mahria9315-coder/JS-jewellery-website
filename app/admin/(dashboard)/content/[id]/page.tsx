import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
  StatusPill,
  formatDate,
} from "@/components/admin/AdminUI";
import { ConfirmSubmitButton, SubmitButton } from "@/components/admin/SubmitButton";
import {
  checkboxClass,
  inputClass,
  labelClass,
  linkClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  deleteContentPageAction,
  deleteContentSectionAction,
  saveContentSectionAction,
  updateContentPageAction,
} from "@/lib/actions/admin-content";
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  getContentPageForAdmin,
} from "@/lib/admin/content";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Edit page",
  description: "Private website content management.",
  path: "/admin/content",
  noIndex: true,
});

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContentPageDetail({
  params,
  searchParams,
}: PageProps) {
  const context = await requireAdminPage("content.view");
  const { id } = await params;
  const query = await searchParams;
  const canManage = context.user.role.permissions.includes("content.manage");
  const page = await getContentPageForAdmin(id).catch(() => null);

  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Website pages"
        title={page.title}
        description="Sections are stored as plain text. The storefront renders them as text, so scripts and raw HTML cannot execute."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Pages", href: "/admin/content" },
          { label: page.title },
        ]}
        actions={
          page.status === "PUBLISHED" ? (
            <Link
              href={`/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              View live page
            </Link>
          ) : null
        }
      />

      <AdminQueryNotice params={query} />

      <section className={panelClass} aria-labelledby="page-details">
        <h3 id="page-details" className="heading-editorial heading-champagne text-xl">
          Page details
        </h3>
        <form action={updateContentPageAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={page.id} />
          <div>
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              minLength={2}
              maxLength={200}
              defaultValue={page.title}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="slug" className={labelClass}>
              URL slug
            </label>
            <input
              id="slug"
              name="slug"
              required
              defaultValue={page.slug}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="intro" className={labelClass}>
              Introduction
            </label>
            <textarea
              id="intro"
              name="intro"
              rows={3}
              maxLength={1000}
              defaultValue={page.intro}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={page.status}
              className={inputClass}
            >
              {CONTENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {CONTENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-champagne/60">
              Publishing requires an introduction and at least one visible
              section. Unpublishing removes the page from the storefront.
            </p>
          </div>
          <label className="flex items-start gap-2 text-sm text-champagne">
            <input
              type="checkbox"
              name="isIndexable"
              defaultChecked={page.isIndexable}
              className={checkboxClass}
            />
            Allow search engines to index this page
          </label>
          {canManage ? (
            <div className="sm:col-span-2">
              <SubmitButton>Save page</SubmitButton>
            </div>
          ) : null}
        </form>
      </section>

      <section aria-labelledby="page-sections">
        <h3 id="page-sections" className="heading-editorial heading-champagne text-xl">
          Sections
        </h3>
        {page.sections.length === 0 ? (
          <p className="mt-3 text-sm text-champagne/70">
            No sections yet. Add at least one before publishing.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {page.sections.map((section) => (
              <div key={section.id} className="space-y-3">
              <form action={saveContentSectionAction} className={panelClass}>
                <input type="hidden" name="pageId" value={page.id} />
                <input type="hidden" name="sectionId" value={section.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`key-${section.id}`} className={labelClass}>
                      Section key
                    </label>
                    <input
                      id={`key-${section.id}`}
                      name="sectionKey"
                      required
                      defaultValue={section.sectionKey}
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
                    <label htmlFor={`body-${section.id}`} className={labelClass}>
                      Body text
                    </label>
                    <textarea
                      id={`body-${section.id}`}
                      name="body"
                      rows={5}
                      maxLength={8000}
                      defaultValue={section.body}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`img-${section.id}`} className={labelClass}>
                      Image path (optional)
                    </label>
                    <input
                      id={`img-${section.id}`}
                      name="imageSrc"
                      defaultValue={section.imageSrc ?? ""}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`alt-${section.id}`} className={labelClass}>
                      Image alternative text
                    </label>
                    <input
                      id={`alt-${section.id}`}
                      name="imageAlt"
                      defaultValue={section.imageAlt ?? ""}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`cta-${section.id}`} className={labelClass}>
                      Button label (optional)
                    </label>
                    <input
                      id={`cta-${section.id}`}
                      name="ctaLabel"
                      defaultValue={section.ctaLabel ?? ""}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`href-${section.id}`} className={labelClass}>
                      Button destination
                    </label>
                    <input
                      id={`href-${section.id}`}
                      name="ctaHref"
                      defaultValue={section.ctaHref ?? ""}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`sort-${section.id}`} className={labelClass}>
                      Sort order
                    </label>
                    <input
                      id={`sort-${section.id}`}
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
                    Visible on the storefront
                  </label>
                  {canManage ? (
                    <div className="flex flex-wrap gap-3 sm:col-span-2">
                      <SubmitButton>Save section</SubmitButton>
                    </div>
                  ) : null}
                </div>
                {canManage ? (
                  <div className="mt-3 border-t border-gold/15 pt-3">
                    <p className="text-xs text-champagne/60">
                      Use “Remove section” below to delete this section.
                    </p>
                  </div>
                ) : null}
              </form>
              {canManage ? (
                <form action={deleteContentSectionAction}>
                  <input type="hidden" name="pageId" value={page.id} />
                  <input type="hidden" name="sectionId" value={section.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Remove section “${section.heading}”?`}
                    variant="secondary"
                  >
                    Remove section
                  </ConfirmSubmitButton>
                </form>
              ) : null}
              </div>
            ))}
          </div>
        )}

        {canManage ? (
          <form action={saveContentSectionAction} className={`${panelClass} mt-6`}>
            <input type="hidden" name="pageId" value={page.id} />
            <h4 className="heading-editorial heading-champagne text-lg">
              Add section
            </h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="new-key" className={labelClass}>
                  Section key
                </label>
                <input id="new-key" name="sectionKey" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="new-heading" className={labelClass}>
                  Heading
                </label>
                <input id="new-heading" name="heading" required className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="new-body" className={labelClass}>
                  Body text
                </label>
                <textarea id="new-body" name="body" rows={5} className={inputClass} />
              </div>
              <div>
                <label htmlFor="new-sort" className={labelClass}>
                  Sort order
                </label>
                <input
                  id="new-sort"
                  name="sortOrder"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={page.sections.length * 10 + 10}
                  className={inputClass}
                />
              </div>
              <label className="flex items-start gap-2 text-sm text-champagne">
                <input
                  type="checkbox"
                  name="isVisible"
                  defaultChecked
                  className={checkboxClass}
                />
                Visible on the storefront
              </label>
            </div>
            <div className="mt-4">
              <SubmitButton>Add section</SubmitButton>
            </div>
          </form>
        ) : null}
      </section>

      <section aria-labelledby="page-versions">
        <h3 id="page-versions" className="heading-editorial heading-champagne text-xl">
          Saved versions
        </h3>
        {page.versions.length === 0 ? (
          <p className="mt-3 text-sm text-champagne/70">No saved versions.</p>
        ) : (
          <div className="mt-4">
            <AdminTable caption="Saved page versions" minWidth="40rem">
              <thead>
                <tr>
                  <AdminTh>When</AdminTh>
                  <AdminTh>Status</AdminTh>
                  <AdminTh>Note</AdminTh>
                  <AdminTh>By</AdminTh>
                </tr>
              </thead>
              <tbody>
                {page.versions.map((version) => (
                  <tr key={version.id}>
                    <AdminTd>{formatDate(version.createdAt)}</AdminTd>
                    <AdminTd>
                      <StatusPill
                        status={
                          CONTENT_STATUS_LABELS[
                            version.status as keyof typeof CONTENT_STATUS_LABELS
                          ] ?? version.status
                        }
                      />
                    </AdminTd>
                    <AdminTd>{version.note}</AdminTd>
                    <AdminTd>{version.createdBy}</AdminTd>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </div>
        )}
      </section>

      {canManage ? (
        <section className={panelClass} aria-labelledby="delete-page">
          <h3 id="delete-page" className="heading-editorial heading-champagne text-xl">
            Delete page
          </h3>
          <p className="mt-2 text-sm text-champagne/70">
            Published pages must be unpublished first. Deleting removes the
            draft and its sections permanently.
          </p>
          <form action={deleteContentPageAction} className="mt-4">
            <input type="hidden" name="id" value={page.id} />
            <ConfirmSubmitButton confirmMessage={`Delete the page “${page.title}”? This cannot be undone.`}>
              Delete page
            </ConfirmSubmitButton>
          </form>
        </section>
      ) : null}
    </div>
  );
}
