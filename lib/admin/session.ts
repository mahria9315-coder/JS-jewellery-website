import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/lib/db";

import {
  ADMIN_SESSION_DURATION_SECONDS,
  generateAdminSessionToken,
  hashAdminSessionToken,
} from "./auth-crypto";
import { isMfaEncryptionKeyConfigured } from "./mfa-crypto";
import { isMfaEnforced } from "./mfa-policy";
import {
  defaultAdminPath,
  hasPermission,
  isSuperAdminRole,
  type AdminPermission,
} from "./permissions";

/**
 * Database-backed administrator sessions.
 *
 * The browser holds an opaque random token in an HTTP-only cookie. The database
 * stores only its SHA-256 hash, together with the user, expiry, and a coarse
 * last-seen timestamp. Revoking a session is therefore a real server-side
 * operation, not just a cookie deletion.
 */

export const ADMIN_SESSION_COOKIE = "js_admin_session";

const LAST_SEEN_REFRESH_MS = 5 * 60 * 1000;

export type AdminContext = {
  sessionId: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
    role: {
      key: string;
      name: string;
      permissions: string[];
    };
  };
  mfa: {
    enforced: boolean;
    enrolled: boolean;
    keyConfigured: boolean;
  };
};

export async function getAdminContext(): Promise<AdminContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const db = getDb();
  let session: {
    id: string;
    expiresAt: Date;
    lastSeenAt: Date;
    user: {
      id: string;
      email: string;
      name: string;
      status: string;
      role: { key: string; name: string; permissions: string[] };
      mfaCredential: { confirmedAt: Date | null } | null;
    };
  } | null;

  try {
    session = await db.adminSession.findUnique({
      where: { tokenHash: hashAdminSessionToken(token) },
      select: {
        id: true,
        expiresAt: true,
        lastSeenAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
            role: {
              select: { key: true, name: true, permissions: true },
            },
            mfaCredential: {
              select: { confirmedAt: true },
            },
          },
        },
      },
    });
  } catch {
    // A database outage must not be mistaken for an authenticated session.
    return null;
  }

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) {
      await db.adminSession
        .delete({ where: { id: session.id } })
        .catch(() => undefined);
    }

    return null;
  }

  if (session.user.status !== "ACTIVE") {
    await db.adminSession
      .deleteMany({ where: { userId: session.user.id } })
      .catch(() => undefined);
    return null;
  }

  if (Date.now() - session.lastSeenAt.getTime() > LAST_SEEN_REFRESH_MS) {
    await db.adminSession
      .update({
        where: { id: session.id },
        data: { lastSeenAt: new Date() },
      })
      .catch(() => undefined);
  }

  return {
    sessionId: session.id,
    expiresAt: session.expiresAt,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: {
        key: session.user.role.key,
        name: session.user.role.name,
        permissions: session.user.role.permissions,
      },
    },
    mfa: {
      enforced: isMfaEnforced(),
      enrolled: Boolean(session.user.mfaCredential?.confirmedAt),
      keyConfigured: isMfaEncryptionKeyConfigured(),
    },
  };
}

/** True when at least one administrator account exists. */
export async function hasAnyAdminUser(): Promise<boolean> {
  try {
    const count = await getDb().adminUser.count();
    return count > 0;
  } catch {
    return false;
  }
}

export async function createAdminSession(userId: string, metadata: {
  ipHash?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  const token = generateAdminSessionToken();
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION_SECONDS * 1000);

  await getDb().adminSession.create({
    data: {
      tokenHash: hashAdminSessionToken(token),
      userId,
      expiresAt,
      ipHash: metadata.ipHash ?? null,
      userAgent: metadata.userAgent?.slice(0, 300) ?? null,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
}

export async function destroyCurrentAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    await getDb()
      .adminSession.deleteMany({ where: { tokenHash: hashAdminSessionToken(token) } })
      .catch(() => undefined);
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function revokeOtherAdminSessions(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  await getDb().adminSession.deleteMany({
    where: {
      userId,
      ...(token ? { NOT: { tokenHash: hashAdminSessionToken(token) } } : {}),
    },
  });
}

export async function revokeUserSessions(userId: string): Promise<void> {
  await getDb().adminSession.deleteMany({ where: { userId } });
}

export async function deleteExpiredAdminSessions(): Promise<void> {
  await getDb()
    .adminSession.deleteMany({ where: { expiresAt: { lte: new Date() } } })
    .catch(() => undefined);
}

/**
 * Page guard. Redirects unauthenticated visitors to sign in and signed-in users
 * without the required permission to their account page.
 *
 * When MFA is enforced, an account without a confirmed authenticator is
 * restricted to the enrolment page. `allowUnenrolled` is used only by that page
 * and the sign-in-adjacent account controls.
 */
export async function requireAdminPage(
  permission?: AdminPermission,
  options?: { allowUnenrolled?: boolean },
): Promise<AdminContext> {
  const context = await getAdminContext();

  if (!context) {
    redirect("/admin/login?status=required");
  }

  if (permission && !hasPermission(context.user.role.permissions, permission)) {
    redirect(
      `/admin/account?denied=${encodeURIComponent(permission)}`,
    );
  }

  if (
    context.mfa.enforced &&
    !context.mfa.enrolled &&
    !options?.allowUnenrolled
  ) {
    redirect("/admin/mfa?status=enrollment-required");
  }

  return context;
}

/**
 * Page guard for account and role management. In addition to a valid session,
 * the signed-in account must hold the Super Admin role itself; the permission
 * flags alone are not sufficient.
 */
export async function requireSuperAdminPage(): Promise<AdminContext> {
  const context = await requireAdminPage();

  if (!isSuperAdminRole(context.user.role.key)) {
    redirect("/admin/account?denied=super-admin");
  }

  return context;
}

/** Authentication-only guard used by the admin shell. */
export async function requireAdminSession(): Promise<AdminContext> {
  return requireAdminPage();
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
  };
}

export function adminHomePath(context: AdminContext): string {
  return defaultAdminPath(context.user.role.permissions);
}
