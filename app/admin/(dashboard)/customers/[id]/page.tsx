import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
  StatusPill,
  formatDate,
} from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { addCustomerNoteAction, updateCustomerAction } from "@/lib/actions/admin-content";
import { getCustomerForAdmin } from "@/lib/admin/customers";
import { requireAdminPage } from "@/lib/admin/session";
import { formatPkr } from "@/lib/catalogue";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Customer record",
  description: "Private customer record.",
  path: "/admin/customers",
  noIndex: true,
});

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomerDetailPage({ params, searchParams }: PageProps) {
  const context = await requireAdminPage("customers.view");
  const { id } = await params;
  const query = await searchParams;
  const canManage = context.user.role.permissions.includes("customers.manage");
  const customer = await getCustomerForAdmin(id).catch(() => null);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Customers"
        title={customer.name}
        description="Contact details are shown for order support only. Internal notes are never visible to the customer."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Customers", href: "/admin/customers" },
          { label: customer.name },
        ]}
      />

      <AdminQueryNotice params={query} />

      <section className={panelClass} aria-labelledby="customer-details">
        <h3 id="customer-details" className="heading-editorial heading-champagne text-xl">
          Contact details
        </h3>
        <p className="mt-2 text-sm text-champagne/70">
          Email address: <span className="text-white">{customer.email}</span>{" "}
          (changing the email address is not supported here because it identifies
          the stored order history).
        </p>
        <form action={updateCustomerAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={customer.id} />
          <div>
            <label htmlFor="name" className={labelClass}>
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={customer.name}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              required
              defaultValue={customer.phone}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Account status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={customer.status}
              className={inputClass}
            >
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
          {canManage ? (
            <div className="sm:col-span-2">
              <SubmitButton>Save customer</SubmitButton>
            </div>
          ) : null}
        </form>
      </section>

      <section aria-labelledby="customer-orders">
        <h3 id="customer-orders" className="heading-editorial heading-champagne text-xl">
          Order history
        </h3>
        {customer.orders.length === 0 ? (
          <p className="mt-3 text-sm text-champagne/70">No orders recorded.</p>
        ) : (
          <div className="mt-4">
            <AdminTable caption="Customer orders" minWidth="48rem">
              <thead>
                <tr>
                  <AdminTh>Order</AdminTh>
                  <AdminTh>Status</AdminTh>
                  <AdminTh>Payment</AdminTh>
                  <AdminTh align="right">Total</AdminTh>
                  <AdminTh>Placed</AdminTh>
                  <AdminTh>Open</AdminTh>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((order) => (
                  <tr key={order.id}>
                    <AdminTd>
                      <span className="font-mono text-xs">{order.orderNumber}</span>
                    </AdminTd>
                    <AdminTd>{order.orderStatus.replaceAll("_", " ")}</AdminTd>
                    <AdminTd>{order.paymentStatus.replaceAll("_", " ")}</AdminTd>
                    <AdminTd align="right">
                      {formatPkr({ amountMinor: order.totalMinor, currency: "PKR" })}
                    </AdminTd>
                    <AdminTd>{formatDate(order.createdAt)}</AdminTd>
                    <AdminTd>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                      >
                        Manage
                      </Link>
                    </AdminTd>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </div>
        )}
      </section>

      <section className={panelClass} aria-labelledby="customer-notes">
        <h3 id="customer-notes" className="heading-editorial heading-champagne text-xl">
          Internal notes
        </h3>
        {customer.noteList.length === 0 ? (
          <p className="mt-3 text-sm text-champagne/70">No internal notes.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {customer.noteList.map((note) => (
              <li
                key={note.id}
                className="rounded-brand border border-gold/20 p-3 text-sm"
              >
                <p className="text-champagne">{note.body}</p>
                <p className="mt-2 text-xs text-champagne/60">
                  {note.author} · {formatDate(note.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}

        {canManage ? (
          <form action={addCustomerNoteAction} className="mt-5 space-y-3">
            <input type="hidden" name="id" value={customer.id} />
            <div>
              <label htmlFor="body" className={labelClass}>
                Add a private note
              </label>
              <textarea
                id="body"
                name="body"
                rows={3}
                required
                minLength={3}
                maxLength={2000}
                className={inputClass}
              />
            </div>
            <SubmitButton variant="secondary">Add note</SubmitButton>
          </form>
        ) : null}
      </section>

      <section aria-labelledby="customer-addresses">
        <h3 id="customer-addresses" className="heading-editorial heading-champagne text-xl">
          Saved addresses
        </h3>
        {customer.addresses.length === 0 ? (
          <p className="mt-3 text-sm text-champagne/70">
            No saved delivery addresses.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {customer.addresses.map((address) => (
              <li key={address.id} className={panelClass}>
                <p className="text-sm text-champagne">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                </p>
                <p className="mt-1 text-sm text-champagne/70">
                  {address.city}, {address.countryCode}
                  {address.postalCode ? ` ${address.postalCode}` : ""}
                </p>
                <p className="mt-2 text-xs text-champagne/50">
                  <StatusPill
                    status={
                      address.label ?? (address.isDefault ? "Default" : "Saved")
                    }
                  />
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
