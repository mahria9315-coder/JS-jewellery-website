import type { Metadata } from "next";

import { AdminQueryNotice, firstParam } from "@/components/admin/AdminQueryNotice";
import { CourierSettingsSection } from "@/components/admin/CourierSettingsSection";
import { AdminPageHeader, StatusPill, formatDate } from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  createCourierAction,
  updateShippingSettingAction,
  updateShippingZoneAction,
} from "@/lib/actions/admin-content";
import {
  getCourierSettingsForAdmin,
  getShippingSettings,
} from "@/lib/admin/settings";
import { requireAdminPage } from "@/lib/admin/session";
import { COURIER_SCOPE_LABELS } from "@/lib/couriers/config";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Shipping settings",
  description: "Private delivery settings.",
  path: "/admin/settings/shipping",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShippingSettingsPage({ searchParams }: PageProps) {
  await requireAdminPage("shipping.view");
  const params = await searchParams;

  let data: Awaited<ReturnType<typeof getShippingSettings>> | null = null;
  let courierRows: Awaited<ReturnType<typeof getCourierSettingsForAdmin>> = [];
  let unavailable = false;

  try {
    data = await getShippingSettings();
    courierRows = await getCourierSettingsForAdmin();
  } catch {
    unavailable = true;
  }

  const zone = data?.zones.find((item) => item.countryCode === "PK");

  const highlightCourier = firstParam(params, "courier");
  const couriers = courierRows;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Administration"
        title="Shipping and delivery"
        description="The approved estimate is 4–7 days within Pakistan. Pakistan delivery continues without a courier until one you add is fully approved. International delivery is offered only through fully approved courier destinations. No courier is approved for jewellery yet, and nothing is offered at checkout until every approval gate passes."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Settings" },
          { label: "Shipping" },
        ]}
      />

      <AdminQueryNotice params={params} />

      {unavailable || !data ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Shipping settings could not be loaded because the database is
            unavailable.
          </p>
        </div>
      ) : (
        <>
          <section className={panelClass} aria-labelledby="delivery-estimate">
            <h3 id="delivery-estimate" className="heading-editorial heading-champagne text-xl">
              Delivery estimate
            </h3>
            <form action={updateShippingSettingAction} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="estimateMinDays" className={labelClass}>
                  Minimum days
                </label>
                <input
                  id="estimateMinDays"
                  name="estimateMinDays"
                  type="number"
                  min={1}
                  max={30}
                  required
                  defaultValue={data.setting?.estimateMinDays ?? 4}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="estimateMaxDays" className={labelClass}>
                  Maximum days
                </label>
                <input
                  id="estimateMaxDays"
                  name="estimateMaxDays"
                  type="number"
                  min={1}
                  max={30}
                  required
                  defaultValue={data.setting?.estimateMaxDays ?? 7}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="deliveryNote" className={labelClass}>
                  Public delivery note
                </label>
                <textarea
                  id="deliveryNote"
                  name="deliveryNote"
                  rows={3}
                  required
                  minLength={5}
                  maxLength={500}
                  defaultValue={
                    data.setting?.deliveryNote ??
                    "Delivery timing is an estimate, not a guarantee. Orders are delivered within Pakistan only."
                  }
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <SubmitButton>Save delivery estimate</SubmitButton>
              </div>
            </form>
          </section>

          <section className={panelClass} aria-labelledby="pakistan-zone">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 id="pakistan-zone" className="heading-editorial heading-champagne text-xl">
                Pakistan delivery zone
              </h3>
              <StatusPill
                status={zone?.isActive ? "Active" : "Inactive"}
                tone={zone?.isActive ? "success" : "warning"}
              />
            </div>
            <p className="mt-2 text-sm text-champagne/70">
              Only Pakistan is approved. The checkbox can pause the zone, but no
              other country can be added here.
            </p>
            <form action={updateShippingZoneAction} className="mt-4 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="countryCode" value="PK" />
              <div>
                <label htmlFor="charge" className={labelClass}>
                  Delivery charge (PKR)
                </label>
                <input
                  id="charge"
                  name="charge"
                  required
                  defaultValue={((zone?.chargeMinor ?? 0) / 100).toFixed(2)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="zoneMin" className={labelClass}>
                  Minimum days
                </label>
                <input
                  id="zoneMin"
                  name="estimateMinDays"
                  type="number"
                  min={1}
                  max={30}
                  required
                  defaultValue={zone?.estimateMinDays ?? 4}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="zoneMax" className={labelClass}>
                  Maximum days
                </label>
                <input
                  id="zoneMax"
                  name="estimateMaxDays"
                  type="number"
                  min={1}
                  max={30}
                  required
                  defaultValue={zone?.estimateMaxDays ?? 7}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="zoneNotes" className={labelClass}>
                  Internal note (optional)
                </label>
                <input
                  id="zoneNotes"
                  name="notes"
                  maxLength={500}
                  defaultValue={zone?.notes ?? ""}
                  className={inputClass}
                />
              </div>
              <label className="flex items-start gap-2 text-sm text-champagne sm:col-span-2">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={zone?.isActive ?? true}
                  className={checkboxClass}
                />
                Accept orders for this zone
              </label>
              <div className="sm:col-span-2">
                <SubmitButton>Save zone</SubmitButton>
              </div>
            </form>
            <p className="mt-3 text-xs text-champagne/50">
              Last updated: {formatDate(zone?.updatedAt ?? data.setting?.updatedAt)}
            </p>
          </section>

          <section className={panelClass} aria-labelledby="courier-integrations">
            <h3
              id="courier-integrations"
              className="heading-editorial heading-champagne text-xl"
            >
              Courier companies
            </h3>
            <p className="mt-2 text-sm text-champagne/70">
              No courier company is predefined. Add the courier companies you
              use, with optional contact details and a tracking URL template.
              Adding a courier is configuration, never approval: each courier
              must have a verified account, recorded jewellery acceptance, and
              verified destinations with approved charges before it is used
              for a single order. Jewellery acceptance requires the courier
              company&apos;s own written confirmation.
            </p>
            <form action={createCourierAction} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="newCourierName" className={labelClass}>
                  Courier company name
                </label>
                <input
                  id="newCourierName"
                  name="displayName"
                  required
                  minLength={2}
                  maxLength={80}
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-champagne/50">
                  Use the company&apos;s real name. Adding it does not approve
                  or activate anything.
                </p>
              </div>
              <div>
                <label htmlFor="newCourierScope" className={labelClass}>
                  Delivery scope
                </label>
                <select
                  id="newCourierScope"
                  name="scope"
                  defaultValue="DOMESTIC_PK"
                  className={inputClass}
                >
                  {(Object.keys(COURIER_SCOPE_LABELS) as Array<
                    keyof typeof COURIER_SCOPE_LABELS
                  >).map((scope) => (
                    <option key={scope} value={scope}>
                      {COURIER_SCOPE_LABELS[scope]}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-champagne/50">
                  Domestic couriers deliver within Pakistan only; international
                  couriers deliver outside Pakistan only.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="newCourierContact" className={labelClass}>
                  Contact details (optional)
                </label>
                <input
                  id="newCourierContact"
                  name="contactDetails"
                  maxLength={500}
                  placeholder="Phone, email, or branch address"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <SubmitButton>Add courier</SubmitButton>
              </div>
            </form>
            <div className="mt-6 space-y-4">
              {couriers.length === 0 ? (
                <p className="text-sm text-champagne/70">
                  No courier companies have been added yet. Pakistan delivery
                  continues without a named courier and no shipping charge is
                  applied until a courier is fully approved.
                </p>
              ) : (
                couriers.map((courier) => (
                  <CourierSettingsSection
                    key={courier.code}
                    courier={courier}
                    defaultOpen={
                      highlightCourier === courier.code ||
                      courier.status !== "NOT_CONFIGURED" ||
                      courier.destinations.length > 0
                    }
                  />
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
