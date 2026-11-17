import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ConfirmSubmitButton,
  SubmitButton,
} from "@/components/admin/SubmitButton";
import { AdminPageHeader, formatDate } from "@/components/admin/AdminUI";
import {
  Notice,
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  addSupplierNoteAction,
  archiveSupplierAction,
  restoreSupplierAction,
} from "@/lib/actions/admin-content";
import {
  saveSupplierAgreementAction,
  updateSupplierAction,
} from "@/lib/actions/admin";
import { listEntityAuditLogs } from "@/lib/admin/audit";
import { hasPermission } from "@/lib/admin/permissions";
import { requireAdminPage } from "@/lib/admin/session";
import { getSupplierById } from "@/lib/admin/suppliers";
import { formatPkr } from "@/lib/catalogue";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Supplier details",
  description: "Private supplier record.",
  path: "/admin/suppliers",
  noIndex: true,
});

type SupplierPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function dateValue(value: Date | null | undefined): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

const SUPPLIER_STATUSES = [
  "DRAFT",
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
  "INACTIVE",
  "ARCHIVED",
];
const VERIFICATION_STATUSES = ["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"];
const AGREEMENT_STATUSES = [
  "NOT_RECEIVED",
  "RECEIVED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
];

export default async function AdminSupplierPage({
  params,
  searchParams,
}: SupplierPageProps) {
  const context = await requireAdminPage("suppliers.view");
  const { id } = await params;
  const query = await searchParams;
  const permissions = context.user.role.permissions;
  const canManage = hasPermission(permissions, "suppliers.manage");
  const canVerify = hasPermission(permissions, "suppliers.verify");
  const canAudit = hasPermission(permissions, "audit.view");

  const [supplier, activity] = await Promise.all([
    getSupplierById(id).catch(() => null),
    canAudit ? listEntityAuditLogs("Supplier", id, 12).catch(() => []) : Promise.resolve([]),
  ]);

  if (!supplier) {
    notFound();
  }

  const agreement = supplier.agreements[0];

  return (
    <div className="space-y-8 print:space-y-4">
      <AdminPageHeader
        eyebrow="Private supplier record"
        title={supplier.legalName}
        description="Do not share supplier contact details, costs, agreements, or margins publicly. Customer-facing pages must show JS Jewellers branding only."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Suppliers", href: "/admin/suppliers" },
          { label: supplier.tradingName ?? supplier.legalName },
        ]}
        actions={
          <Link
            href="/admin/suppliers"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
          >
            Back to suppliers
          </Link>
        }
      />

      {first(query.error) ? <Notice tone="error">{first(query.error)}</Notice> : null}
      {query.saved === "1" ? <Notice tone="success">Supplier record updated.</Notice> : null}
      {query.agreement === "1" ? (
        <Notice tone="success">Agreement record updated.</Notice>
      ) : null}
      {first(query.notice) ? (
        <Notice tone="success">{first(query.notice)}</Notice>
      ) : null}

      {!canManage && !canVerify ? (
        <Notice tone="warning">
          Your role has view-only supplier access. Ask a Super Admin for
          suppliers.manage or suppliers.verify to edit this record.
        </Notice>
      ) : null}

      <section className={panelClass} aria-labelledby="supplier-edit">
        <h3 id="supplier-edit" className="heading-editorial heading-champagne text-xl">
          Supplier details
        </h3>
        <form action={updateSupplierAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={supplier.id} />
          <div className="sm:col-span-2">
            <label htmlFor="legalName" className={labelClass}>Legal or business name</label>
            <input
              id="legalName"
              name="legalName"
              required
              minLength={2}
              maxLength={200}
              defaultValue={supplier.legalName}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="tradingName" className={labelClass}>Trading name</label>
            <input
              id="tradingName"
              name="tradingName"
              maxLength={200}
              defaultValue={supplier.tradingName ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contactName" className={labelClass}>Contact name</label>
            <input
              id="contactName"
              name="contactName"
              maxLength={120}
              defaultValue={supplier.contactName ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className={labelClass}>Contact email</label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              maxLength={254}
              defaultValue={supplier.contactEmail ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className={labelClass}>Contact phone</label>
            <input
              id="contactPhone"
              name="contactPhone"
              maxLength={40}
              defaultValue={supplier.contactPhone ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>Supplier status</label>
            <select id="status" name="status" className={inputClass} defaultValue={supplier.status}>
              {SUPPLIER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ").toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="verificationStatus" className={labelClass}>
              Identity verification
            </label>
            <select
              id="verificationStatus"
              name="verificationStatus"
              className={inputClass}
              defaultValue={supplier.verificationStatus}
            >
              {VERIFICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.toLowerCase()}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-champagne/60">
              {supplier.verifiedAt
                ? `Verified ${new Date(supplier.verifiedAt).toLocaleDateString("en-PK")} by ${supplier.verifiedBy ?? "an administrator"}.`
                : "No verification timestamp recorded."}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="internalNotes" className={labelClass}>
              Internal notes <span className="font-normal text-champagne/60">(private)</span>
            </label>
            <textarea
              id="internalNotes"
              name="internalNotes"
              rows={3}
              maxLength={2000}
              defaultValue={supplier.internalNotes ?? ""}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            {canManage ? (
              <SubmitButton>Save supplier</SubmitButton>
            ) : (
              <p className="text-sm text-champagne/60">
                You can view this supplier, but editing requires suppliers.manage.
              </p>
            )}
          </div>
        </form>
      </section>

      {canManage ? (
        <section className={panelClass} aria-labelledby="supplier-lifecycle">
          <h3
            id="supplier-lifecycle"
            className="heading-editorial heading-champagne text-xl"
          >
            Supplier lifecycle
          </h3>
          <p className="mt-2 text-sm text-champagne/70">
            Archiving keeps the supplier record and its history, but removes it
            from active use. A supplier with published products cannot be
            archived until those products are unpublished.
          </p>
          <form action={supplier.status === "ARCHIVED" ? restoreSupplierAction : archiveSupplierAction} className="mt-4">
            <input type="hidden" name="supplierId" value={supplier.id} />
            {supplier.status === "ARCHIVED" ? (
              <ConfirmSubmitButton
                variant="secondary"
                confirmMessage="Restore this supplier to inactive status? Re-verify it before activating it again."
              >
                Restore supplier
              </ConfirmSubmitButton>
            ) : (
              <ConfirmSubmitButton
                confirmMessage="Archive this supplier? Its record and notes are kept, and any published products must be unpublished first."
              >
                Archive supplier
              </ConfirmSubmitButton>
            )}
          </form>
        </section>
      ) : null}

      <section className={panelClass} aria-labelledby="supplier-agreement">
        <h3 id="supplier-agreement" className="heading-editorial heading-champagne text-xl">
          Supply agreement and image rights
        </h3>
        <p className="mt-2 text-sm text-champagne/70">
          A product cannot be published until this agreement is APPROVED, the
          supply is authorised, and image usage is granted. Record only a real
          agreement you have actually received.
        </p>
        <form action={saveSupplierAgreementAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="supplierId" value={supplier.id} />
          <div>
            <label htmlFor="agreementStatus" className={labelClass}>Agreement status</label>
            <select
              id="agreementStatus"
              name="status"
              className={inputClass}
              defaultValue={agreement?.status ?? "NOT_RECEIVED"}
            >
              {AGREEMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ").toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="documentReference" className={labelClass}>
              Document reference <span className="font-normal text-champagne/60">(private)</span>
            </label>
            <input
              id="documentReference"
              name="documentReference"
              maxLength={200}
              defaultValue={agreement?.documentReference ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="agreementReceivedAt" className={labelClass}>Received on</label>
            <input
              id="agreementReceivedAt"
              name="agreementReceivedAt"
              type="date"
              defaultValue={dateValue(agreement?.agreementReceivedAt)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="validUntil" className={labelClass}>Valid until</label>
            <input
              id="validUntil"
              name="validUntil"
              type="date"
              defaultValue={dateValue(agreement?.validUntil)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="validFrom" className={labelClass}>Valid from</label>
            <input
              id="validFrom"
              name="validFrom"
              type="date"
              defaultValue={dateValue(agreement?.validFrom)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col justify-end gap-3">
            <label className="flex min-h-11 items-center gap-3 text-sm text-champagne">
              <input
                type="checkbox"
                name="supplyAuthorized"
                defaultChecked={agreement?.supplyAuthorized ?? false}
                disabled={!canVerify}
                className={checkboxClass}
              />
              Supply is authorised
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm text-champagne">
              <input
                type="checkbox"
                name="imageRightsGranted"
                defaultChecked={agreement?.imageRightsGranted ?? false}
                disabled={!canVerify}
                className={checkboxClass}
              />
              Image usage rights are granted
            </label>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="agreementNotes" className={labelClass}>
              Agreement notes <span className="font-normal text-champagne/60">(private)</span>
            </label>
            <textarea
              id="agreementNotes"
              name="notes"
              rows={3}
              maxLength={2000}
              defaultValue={agreement?.notes ?? ""}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
            {canVerify ? (
              <SubmitButton>Save agreement</SubmitButton>
            ) : (
              <p className="text-sm text-champagne/60">
                Agreement review requires suppliers.verify.
              </p>
            )}
            {agreement?.reviewedAt ? (
              <p className="text-xs text-champagne/60">
                Last reviewed{" "}
                {new Date(agreement.reviewedAt).toLocaleDateString("en-PK")} by{" "}
                {agreement.reviewedBy ?? "an administrator"}.
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <section className={panelClass} aria-labelledby="supplier-notes">
        <h3 id="supplier-notes" className="heading-editorial heading-champagne text-xl">
          Internal notes
        </h3>
        <p className="mt-2 text-sm text-champagne/70">
          Private notes for supplier communication, verification checks, and
          fulfilment follow-up. They are never shown to customers.
        </p>
        {canManage ? (
          <form action={addSupplierNoteAction} className="mt-4 space-y-3">
            <input type="hidden" name="supplierId" value={supplier.id} />
            <div>
              <label htmlFor="note-body" className={labelClass}>
                Add note
              </label>
              <textarea
                id="note-body"
                name="body"
                rows={3}
                required
                minLength={3}
                maxLength={2000}
                className={inputClass}
              />
            </div>
            <SubmitButton variant="secondary">Add note</SubmitButton>
          </form>
        ) : null}
        {supplier.notes.length === 0 ? (
          <p className="mt-4 text-sm text-champagne/70">No notes recorded.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {supplier.notes.map((note) => (
              <li
                key={note.id}
                className="rounded-brand border border-gold/15 px-4 py-3"
              >
                <p className="whitespace-pre-wrap text-sm text-champagne">
                  {note.body}
                </p>
                <p className="mt-2 text-xs text-champagne/55">
                  {note.author} · {formatDate(note.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="supplier-products">
        <h3 id="supplier-products" className="heading-editorial heading-champagne text-xl">
          Supplier products
        </h3>
        {supplier.products.length === 0 ? (
          <p className="mt-3 text-sm text-champagne/70">
            No products are linked to this supplier yet.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gold/25 text-champagne/70">
                  <th scope="col" className="py-2 pr-4 font-semibold">Product</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">SKU</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Price</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Cost</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Publication</th>
                  <th scope="col" className="py-2 font-semibold">Open</th>
                </tr>
              </thead>
              <tbody>
                {supplier.products.map((product) => (
                  <tr key={product.id} className="border-b border-gold/10">
                    <td className="py-3 pr-4 text-white">{product.name}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-champagne">{product.sku}</td>
                    <td className="py-3 pr-4 text-champagne">
                      {formatPkr({ amountMinor: product.sellingPriceMinor, currency: "PKR" })}
                    </td>
                    <td className="py-3 pr-4 text-champagne">
                      {formatPkr({ amountMinor: product.supplierCostMinor, currency: "PKR" })}
                    </td>
                    <td className="py-3 pr-4 text-champagne">
                      {product.publicationStatus.toLowerCase()}
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {canAudit ? (
        <section className={panelClass} aria-labelledby="supplier-activity">
          <h3 id="supplier-activity" className="heading-editorial heading-champagne text-xl">
            Recent activity
          </h3>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-champagne/70">
              No audit entries recorded for this supplier yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {activity.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-brand border border-gold/15 px-4 py-3"
                >
                  <p className="text-sm text-champagne">{entry.summary}</p>
                  <p className="mt-1 text-xs text-champagne/55">
                    {entry.actor} · {formatDate(entry.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
