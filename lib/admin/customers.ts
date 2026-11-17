import { getDb } from "@/lib/db";

import { recordAdminAudit } from "./audit";

/**
 * Customer records for order support.
 *
 * Customer data is private. Only authorised staff can open these pages, and no
 * customer list or profile is exposed publicly. Notes are internal and never
 * shown to the customer.
 */

export class CustomerError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "CustomerError";
    this.field = field;
  }
}

export async function listCustomers(search?: string) {
  const db = getDb();
  const query = search?.trim();

  return db.customer.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      _count: { select: { orders: true } },
      orders: {
        select: { totalMinor: true, currency: true, orderStatus: true },
        where: { orderStatus: { not: "CANCELLED" } },
      },
    },
  });
}

export async function getCustomerForAdmin(id: string) {
  return getDb().customer.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      addresses: { orderBy: { createdAt: "desc" } },
      noteList: { orderBy: { createdAt: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          paymentStatus: true,
          totalMinor: true,
          currency: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function updateCustomer(
  input: {
    id: string;
    name: string;
    phone: string;
    status: "ACTIVE" | "DISABLED";
  },
  actor: string,
) {
  const name = input.name.trim();
  const phone = input.phone.trim();

  if (name.length < 2 || name.length > 120) {
    throw new CustomerError("name", "Enter a name of 2-120 characters.");
  }

  if (!/^[+0-9\s()-]{7,30}$/.test(phone)) {
    throw new CustomerError("phone", "Enter a valid phone number.");
  }

  const updated = await getDb().customer.updateMany({
    where: { id: input.id },
    data: { name, phone, status: input.status },
  });

  if (updated.count === 0) {
    throw new CustomerError("id", "Customer not found.");
  }

  await recordAdminAudit({
    actor,
    action: "customer.update",
    entityType: "Customer",
    entityId: input.id,
    summary: "Updated customer contact details or status.",
    metadata: { status: input.status },
  });
}

export async function addCustomerNote(input: {
  customerId: string;
  body: string;
  actor: string;
}) {
  const body = input.body.trim();

  if (body.length < 3 || body.length > 2000) {
    throw new CustomerError("body", "Enter a note of 3-2000 characters.");
  }

  const customer = await getDb().customer.findUnique({
    where: { id: input.customerId },
    select: { id: true },
  });

  if (!customer) {
    throw new CustomerError("customerId", "Customer not found.");
  }

  await getDb().customerNote.create({
    data: { customerId: customer.id, body, author: input.actor },
  });

  await recordAdminAudit({
    actor: input.actor,
    action: "customer.note.create",
    entityType: "Customer",
    entityId: customer.id,
    summary: "Added an internal customer note.",
  });
}
