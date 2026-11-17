import type { Metadata } from "next";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { inputClass, labelClass, panelClass } from "@/components/ui/FormPrimitives";
import { updateBusinessSettingsAction } from "@/lib/actions/admin-content";
import {
  BUSINESS_SETTING_KEYS,
  getBusinessSettings,
} from "@/lib/admin/settings";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Business settings",
  description: "Private business settings.",
  path: "/admin/settings/business",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const GROUPS = [
  {
    title: "Store",
    prefix: "store.",
    description:
      "Public contact details only. Never enter bank, wallet, IBAN, or password information in these fields.",
  },
  {
    title: "Returns",
    prefix: "returns.",
    description:
      "The approved return window is 3 days. Protected cases never receive the change-of-mind deduction.",
  },
] as const;

export default async function BusinessSettingsPage({ searchParams }: PageProps) {
  await requireAdminPage("settings.manage");
  const params = await searchParams;

  let settings: Awaited<ReturnType<typeof getBusinessSettings>> | null = null;
  let unavailable = false;

  try {
    settings = await getBusinessSettings();
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Administration"
        title="Business settings"
        description="These values appear in storefront contact information and policy text. Payment account credentials are never stored here."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Settings" },
          { label: "Business" },
        ]}
      />

      <AdminQueryNotice params={params} />

      {unavailable || !settings ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Settings could not be loaded because the database is unavailable.
          </p>
        </div>
      ) : (
        <form action={updateBusinessSettingsAction} className="space-y-6">
          {GROUPS.map((group) => (
            <section key={group.prefix} className={panelClass} aria-labelledby={`group-${group.prefix}`}>
              <h3
                id={`group-${group.prefix}`}
                className="heading-editorial heading-champagne text-xl"
              >
                {group.title}
              </h3>
              <p className="mt-2 text-sm text-champagne/70">{group.description}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {Object.entries(BUSINESS_SETTING_KEYS)
                  .filter(([key]) => key.startsWith(group.prefix))
                  .map(([key, definition]) => (
                    <div key={key}>
                      <label htmlFor={key} className={labelClass}>
                        {definition.label}
                      </label>
                      <input
                        id={key}
                        name={`setting:${key}`}
                        defaultValue={settings[key as keyof typeof settings] ?? ""}
                        maxLength={definition.max}
                        className={inputClass}
                      />
                      <p className="mt-1 font-mono text-xs text-champagne/40">
                        {key}
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          ))}
          <SubmitButton>Save business settings</SubmitButton>
        </form>
      )}
    </div>
  );
}
