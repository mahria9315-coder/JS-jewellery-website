import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MfaVerifyForm } from "@/components/admin/MfaVerifyForm";
import { Notice, linkClass, panelClass } from "@/components/ui/FormPrimitives";
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
    <section aria-labelledby="admin-mfa-heading">
      <div className="container-page py-section md:py-section-lg">
        <div className="mx-auto max-w-md">
          <p className="eyebrow">Private area</p>
          <h1
            id="admin-mfa-heading"
            className="heading-page heading-gold mt-3 text-4xl"
          >
            Verify your sign-in
          </h1>
          <p className="body-copy mt-4 text-base">
            Your password was accepted. Enter your authenticator code, or a
            saved recovery code, to finish signing in. No administrator session
            exists until this step succeeds.
          </p>

          <div className={`${panelClass} mt-8`}>
            <Notice tone="info">
              This verification step expires five minutes after your password
              was accepted.
            </Notice>
            <MfaVerifyForm />
            <p className="mt-6 border-t border-gold/15 pt-4 text-sm text-champagne/65">
              Lost your device and recovery codes?{" "}
              <Link href="/admin/login" className={linkClass}>
                Return to sign in
              </Link>{" "}
              and ask a Super Admin to reset MFA for your account.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
