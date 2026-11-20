import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import logo from "@/public/Luxury Gold Jewelry Monogram Logo.png";

/**
 * Shared Green & White shell for the private sign-in, first-run setup, MFA
 * verification, and recovery-code screens.
 */
export function AdminAuthShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="admin-shell admin-auth">
      <div
        className={`admin-auth__frame ${wide ? "admin-auth__frame--wide" : ""}`}
      >
        <Link
          href="/admin/login"
          className="admin-auth__brand rounded-lg focus-visible:outline-focus"
          aria-label="JS Jewellers administration sign in"
        >
          <span className="admin-brand-mark h-11 w-11 rounded-xl">
            <Image
              src={logo}
              alt=""
              priority
              quality={90}
              sizes="44px"
              className="h-10 w-auto mix-blend-screen"
            />
          </span>
          <span>
            <span className="admin-auth__brand-name">JS Jewellers</span>
            <span className="admin-auth__brand-sub">Administration</span>
          </span>
        </Link>

        <div className="admin-auth__card">{children}</div>

        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          Private area for authorised JS Jewellers staff. Customer, supplier, and
          payment information is never shown without signing in.
        </p>
      </div>
    </div>
  );
}
