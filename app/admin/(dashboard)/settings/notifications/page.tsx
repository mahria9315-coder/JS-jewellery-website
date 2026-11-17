import type { Metadata } from "next";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  Notice,
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { updateNotificationSettingsAction } from "@/lib/actions/admin-content";
import { getBusinessSettings } from "@/lib/admin/settings";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Notification settings",
  description: "Private administrator notification preferences.",
  path: "/admin/settings/notifications",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const FLAGS = [
  {
    key: "newOrder",
    label: "New order placed",
    description: "Notify when a customer completes checkout.",
  },
  {
    key: "paymentSubmitted",
    label: "Payment submitted",
    description: "Notify when a customer submits a payment reference.",
  },
  {
    key: "returnRequested",
    label: "Return requested",
    description: "Notify when a customer submits a return request.",
  },
  {
    key: "lowStock",
    label: "Low stock",
    description: "Notify when a product reaches its low-stock threshold.",
  },
] as const;

export default async function NotificationSettingsPage({
  searchParams,
}: PageProps) {
  await requireAdminPage("settings.manage");
  const params = await searchParams;

  let settings: Awaited<ReturnType<typeof getBusinessSettings>> | null = null;

  try {
    settings = await getBusinessSettings();
  } catch {
    settings = null;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Administration"
        title="Notification settings"
        description="Choose which administration events should trigger an email. These are stored preferences only: no email provider is configured, so no messages are sent yet."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Settings" },
          { label: "Notifications" },
        ]}
      />

      <AdminQueryNotice params={params} />

      <Notice tone="warning">
        Saving these preferences does not send email. An approved transactional
        email provider and sender identity must be configured before any
        notification can be delivered.
      </Notice>

      {settings ? (
        <form action={updateNotificationSettingsAction} className="space-y-6">
          <section className={panelClass} aria-labelledby="notification-recipient">
            <h3
              id="notification-recipient"
              className="heading-editorial heading-champagne text-xl"
            >
              Recipient
            </h3>
            <p className="mt-2 text-sm text-champagne/70">
              The private administrator address that should receive operational
              notifications. This is not shown to customers.
            </p>
            <div className="mt-4 max-w-md">
              <label htmlFor="recipientEmail" className={labelClass}>
                Notification email
              </label>
              <input
                id="recipientEmail"
                name="recipientEmail"
                type="email"
                maxLength={254}
                defaultValue={settings["notifications.recipientEmail"]}
                className={inputClass}
              />
            </div>
          </section>

          <section className={panelClass} aria-labelledby="notification-events">
            <h3
              id="notification-events"
              className="heading-editorial heading-champagne text-xl"
            >
              Events
            </h3>
            <div className="mt-4 space-y-3">
              {FLAGS.map((flag) => (
                <label
                  key={flag.key}
                  className="flex min-h-11 items-start gap-3 text-sm text-champagne"
                >
                  <input
                    type="checkbox"
                    name={flag.key}
                    defaultChecked={
                      settings[
                        `notifications.${flag.key}` as keyof typeof settings
                      ] === "true"
                    }
                    className={checkboxClass}
                  />
                  <span>
                    <span className="block font-semibold text-white">
                      {flag.label}
                    </span>
                    <span className="block text-champagne/60">
                      {flag.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <SubmitButton>Save notification preferences</SubmitButton>
        </form>
      ) : (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Notification settings could not be loaded because the database is
            unavailable.
          </p>
        </div>
      )}
    </div>
  );
}
