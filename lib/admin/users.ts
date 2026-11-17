import { getDb } from "@/lib/db";

import {
  ADMIN_PERMISSIONS,
  SUPER_ADMIN_ONLY_PERMISSIONS,
  SUPER_ADMIN_ROLE_KEY,
  normalizePermissions,
  type AdminPermission,
} from "./permissions";
import { hashAdminPassword } from "./auth-crypto";
import { recordAdminAudit } from "./audit";
import { revokeUserSessions } from "./session";
import { validateAdminPassword } from "./auth";

export class AdminUserError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "AdminUserError";
    this.field = field;
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanEmail(value: string): string {
  const email = value.trim().toLowerCase();

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw new AdminUserError("email", "Enter a valid email address.");
  }

  return email;
}

function cleanName(value: string): string {
  const name = value.trim();

  if (name.length < 2 || name.length > 120) {
    throw new AdminUserError("name", "Enter a name of 2-120 characters.");
  }

  return name;
}

export async function listAdminUsers() {
  const now = Date.now();
  const users = await getDb().adminUser.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      lastLoginAt: true,
      failedLoginCount: true,
      lockedUntil: true,
      createdAt: true,
      role: { select: { id: true, key: true, name: true } },
    },
  });

  return users.map((user) => ({
    ...user,
    isLocked: user.lockedUntil !== null && user.lockedUntil.getTime() > now,
  }));
}

export async function getAdminUserForAdmin(id: string) {
  const now = Date.now();
  const user = await getDb().adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      lastLoginAt: true,
      failedLoginCount: true,
      lockedUntil: true,
      createdAt: true,
      roleId: true,
      role: { select: { id: true, key: true, name: true } },
      mfaCredential: {
        select: {
          confirmedAt: true,
          recoveryCodes: {
            where: { usedAt: null },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,
    isLocked: user.lockedUntil !== null && user.lockedUntil.getTime() > now,
  };
}

export async function listAdminRoles() {
  return getDb().adminRole.findMany({
    orderBy: { key: "asc" },
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
      permissions: true,
      _count: { select: { users: true } },
    },
  });
}

async function requireActiveSuperAdminRemains(excludingUserId: string) {
  const remaining = await getDb().adminUser.count({
    where: {
      id: { not: excludingUserId },
      status: "ACTIVE",
      role: { key: SUPER_ADMIN_ROLE_KEY },
    },
  });

  if (remaining === 0) {
    throw new AdminUserError(
      "status",
      "Keep at least one active Super Admin account.",
    );
  }
}

export async function createAdminUser(
  input: {
    email: string;
    name: string;
    roleId: string;
    password: string;
  },
  actor: string,
) {
  const email = cleanEmail(input.email);
  const name = cleanName(input.name);
  const passwordError = validateAdminPassword(input.password);

  if (passwordError) {
    throw new AdminUserError("password", passwordError);
  }

  const db = getDb();
  const role = await db.adminRole.findUnique({
    where: { id: input.roleId },
    select: { id: true, key: true },
  });

  if (!role) {
    throw new AdminUserError("roleId", "Choose a valid administrator role.");
  }

  const existing = await db.adminUser.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    throw new AdminUserError("email", "An account with this email already exists.");
  }

  const user = await db.adminUser.create({
    data: {
      email,
      name,
      passwordHash: hashAdminPassword(input.password),
      roleId: role.id,
      status: "ACTIVE",
    },
    select: { id: true, email: true },
  });

  await recordAdminAudit({
    actor,
    action: "adminUser.create",
    entityType: "AdminUser",
    entityId: user.id,
    summary: "Created an administrator account.",
    metadata: { roleKey: role.key },
  });

  return user;
}

