import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/LoginForm";
import { Notice, panelClass } from "@/components/ui/FormPrimitives";
import { getAdminReadiness } from "@/lib/admin/config";
import { defaultAdminPath } from "@/lib/admin/permissions";
import { getAdminContext } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Administrator sign in",
  description: "Private administrator sign in.",
  path: "/admin/login",
  noIndex: true,
});

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const readiness = await getAdminReadiness();

  if (readiness.state === "ready") {
    const context = await getAdminContext();

    if (context) {
      redirect(defaultAdminPath(context.user.role.permissions));
    }
  }

  if (readiness.state === "no-accounts") {
    redirect("/admin/setup");
  }

  const status = first(query.status);
  const next = first(query.next);
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "";

  return (
    <section aria-labelledby="admin-login-heading">
      <div className="container-page py-section md:py-section-lg">
        <div className="mx-auto max-w-md">
          <p className="eyebrow">Private area</p>
          <h1
            id="admin-login-heading"
            className="heading-page heading-gold mt-3 text-4xl"
          >
            Administrator sign in
          </h1>
          <p className="body-copy mt-4 text-base">
            This area is restricted to authorised JS Jewellers staff. Customer
            and supplier private information is never shown without signing in.
          </p>

          <div className={`${panelClass} mt-8`}>
            {readiness.state === "database-unconfigured" ? (
              <Notice tone="warning">
                The database is not configured on this deployment. Set{" "}
                <span className="font-mono">DATABASE_URL</span> in the server
                environment before signing in.
              </Notice>
            ) : null}

            {readiness.state === "database-error" ? (
              <Notice tone="error">
                The database could not be reached. Check the PostgreSQL service
                and the configured connection string, then try again.
              </Notice>
            ) : null}

            {readiness.state === "ready" ? (
              <>
                {status === "required" ? (
                  <Notice tone="warning">
                    Sign in to continue. Your session may have expired.
                  </Notice>
                ) : null}
                {status === "signed-out" ? (
                  <Notice tone="info">
                    You have been signed out and your server session was
                    revoked.
                  </Notice>
                ) : null}
                {status === "setup-complete" ? (
                  <Notice tone="success">
                    First-time administrator setup is complete. Sign in with
                    your new administrator account.
                  </Notice>
                ) : null}
                <AdminLoginForm next={safeNext} />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
