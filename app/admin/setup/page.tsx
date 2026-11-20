import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { FirstAdminSetupForm } from "@/components/admin/FirstAdminSetupForm";
import { Notice } from "@/components/ui/FormPrimitives";
import { getAdminReadiness } from "@/lib/admin/config";
import {
  ADMIN_SETUP_SECRET_ENV,
  isAdminSetupSecretConfigured,
} from "@/lib/admin/setup";
import { getAdminContext } from "@/lib/admin/session";
import { defaultAdminPath } from "@/lib/admin/permissions";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "First administrator setup",
  description: "Private one-time first administrator setup.",
  path: "/admin/setup",
  noIndex: true,
});

function isSetupSecretConfigured(): boolean {
  return isAdminSetupSecretConfigured();
}

export default async function AdminSetupPage() {
  const readiness = await getAdminReadiness();

  if (readiness.state === "ready") {
    const context = await getAdminContext();

    if (context) {
      redirect(defaultAdminPath(context.user.role.permissions));
    }

    redirect("/admin/login?status=setup-complete");
  }

  if (readiness.state === "database-unconfigured") {
    return (
      <AdminAuthShell wide>
        <section>
          <p className="eyebrow">Administration</p>
          <h1 className="heading-editorial mt-2 text-2xl text-slate-900 sm:text-3xl">
            First administrator setup
          </h1>
          <div className="mt-6">
            <Notice tone="warning">
              Administrator setup is unavailable because the database is not
              configured on this deployment. Configure the server database
              connection, apply migrations, and set the one-time setup secret
              before returning here.
            </Notice>
          </div>
        </section>
      </AdminAuthShell>
    );
  }

  if (readiness.state === "database-error") {
    return (
      <AdminAuthShell wide>
        <section>
          <p className="eyebrow">Administration</p>
          <h1 className="heading-editorial mt-2 text-2xl text-slate-900 sm:text-3xl">
            First administrator setup
          </h1>
          <div className="mt-6">
            <Notice tone="error">
              The administrator database could not be checked. Confirm the database
              connection and migrations, then reload this page.
            </Notice>
          </div>
        </section>
      </AdminAuthShell>
    );
  }

  const secretConfigured = isSetupSecretConfigured();

  return (
    <AdminAuthShell wide>
      <section>
        <p className="eyebrow">Administration</p>
        <h1 className="heading-editorial mt-2 text-2xl text-slate-900 sm:text-3xl">
          First administrator setup
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          Create the initial Super Admin account for this JS Jewellers
          deployment. This setup is available only until the first administrator
          account exists and is protected by a server-configured one-time secret.
        </p>

        {!secretConfigured ? (
          <div className="mt-6">
            <Notice tone="warning">
              The one-time setup secret is not configured on this server. Set
              the <code>{ADMIN_SETUP_SECRET_ENV}</code> server environment
              variable to a long random value, restart or redeploy the
              application if required, then return here. The secret is never
              shown in this page.
            </Notice>
          </div>
        ) : (
          <FirstAdminSetupForm />
        )}

        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-600">
            Already have an administrator account?{" "}
            <Link
              href="/admin/login"
              className="font-semibold text-emerald-700 underline-offset-4 hover:underline focus-visible:outline-focus"
            >
              Sign in
            </Link>
            .
          </p>
        </div>
      </section>
    </AdminAuthShell>
  );
}