export async function updateAdminUser(
  input: {
    id: string;
    name: string;
    roleId: string;
    status: "ACTIVE" | "DISABLED";
  },
  actor: { id: string; email: string },
) {
  if (input.id === actor.id && input.status === "DISABLED") {
    throw new AdminUserError("status", "You cannot disable your own account.");
  }

  const db = getDb();
  const existing = await db.adminUser.findUnique({
    where: { id: input.id },
    select: { id: true, email: true, roleId: true, status: true },
  });

  if (!existing) {
    throw new AdminUserError("id", "Administrator account not found.");
  }

  const role = await db.adminRole.findUnique({
    where: { id: input.roleId },
    select: { id: true, key: true },
  });

  if (!role) {
    throw new AdminUserError("roleId", "Choose a valid administrator role.");
  }

  if (input.id === actor.id && role.key !== SUPER_ADMIN_ROLE_KEY) {
    // Allowed, but only when another active Super Admin remains.
    await requireActiveSuperAdminRemains(input.id);
  }

  if (
    existing.status === "ACTIVE" &&
    (input.status === "DISABLED" || role.key !== SUPER_ADMIN_ROLE_KEY)
  ) {
    const existingRole = await db.adminRole.findUnique({
      where: { id: existing.roleId },
      select: { key: true },
    });

    if (existingRole?.key === SUPER_ADMIN_ROLE_KEY) {
      await requireActiveSuperAdminRemains(input.id);
    }
  }

  await db.adminUser.update({
    where: { id: input.id },
    data: {
      name: cleanName(input.name),
      roleId: role.id,
      status: input.status,
      ...(input.status === "DISABLED" ? { failedLoginCount: 0, lockedUntil: null } : {}),
    },
  });

  if (input.status === "DISABLED" || existing.roleId !== role.id) {
    await revokeUserSessions(input.id);
  }

  await recordAdminAudit({
    actor: actor.email,
    action: "adminUser.update",
    entityType: "AdminUser",
    entityId: input.id,
    summary: "Updated an administrator account or role.",
    metadata: { roleKey: role.key, status: input.status },
  });
}

export async function resetAdminUserPassword(
  input: { id: string; password: string },
  actor: { id: string; email: string },
) {
  const passwordError = validateAdminPassword(input.password);

  if (passwordError) {
    throw new AdminUserError("password", passwordError);
  }

  const db = getDb();
  const user = await db.adminUser.findUnique({
    where: { id: input.id },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new AdminUserError("id", "Administrator account not found.");
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: {
      passwordHash: hashAdminPassword(input.password),
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  if (user.id !== actor.id) {
    await revokeUserSessions(user.id);
  }

  await recordAdminAudit({
    actor: actor.email,
    action: "adminUser.password.reset",
    entityType: "AdminUser",
    entityId: user.id,
    summary: "Reset an administrator password and revoked existing sessions.",
  });
}

export async function unlockAdminUser(
  id: string,
  actor: { email: string },
) {
  const updated = await getDb().adminUser.updateMany({
    where: { id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });

  if (updated.count === 0) {
    throw new AdminUserError("id", "Administrator account not found.");
  }

  await recordAdminAudit({
    actor: actor.email,
    action: "adminUser.unlock",
    entityType: "AdminUser",
    entityId: id,
    summary: "Cleared a temporary administrator lockout.",
  });
}

export async function updateRolePermissions(
  input: { roleId: string; permissions: string[] },
  actor: { email: string },
) {
  const db = getDb();
  const role = await db.adminRole.findUnique({
    where: { id: input.roleId },
    select: { id: true, key: true },
  });

  if (!role) {
    throw new AdminUserError("roleId", "Administrator role not found.");
  }

  if (role.key === SUPER_ADMIN_ROLE_KEY) {
    throw new AdminUserError(
      "roleId",
      "The Super Admin role always keeps every permission and cannot be reduced.",
    );
  }

  const permissions = normalizePermissions(input.permissions);
  const reserved = permissions.filter((permission) =>
    SUPER_ADMIN_ONLY_PERMISSIONS.includes(permission),
  );

  if (reserved.length > 0) {
    throw new AdminUserError(
      "permissions",
      "Only the Super Admin role can manage administrator accounts and roles.",
    );
  }

  if (permissions.length === 0) {
    throw new AdminUserError("permissions", "Choose at least one permission.");
  }

  await db.adminRole.update({
    where: { id: role.id },
    data: { permissions },
  });

  // Permission changes take effect immediately by invalidating open sessions.
  await db.adminSession.deleteMany({
    where: { user: { roleId: role.id } },
  });

  await recordAdminAudit({
    actor: actor.email,
    action: "adminRole.permissions",
    entityType: "AdminRole",
    entityId: role.id,
    summary: "Updated role permissions and revoked affected sessions.",
    metadata: { permissions },
  });
}

export const PERMISSION_CATALOGUE: readonly AdminPermission[] = ADMIN_PERMISSIONS;
