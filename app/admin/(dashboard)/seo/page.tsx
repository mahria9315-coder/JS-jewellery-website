import type { Metadata } from "next";
import Link from "next/link";

import { AdminQueryNotice, firstParam } from "@/components/admin/AdminQueryNotice";
import { AdminPageHeader, AdminTable, AdminTd, AdminTh, StatusPill } from "@/components/admin/AdminUI";
import { ConfirmSubmitButton, SubmitButton } from "@/components/admin/SubmitButton";
import {
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  deleteSeoMetadataAction,
  saveSeoMetadataAction,
} from "@/lib/actions/admin-content";
import { listSeoMetadata } from "@/lib/admin/seo";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "SEO metadata",
  description: "Private search metadata management.",
  path: "/admin/seo",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SeoPage({ searchParams }: PageProps) {
  await requireAdminPage("seo.manage");
  const params = await searchParams;
  const selectedPath = firstParam(params, "path") ?? "";

  let rows: Awaited<ReturnType<typeof listSeoMetadata>> = [];
  let unavailable = false;

  try {
    rows = await listSeoMetadata();
  } catch {
    unavailable = true;
  }

  const selected = rows.find((row) => row.path === selectedPath);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Website"
        title="Search metadata"
        description="Overrides apply per public path. Empty fields fall back to the approved metadata already in code. No keyword stuffing, hidden text, or invented claims."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Website" },
          { label: "SEO" },
        ]}
      />

      <AdminQueryNotice params={params} />

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            SEO metadata could not be loaded because the database is unavailable.
          </p>
        </div>
      ) : (
        <AdminTable caption="SEO metadata overrides" minWidth="52rem">
          <thead>
            <tr>
              <AdminTh>Path</AdminTh>
              <AdminTh>Title</AdminTh>
              <AdminTh>Indexable</AdminTh>
              <AdminTh>In sitemap</AdminTh>
              <AdminTh>Edit</AdminTh>
              <AdminTh>Remove</AdminTh>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <AdminTd>No overrides yet.</AdminTd>
                <AdminTd>-</AdminTd>
                <AdminTd>-</AdminTd>
                <AdminTd>-</AdminTd>
                <AdminTd>-</AdminTd>
                <AdminTd>-</AdminTd>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <AdminTd>
                    <span className="font-mono text-xs">{row.path}</span>
                  </AdminTd>
                  <AdminTd>{row.title ?? "Default"}</AdminTd>
                  <AdminTd>
                    <StatusPill
                      status={row.noIndex ? "No-index" : "Indexable"}
                      tone={row.noIndex ? "warning" : "success"}
                    />
                  </AdminTd>
                  <AdminTd>{row.sitemapInclude ? "Yes" : "No"}</AdminTd>
                  <AdminTd>
                    <Link
                      href={`/admin/seo?path=${encodeURIComponent(row.path)}`}
                      className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                    >
                      Load
                    </Link>
                  </AdminTd>
                  <AdminTd>
                    <form action={deleteSeoMetadataAction}>
                      <input type="hidden" name="path" value={row.path} />
                      <ConfirmSubmitButton
                        confirmMessage={`Remove the SEO override for ${row.path}?`}
                        variant="secondary"
                      >
                        Remove
                      </ConfirmSubmitButton>
                    </form>
                  </AdminTd>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      )}

      <section className={panelClass} aria-labelledby="seo-form">
        <h3 id="seo-form" className="heading-editorial heading-champagne text-xl">
          {selected ? `Edit ${selected.path}` : "Add or replace an override"}
        </h3>
        <form action={saveSeoMetadataAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="path" className={labelClass}>
              Public path
            </label>
            <input
              id="path"
              name="path"
              required
              defaultValue={selected?.path ?? ""}
              placeholder="/collections/rings"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="canonicalPath" className={labelClass}>
              Canonical path (optional)
            </label>
            <input
              id="canonicalPath"
              name="canonicalPath"
              defaultValue={selected?.canonicalPath ?? ""}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              name="title"
              maxLength={120}
              defaultValue={selected?.title ?? ""}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={300}
              defaultValue={selected?.description ?? ""}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ogImageSrc" className={labelClass}>
              Social image path (optional)
            </label>
            <input
              id="ogImageSrc"
              name="ogImageSrc"
              defaultValue={selected?.ogImageSrc ?? ""}
              className={inputClass}
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-champagne">
            <input
              type="checkbox"
              name="noIndex"
              defaultChecked={selected?.noIndex ?? false}
              className={checkboxClass}
            />
            Ask search engines not to index this page
          </label>
          <label className="flex items-start gap-2 text-sm text-champagne">
            <input
              type="checkbox"
              name="sitemapInclude"
              defaultChecked={selected?.sitemapInclude ?? true}
              className={checkboxClass}
            />
            Include in the sitemap when public
          </label>
          <div className="sm:col-span-2">
            <SubmitButton>Save metadata</SubmitButton>
          </div>
        </form>
      </section>
    </div>
  );
}
