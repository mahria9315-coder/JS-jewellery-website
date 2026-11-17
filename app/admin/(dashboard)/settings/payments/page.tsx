import type { Metadata } from "next";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import { AdminPageHeader, StatusPill, formatDate } from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { updatePaymentSettingAction } from "@/lib/actions/admin-content";
import { getPaymentSettingsForAdmin } from "@/lib/admin/settings";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Payment methods",
  description: "Private payment method settings.",
  path: "/admin/settings/payments",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentSettingsPage({ searchParams }: PageProps) {
  await requireAdminPage("payments.view");
  const params = await searchParams;

  let methods: Awaited<ReturnType<typeof getPaymentSettingsForAdmin>> = [];
  let unavailable = false;

  try {
    methods = await getPaymentSettingsForAdmin();
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Administration"
        title="Payment methods"
        description="Only the approved manual methods are listed. Account numbers and account-holder names come from server environment variables and are never shown or edited here. No payment is verified automatically."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Settings" },
          { label: "Payment methods" },
        ]}
      />

      <AdminQueryNotice params={params} />

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Payment settings could not be loaded because the database is
            unavailable.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {methods.map((method) => (
            <section key={method.method} className={panelClass}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="heading-editorial heading-champagne text-xl">
                  {method.displayLabel}
                </h3>
                <StatusPill
                  status={
                    method.configured
                      ? method.enabled
                        ? "Enabled"
                        : "Configured, disabled"
                      : "Not configured"
                  }
                  tone={
                    method.configured
                      ? method.enabled
                        ? "success"
                        : "warning"
                      : "danger"
                  }
                />
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-champagne/60">Stored method key</dt>
                  <dd className="font-mono text-champagne">{method.method}</dd>
                </div>
                <div>
                  <dt className="text-champagne/60">Account holder record</dt>
                  <dd className="text-champagne">
                    {method.accountHolderConfigured
                      ? "Server-side value configured"
                      : "Not configured"}
                  </dd>
                </div>
                <div>
                  <dt className="text-champagne/60">Missing environment names</dt>
                  <dd className="font-mono text-xs text-amber-200">
                    {method.missingEnvKeys.length > 0
                      ? method.missingEnvKeys.join(", ")
                      : "None"}
                  </dd>
                </div>
                <div>
                  <dt className="text-champagne/60">Last updated</dt>
                  <dd className="text-champagne">
                    {formatDate(method.updatedAt)}
                  </dd>
                </div>
              </dl>

              <form action={updatePaymentSettingAction} className="mt-5 grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="method" value={method.method} />
                <div className="sm:col-span-2">
                  <label htmlFor={`label-${method.method}`} className={labelClass}>
                    Public label
                  </label>
                  <input
                    id={`label-${method.method}`}
                    name="displayLabel"
                    required
                    minLength={2}
                    maxLength={80}
                    defaultValue={method.displayLabel}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`instructions-${method.method}`} className={labelClass}>
                    Public instructions (optional)
                  </label>
                  <textarea
                    id={`instructions-${method.method}`}
                    name="publicInstructions"
                    rows={3}
                    maxLength={1000}
                    defaultValue={method.publicInstructions ?? ""}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-champagne/60">
                    Describe the manual steps only. Account numbers are injected
                    from the server configuration when the customer selects the
                    method.
                  </p>
                </div>
                <label className="flex items-start gap-2 text-sm text-champagne sm:col-span-2">
                  <input
                    type="checkbox"
                    name="enabled"
                    defaultChecked={method.enabled}
                    className={checkboxClass}
                  />
                  Enable this method at checkout (requires server credentials)
                </label>
                <div className="sm:col-span-2">
                  <SubmitButton>Save payment method</SubmitButton>
                </div>
              </form>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
