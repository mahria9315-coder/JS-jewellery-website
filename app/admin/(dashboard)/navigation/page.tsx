import type { Metadata } from "next";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
  StatusPill,
} from "@/components/admin/AdminUI";
import { ConfirmSubmitButton, SubmitButton } from "@/components/admin/SubmitButton";
import {
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  deleteNavigationItemAction,
  saveNavigationItemAction,
} from "@/lib/actions/admin-content";
import {
  NAVIGATION_LOCATIONS,
  listNavigationItems,
} from "@/lib/admin/content";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Navigation",
  description: "Private storefront navigation management.",
  path: "/admin/navigation",
  noIndex: true,
});

const LOCATION_LABELS: Record<string, string> = {
  primary: "Header (primary)",
  "footer-shop": "Footer — Shop",
  "footer-policy": "Footer — Help and policies",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NavigationPage({ searchParams }: PageProps) {
  const context = await requireAdminPage("navigation.manage");
  const params = await searchParams;
  const canManage = context.user.role.permissions.includes("navigation.manage");
  void canManage;

  let items: Awaited<ReturnType<typeof listNavigationItems>> = [];
  let unavailable = false;

  try {
    items = await listNavigationItems();
  } catch {
    unavailable = true;
  }

  const grouped = NAVIGATION_LOCATIONS.map((location) => ({
    location,
    label: LOCATION_LABELS[location],
    items: items.filter((item) => item.location === location),
  }));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Website"
        title="Navigation"
        description="Visible links replace the approved defaults on the storefront. Hidden links stay out of the public chrome."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Website" },
          { label: "Navigation" },
        ]}
      />

      <AdminQueryNotice params={params} />

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Navigation could not be loaded because the database is unavailable.
          </p>
        </div>
      ) : (
        grouped.map((group) => (
          <section key={group.location} aria-labelledby={`nav-${group.location}`}>
            <h3
              id={`nav-${group.location}`}
              className="heading-editorial heading-champagne text-xl"
            >
              {group.label}
            </h3>
            {group.items.length === 0 ? (
              <p className="mt-3 text-sm text-champagne/70">
                No links recorded for this location. The storefront falls back to
                the approved defaults.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {group.items.map((item) => (
                  <div key={item.id} className="space-y-3">
                    <form action={saveNavigationItemAction} className={panelClass}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="location" value={item.location} />
                      <div className="grid gap-4 sm:grid-cols-4">
                        <div>
                          <label htmlFor={`label-${item.id}`} className={labelClass}>
                            Label
                          </label>
                          <input
                            id={`label-${item.id}`}
                            name="label"
                            required
                            defaultValue={item.label}
                            className={inputClass}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor={`href-${item.id}`} className={labelClass}>
                            Destination
                          </label>
                          <input
                            id={`href-${item.id}`}
                            name="href"
                            required
                            defaultValue={item.href}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label htmlFor={`sort-${item.id}`} className={labelClass}>
                            Sort order
                          </label>
                          <input
                            id={`sort-${item.id}`}
                            name="sortOrder"
                            type="number"
                            min={0}
                            step={1}
                            defaultValue={item.sortOrder}
                            className={inputClass}
                          />
                        </div>
                        <label className="flex items-start gap-2 text-sm text-champagne">
                          <input
                            type="checkbox"
                            name="isVisible"
                            defaultChecked={item.isVisible}
                            className={checkboxClass}
                          />
                          Visible
                        </label>
                        <div className="sm:col-span-3">
                          <SubmitButton>Save link</SubmitButton>
                        </div>
                      </div>
                    </form>
                    <form action={deleteNavigationItemAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Remove the navigation link “${item.label}”?`}
                        variant="secondary"
                      >
                        Remove link
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))
      )}

      <section className={panelClass} aria-labelledby="new-nav-link">
        <h3 id="new-nav-link" className="heading-editorial heading-champagne text-xl">
          Add navigation link
        </h3>
        <form action={saveNavigationItemAction} className="mt-4 grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="location" className={labelClass}>
              Location
            </label>
            <select id="location" name="location" className={inputClass}>
              {NAVIGATION_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {LOCATION_LABELS[location]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="label" className={labelClass}>
              Label
            </label>
            <input id="label" name="label" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="href" className={labelClass}>
              Destination
            </label>
            <input id="href" name="href" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="sortOrder" className={labelClass}>
              Sort order
            </label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              step={1}
              defaultValue={100}
              className={inputClass}
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-champagne sm:col-span-3">
            <input
              type="checkbox"
              name="isVisible"
              defaultChecked
              className={checkboxClass}
            />
            Visible
          </label>
          <div className="sm:col-span-4">
            <SubmitButton>Add link</SubmitButton>
          </div>
        </form>
      </section>

      <section className={panelClass} aria-labelledby="nav-preview">
        <h3 id="nav-preview" className="heading-editorial heading-champagne text-xl">
          Current public order
        </h3>
        <AdminTable caption="Navigation link order" minWidth="32rem">
          <thead>
            <tr>
              <AdminTh>Location</AdminTh>
              <AdminTh>Label</AdminTh>
              <AdminTh>Destination</AdminTh>
              <AdminTh>State</AdminTh>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`summary-${item.id}`}>
                <AdminTd>{LOCATION_LABELS[item.location] ?? item.location}</AdminTd>
                <AdminTd>{item.label}</AdminTd>
                <AdminTd>
                  <span className="font-mono text-xs">{item.href}</span>
                </AdminTd>
                <AdminTd>
                  <StatusPill
                    status={item.isVisible ? "Visible" : "Hidden"}
                    tone={item.isVisible ? "success" : "neutral"}
                  />
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </section>
    </div>
  );
}
