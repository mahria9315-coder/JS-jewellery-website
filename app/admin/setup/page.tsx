import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FirstAdminSetupForm } from "@/components/admin/FirstAdminSetupForm";
import { Notice, panelClass } from "@/components/ui/FormPrimitives";
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
      <main className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <section className={panelClass}>
          <p className="section-eyebrow">Administration</p>
          <h1 className="heading-editorial mt-3 text-3xl text-white sm:text-4xl">
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
      </main>
    );
  }

  if (readiness.state === "database-error") {
    return (
      <main className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <section className={panelClass}>
          <p className="section-eyebrow">Administration</p>
          <h1 className="heading-editorial mt-3 text-3xl text-white sm:text-4xl">
            First administrator setup
          </h1>
          <div className="mt-6">
            <Notice tone="error">
              The administrator database could not be checked. Confirm the database
              connection and migrations, then reload this page.
            </Notice>
          </div>
        </section>
      </main>
    );
  }

  const secretConfigured = isSetupSecretConfigured();

  return (
    <main className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <section className={panelClass}>
        <p className="section-eyebrow">Administration</p>
        <h1 className="heading-editorial mt-3 text-3xl text-white sm:text-4xl">
          First administrator setup
        </h1>
        <p className="mt-4 text-sm leading-6 text-champagne/80 sm:text-base">
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

        <div className="mt-6 border-t border-gold/15 pt-4">
          <p className="text-sm text-champagne/65">
            Already have an administrator account?{" "}
            <Link
              href="/admin/login"
              className="font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-focus"
            >
              Sign in
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
