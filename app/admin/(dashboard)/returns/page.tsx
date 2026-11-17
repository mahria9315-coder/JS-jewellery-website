import type { Metadata } from "next";
import Link from "next/link";

import {
  Notice,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { listReturnRequestsForAdmin } from "@/lib/admin/returns";
import { requireAdminPage } from "@/lib/admin/session";
import { processRefundAction, reviewReturnAction } from "@/lib/actions/admin";
import { formatPkr } from "@/lib/catalogue";
import {
  RETURN_REASON_LABELS,
  type ReturnReason,
} from "@/lib/returns/refund";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Returns",
  description: "Private return and refund management.",
  path: "/admin/returns",
  noIndex: true,
});

type ReturnsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REFUND_PROCESSED: "Refund processed",
};

export default async function AdminReturnsPage({
  searchParams,
}: ReturnsPageProps) {
  await requireAdminPage("returns.view");
  const query = await searchParams;
  const requests = await listReturnRequestsForAdmin();
  const reviewed = first(query.return);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-editorial heading-champagne text-2xl">
          Returns and refunds
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-champagne/70">
          Refund amounts are calculated on the server under the approved
          Pakistan policy. Protected cases never receive the 25%
          change-of-mind deduction. Record a refund only after the money has
          actually been returned.
        </p>
      </div>

      {first(query.error) ? <Notice tone="error">{first(query.error)}</Notice> : null}
      {reviewed === "approve" ? (
        <Notice tone="success">Return request approved.</Notice>
      ) : null}
      {reviewed === "reject" ? (
        <Notice tone="warning">Return request rejected.</Notice>
      ) : null}
      {reviewed === "refunded" ? (
        <Notice tone="success">Refund recorded and payment marked refunded.</Notice>
      ) : null}

      {requests.length === 0 ? (
        <div className={panelClass}>
          <p className="text-sm text-champagne/70">No return requests yet.</p>
        </div>
      ) : (
        <ul className="space-y-6">
          {requests.map((request) => {
            const reviewable =
              request.status === "SUBMITTED" || request.status === "UNDER_REVIEW";

            return (
              <li key={request.id} className={panelClass}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="heading-product text-xl text-white">
                      {RETURN_REASON_LABELS[request.reason as ReturnReason] ??
                        request.reason}
                    </h3>
                    <p className="mt-1 text-sm text-champagne/70">
                      Order{" "}
                      <Link
                        href={`/admin/orders/${request.order.id}`}
                        className="font-mono text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                      >
                        {request.order.orderNumber}
                      </Link>{" "}
                      · {request.order.customerName} · {request.order.customerEmail}
                    </p>
                  </div>
                  <p className="text-sm">
                    <span className="rounded-brand border border-gold/30 px-3 py-1 text-champagne">
                      {STATUS_LABELS[request.status] ?? request.status}
                    </span>
                  </p>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-champagne/60">Order total</dt>
                    <dd className="text-white">
                      {formatPkr({
                        amountMinor: request.order.totalMinor,
                        currency: "PKR",
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-champagne/60">Refund amount</dt>
                    <dd className="text-white">
                      {formatPkr({
                        amountMinor: request.refundAmountMinor,
                        currency: "PKR",
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-champagne/60">Protected case</dt>
                    <dd className="text-white">
                      {request.protectedCase ? "Yes — no deduction" : "No"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-champagne/60">Deduction</dt>
                    <dd className="text-white">
                      {request.deductionPercent}% (
                      {formatPkr({
                        amountMinor: request.deductionMinor,
                        currency: "PKR",
                      })}
                      )
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-champagne/60">Customer explanation</dt>
                    <dd className="mt-1 whitespace-pre-line text-white">
                      {request.explanation}
                    </dd>
                  </div>
                  {request.adminNotes ? (
                    <div className="sm:col-span-2">
                      <dt className="text-champagne/60">Admin notes</dt>
                      <dd className="mt-1 whitespace-pre-line text-white">
                        {request.adminNotes}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                {reviewable ? (
                  <div className="mt-5 grid gap-4 border-t border-gold/20 pt-4 lg:grid-cols-2">
                    <form action={reviewReturnAction} className="space-y-3">
                      <input type="hidden" name="returnId" value={request.id} />
                      <input type="hidden" name="decision" value="APPROVE" />
                      <div>
                        <label htmlFor={`approve-${request.id}`} className={labelClass}>
                          Approval note
                        </label>
                        <input
                          id={`approve-${request.id}`}
                          name="adminNotes"
                          required
                          minLength={3}
                          maxLength={1000}
                          className={inputClass}
                        />
                      </div>
                      <button type="submit" className={buttonPrimary}>
                        Approve return
                      </button>
                    </form>

                    <form action={reviewReturnAction} className="space-y-3">
                      <input type="hidden" name="returnId" value={request.id} />
                      <input type="hidden" name="decision" value="REJECT" />
                      <div>
                        <label htmlFor={`reject-${request.id}`} className={labelClass}>
                          Rejection note
                        </label>
                        <input
                          id={`reject-${request.id}`}
                          name="adminNotes"
                          required
                          minLength={3}
                          maxLength={1000}
                          className={inputClass}
                        />
                      </div>
                      <button type="submit" className={buttonDanger}>
                        Reject return
                      </button>
                    </form>
                  </div>
                ) : null}

                {request.status === "APPROVED" ? (
                  <form
                    action={processRefundAction}
                    className="mt-5 grid gap-3 border-t border-gold/20 pt-4 sm:grid-cols-2"
                  >
                    <input type="hidden" name="returnId" value={request.id} />
                    <div>
                      <label htmlFor={`refund-ref-${request.id}`} className={labelClass}>
                        Refund transaction reference
                      </label>
                      <input
                        id={`refund-ref-${request.id}`}
                        name="refundReference"
                        required
                        minLength={3}
                        maxLength={120}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`refund-note-${request.id}`} className={labelClass}>
                        Refund note
                      </label>
                      <input
                        id={`refund-note-${request.id}`}
                        name="adminNotes"
                        required
                        minLength={3}
                        maxLength={1000}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button type="submit" className={buttonSecondary}>
                        Record completed refund
                      </button>
                    </div>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
