import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { MfaVerifyForm } from "@/components/admin/MfaVerifyForm";
import { Notice, linkClass } from "@/components/ui/FormPrimitives";
import { defaultAdminPath } from "@/lib/admin/permissions";
import { readMfaChallenge } from "@/lib/admin/mfa-challenge";
import { getAdminContext } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Administrator verification",
  description: "Private administrator second-factor verification.",
  path: "/admin/mfa/verify",
  noIndex: true,
});

export default async function AdminMfaVerifyPage() {
  const context = await getAdminContext();

  if (context) {
    redirect(
      context.mfa.enforced && !context.mfa.enrolled
        ? "/admin/mfa"
        : defaultAdminPath(context.user.role.permissions),
    );
  }

  const challenge = await readMfaChallenge();

  if (!challenge) {
    redirect("/admin/login?status=required");
  }

  return (
    <AdminAuthShell>
      <section aria-labelledby="admin-mfa-heading">
        <p className="eyebrow">Private area</p>
        <h1
          id="admin-mfa-heading"
          className="heading-editorial mt-2 text-2xl text-slate-900 sm:text-3xl"
        >
          Verify your sign-in
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your password was accepted. Enter your authenticator code, or a saved
          recovery code, to finish signing in. No administrator session exists
          until this step succeeds.
        </p>

        <div className="mt-6 space-y-4">
          <Notice tone="info">
            This verification step expires five minutes after your password was
            accepted.
          </Notice>
          <MfaVerifyForm />
          <p className="border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">
            Lost your device and recovery codes?{" "}
            <Link href="/admin/login" className={linkClass}>
              Return to sign in
            </Link>{" "}
            and ask a Super Admin to reset MFA for your account.
          </p>
        </div>
      </section>
    </AdminAuthShell>
  );
}
