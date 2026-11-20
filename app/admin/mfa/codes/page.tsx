import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { Notice, buttonPrimary } from "@/components/ui/FormPrimitives";
import { adminDismissRecoveryCodesAction } from "@/lib/actions/admin";
import { readRecoveryCodesForDisplay } from "@/lib/admin/mfa-challenge";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Administrator recovery codes",
  description: "Private one-time MFA recovery codes.",
  path: "/admin/mfa/codes",
  noIndex: true,
});

export default async function AdminMfaCodesPage() {
  await requireAdminPage(undefined, { allowUnenrolled: true });

  const codes = await readRecoveryCodesForDisplay();

  if (!codes) {
    redirect("/admin/mfa");
  }

  return (
    <AdminAuthShell wide>
      <section>
        <p className="eyebrow">Administration</p>
        <h1 className="heading-editorial mt-2 text-2xl text-slate-900 sm:text-3xl">
          Save your recovery codes now
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          These codes are shown once and are not recoverable later. Store them
          offline, separately from the device that runs your authenticator app.
          Each code can be used once if the app is unavailable.
        </p>

        <div className="mt-6">
          <Notice tone="warning">
            Do not email, message, or photograph these codes into a shared
            account. Closing this page without saving them means you may lose
            access if your authenticator device is lost.
          </Notice>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {codes.map((code) => (
            <li
              key={code}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-base tracking-widest text-slate-900"
            >
              {code}
            </li>
          ))}
        </ul>

        <form action={adminDismissRecoveryCodesAction} className="mt-8">
          <button type="submit" className={buttonPrimary}>
            I have saved these codes
          </button>
        </form>
      </section>
    </AdminAuthShell>
  );
}
