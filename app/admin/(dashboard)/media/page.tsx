import type { Metadata } from "next";
import Image from "next/image";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import { AdminPageHeader, AdminTable, AdminTd, AdminTh, formatDate } from "@/components/admin/AdminUI";
import { ConfirmSubmitButton, SubmitButton } from "@/components/admin/SubmitButton";
import {
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  createMediaAssetAction,
  deleteMediaAssetAction,
  updateMediaAssetAction,
} from "@/lib/actions/admin-content";
import { listMediaAssets } from "@/lib/admin/media";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Media library",
  description: "Private media library.",
  path: "/admin/media",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MediaPage({ searchParams }: PageProps) {
  const context = await requireAdminPage("media.manage");
  const params = await searchParams;
  const canManage = context.user.role.permissions.includes("media.manage");
  void canManage;

  let assets: Awaited<ReturnType<typeof listMediaAssets>> = [];
  let unavailable = false;

  try {
    assets = await listMediaAssets();
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Website"
        title="Media library"
        description="Describe images that already exist in the public folder so they have reviewed alternative text. Binary uploads need an approved storage service and are not enabled."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Website" },
          { label: "Media" },
        ]}
      />

      <AdminQueryNotice params={params} />

      <div className="rounded-card border border-amber-400/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
        Uploading new files requires approved media storage. This screen
        registers and describes existing local files only; removing a record does
        not delete the source file.
      </div>

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Media records could not be loaded because the database is
            unavailable.
          </p>
        </div>
      ) : assets.length === 0 ? (
        <div className={panelClass}>
          <p className="text-sm text-champagne/70">
            No images registered yet. Add an existing image path below.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <div key={asset.id} className={panelClass}>
              <div className="relative aspect-square overflow-hidden rounded-brand border border-gold/20 bg-black">
                <Image
                  src={asset.url}
                  alt={asset.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <form action={updateMediaAssetAction} className="mt-4 space-y-3">
                <input type="hidden" name="id" value={asset.id} />
                <div>
                  <label htmlFor={`alt-${asset.id}`} className={labelClass}>
                    Alternative text
                  </label>
                  <input
                    id={`alt-${asset.id}`}
                    name="alt"
                    defaultValue={asset.alt}
                    required
                    minLength={3}
                    maxLength={250}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={`name-${asset.id}`} className={labelClass}>
                    File name
                  </label>
                  <input
                    id={`name-${asset.id}`}
                    name="fileName"
                    defaultValue={asset.fileName}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <SubmitButton variant="secondary">Save</SubmitButton>
                </div>
              </form>
              <p className="mt-3 break-all font-mono text-xs text-champagne/60">
                {asset.url}
              </p>
              <p className="mt-1 text-xs text-champagne/50">
                {asset.mimeType} · {formatDate(asset.createdAt)}
              </p>
              <form action={deleteMediaAssetAction} className="mt-3">
                <input type="hidden" name="id" value={asset.id} />
                <ConfirmSubmitButton
                  confirmMessage="Remove this image record from the library? The source file will not be deleted."
                  variant="secondary"
                >
                  Remove record
                </ConfirmSubmitButton>
              </form>
            </div>
          ))}
        </div>
      )}

      <section className={panelClass} aria-labelledby="new-media">
        <h3 id="new-media" className="heading-editorial heading-champagne text-xl">
          Register an existing image
        </h3>
        <form action={createMediaAssetAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="url" className={labelClass}>
              Local image path
            </label>
            <input
              id="url"
              name="url"
              required
              placeholder="/images/products/rings/example.webp"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="fileName" className={labelClass}>
              File name
            </label>
            <input id="fileName" name="fileName" className={inputClass} />
          </div>
          <div>
            <label htmlFor="sizeBytes" className={labelClass}>
              File size in bytes (optional)
            </label>
            <input
              id="sizeBytes"
              name="sizeBytes"
              type="number"
              min={0}
              step={1}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="alt" className={labelClass}>
              Alternative text
            </label>
            <input
              id="alt"
              name="alt"
              required
              minLength={3}
              maxLength={250}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Register image</SubmitButton>
          </div>
        </form>
      </section>

      <AdminTable caption="Registered media summary" minWidth="36rem">
        <thead>
          <tr>
            <AdminTh>File</AdminTh>
            <AdminTh>Alt text</AdminTh>
            <AdminTh>Added</AdminTh>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={`summary-${asset.id}`}>
              <AdminTd>
                <span className="font-mono text-xs">{asset.url}</span>
              </AdminTd>
              <AdminTd>{asset.alt}</AdminTd>
              <AdminTd>{formatDate(asset.createdAt)}</AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
