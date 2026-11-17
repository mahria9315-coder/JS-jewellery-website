import type { Metadata } from "next";
import Link from "next/link";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
  StatusPill,
  formatDate,
} from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { createContentPageAction } from "@/lib/actions/admin-content";
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  listContentPages,
} from "@/lib/admin/content";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Website pages",
  description: "Private website content management.",
  path: "/admin/content",
  noIndex: true,
});

const tones: Record<string, "neutral" | "info" | "warning" | "success"> = {
  DRAFT: "neutral",
  IN_REVIEW: "info",
  APPROVED: "warning",
  PUBLISHED: "success",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContentPagesPage({ searchParams }: PageProps) {
  const context = await requireAdminPage("content.view");
  const params = await searchParams;
  const canManage = context.user.role.permissions.includes("content.manage");

  let pages: Awaited<ReturnType<typeof listContentPages>> = [];
  let unavailable = false;

  try {
    pages = await listContentPages();
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Website"
        title="Pages"
        description="Page content is plain text and safe by construction. Only PUBLISHED pages are read by the storefront; everything else stays private to administrators."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Website" },
          { label: "Pages" },
        ]}
        actions={
          <Link
            href="/admin/content/homepage"
            className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
          >
            Homepage sections
          </Link>
        }
      />

      <AdminQueryNotice params={params} />

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Content could not be loaded because the database is unavailable.
          </p>
        </div>
      ) : pages.length === 0 ? (
        <div className={panelClass}>
          <p className="text-sm text-champagne/70">
            No content pages yet. Create one below.
          </p>
        </div>
      ) : (
        <AdminTable caption="Website content pages" minWidth="56rem">
          <thead>
            <tr>
              <AdminTh>Page</AdminTh>
              <AdminTh>Path</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh align="right">Sections</AdminTh>
              <AdminTh>Indexable</AdminTh>
              <AdminTh>Updated</AdminTh>
              <AdminTh>Open</AdminTh>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <AdminTd>
                  <span className="font-semibold text-white">{page.title}</span>
                </AdminTd>
                <AdminTd>
                  <span className="font-mono text-xs">/{page.slug}</span>
                </AdminTd>
                <AdminTd>
                  <StatusPill
                    status={CONTENT_STATUS_LABELS[page.status as keyof typeof CONTENT_STATUS_LABELS] ?? page.status}
                    tone={tones[page.status] ?? "neutral"}
                  />
                </AdminTd>
                <AdminTd align="right">{page._count.sections}</AdminTd>
                <AdminTd>{page.isIndexable ? "Yes" : "No"}</AdminTd>
                <AdminTd>{formatDate(page.updatedAt)}</AdminTd>
                <AdminTd>
                  <Link
                    href={`/admin/content/${page.id}`}
                    className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                  >
                    Edit
                  </Link>
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      {canManage ? (
        <section className={panelClass} aria-labelledby="new-page">
          <h3 id="new-page" className="heading-editorial heading-champagne text-xl">
            New page
          </h3>
          <p className="mt-2 text-sm text-champagne/70">
            The approved privacy, returns, and shipping pages already exist as
            drafts. Edit those instead of creating duplicates.
          </p>
          <form action={createContentPageAction} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className={labelClass}>
                Title
              </label>
              <input id="title" name="title" required minLength={2} className={inputClass} />
            </div>
            <div>
              <label htmlFor="slug" className={labelClass}>
                URL slug
              </label>
              <input
                id="slug"
                name="slug"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="intro" className={labelClass}>
                Introduction
              </label>
              <textarea id="intro" name="intro" rows={3} maxLength={1000} className={inputClass} />
            </div>
            <div>
              <label htmlFor="status" className={labelClass}>
                Status
              </label>
              <select id="status" name="status" defaultValue="DRAFT" className={inputClass}>
                {CONTENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {CONTENT_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-start gap-2 text-sm text-champagne sm:col-span-2">
              <input type="checkbox" name="isIndexable" className={checkboxClass} />
              Allow search engines to index this page once published
            </label>
            <div className="sm:col-span-2">
              <SubmitButton>Create page</SubmitButton>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
