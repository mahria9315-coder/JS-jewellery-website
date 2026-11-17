import type { Metadata } from "next";
import Link from "next/link";

import { MfaEnrollmentConfirmForm } from "@/components/admin/MfaEnrollmentConfirmForm";
import { MfaRecoveryRegenerateForm } from "@/components/admin/MfaRecoveryRegenerateForm";
import { formatDate } from "@/components/admin/AdminUI";
import {
  Notice,
  buttonPrimary,
  buttonSecondary,
  linkClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  adminLogoutAction,
  adminStartMfaEnrollmentAction,
} from "@/lib/actions/admin";
import { getMfaStatus, getPendingEnrollment } from "@/lib/admin/mfa";
import { ADMIN_MFA_ENCRYPTION_KEY_ENV } from "@/lib/admin/mfa-crypto";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Administrator multi-factor authentication",
  description: "Private administrator MFA setup.",
  path: "/admin/mfa",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminMfaPage({ searchParams }: PageProps) {
  const context = await requireAdminPage(undefined, {
    allowUnenrolled: true,
  });
  const params = await searchParams;
  const status = await getMfaStatus(context.user.id);
  const pending = status.pending
    ? await getPendingEnrollment(context.user.id)
    : null;

  return (
    <main className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-3xl items-start px-4 py-16 sm:px-6 lg:px-8">
      <section className={panelClass}>
        <p className="section-eyebrow">Administration</p>
        <h1 className="heading-editorial mt-3 text-3xl text-white sm:text-4xl">
          Multi-factor authentication
        </h1>
        <p className="mt-4 text-sm leading-6 text-champagne/80 sm:text-base">
          Protect your administrator account with a time-based authenticator
          app. A password alone never creates a session while an authenticator
          is enrolled.
        </p>

        {first(params, "status") === "enrollment-required" ? (
          <div className="mt-6">
            <Notice tone="warning">
              This deployment requires multi-factor authentication. Enrol an
              authenticator before opening any other administrator screen.
            </Notice>
          </div>
        ) : null}

        {first(params, "status") === "setup-complete" ||
        first(params, "setup") === "complete" ? (
          <div className="mt-6">
            <Notice tone="success">
              Your administrator account was created. Complete authenticator
              enrolment now to finish securing it.
            </Notice>
          </div>
        ) : null}

        {first(params, "error") ? (
          <div className="mt-6">
            <Notice tone="error">{first(params, "error")}</Notice>
          </div>
        ) : null}

        {!status.keyConfigured ? (
          <div className="mt-6">
            <Notice tone="error">
              MFA encryption is not configured on this server. An owner must set{" "}
              <code>{ADMIN_MFA_ENCRYPTION_KEY_ENV}</code> to a base64- or
              hex-encoded 32-byte key. Administrator access stays restricted
              until it is configured.
            </Notice>
          </div>
        ) : null}

        {status.enrolled ? (
          <div className="mt-8 border-t border-gold/15 pt-6">
            <h2 className="heading-editorial text-xl text-white">
              Authenticator enrolled
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-champagne/60">Enrolled</dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  {formatDate(status.confirmedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-champagne/60">
                  Unused recovery codes
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  {status.recoveryCodesRemaining}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-champagne/70">
              Generate a new set of recovery codes if the old sheet is lost or
              may have been seen. Replacing the codes invalidates every
              previous recovery code.
            </p>
            <MfaRecoveryRegenerateForm />
          </div>
        ) : pending ? (
          <div className="mt-8 border-t border-gold/15 pt-6">
            <h2 className="heading-editorial text-xl text-white">
              Add the account to your authenticator app
            </h2>
            <p className="mt-3 text-sm leading-6 text-champagne/80">
              Open your authenticator app, choose “add account”, and enter this
              setup key. Keep it private; anyone with this key can generate
              sign-in codes.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-champagne">
                  Setup key
                </p>
                <code className="mt-1 block break-all rounded-brand border border-gold/25 bg-charcoal px-3 py-2.5 text-sm text-white">
                  {pending.secret}
                </code>
              </div>
              <div>
                <p className="text-sm font-semibold text-champagne">
                  Setup URI (for apps that accept a link)
                </p>
                <code className="mt-1 block break-all rounded-brand border border-gold/25 bg-charcoal px-3 py-2.5 text-xs text-champagne/80">
                  {pending.uri}
                </code>
              </div>
            </div>
            <MfaEnrollmentConfirmForm />
            <p className="mt-4 text-xs text-champagne/60">
              Already enrolled but need to start again? Reload this page; the
              pending secret is replaced only when you start setup again.
            </p>
          </div>
        ) : (
          <div className="mt-8 border-t border-gold/15 pt-6">
            <h2 className="heading-editorial text-xl text-white">
              Enrol an authenticator
            </h2>
            <p className="mt-3 text-sm leading-6 text-champagne/80">
              You will be shown a setup key, then asked for the six-digit code
              from your app. Recovery codes are generated once at the end and
              shown a single time.
            </p>
            <form action={adminStartMfaEnrollmentAction} className="mt-5">
              <button
                type="submit"
                className={buttonPrimary}
                disabled={!status.keyConfigured}
              >
                Start authenticator setup
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-gold/15 pt-5">
          <Link href="/admin/account" className={linkClass}>
            My account
          </Link>
          <form action={adminLogoutAction}>
            <button type="submit" className={buttonSecondary}>
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
