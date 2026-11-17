"use client";

import { useActionState } from "react";

import {
  saveCheckoutDraftAction,
  type CheckoutFormState,
} from "@/lib/actions/checkout";
import {
  FieldError,
  buttonPrimary,
  inputClass,
  labelClass,
} from "@/components/ui/FormPrimitives";

export type CheckoutMethodOption = {
  id: "bank-transfer" | "easypaisa";
  label: string;
};

export type CheckoutCountryOption = {
  code: string;
  name: string;
};

const initialState: CheckoutFormState = { errors: {} };

export function CheckoutForm({
  methods,
  countries,
  idempotencyKey,
}: {
  methods: CheckoutMethodOption[];
  countries: CheckoutCountryOption[];
  idempotencyKey: string;
}) {
  const [state, formAction, isPending] = useActionState(
    saveCheckoutDraftAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      {state.message ? (
        <p
          role="alert"
          className="rounded-card border border-red-400/40 bg-red-950/20 px-4 py-3 text-sm text-red-100"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className={labelClass}>
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            required
            aria-invalid={Boolean(state.errors.fullName)}
            aria-describedby={
              state.errors.fullName ? "fullName-error" : undefined
            }
            className={inputClass}
          />
          <FieldError id="fullName-error">{state.errors.fullName}</FieldError>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.errors.email)}
            aria-describedby={state.errors.email ? "email-error" : undefined}
            className={inputClass}
          />
          <FieldError id="email-error">{state.errors.email}</FieldError>
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Mobile number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            placeholder="+92 3xx xxxxxxx"
            aria-invalid={Boolean(state.errors.phone)}
            aria-describedby={state.errors.phone ? "phone-error" : undefined}
            className={inputClass}
          />
          <FieldError id="phone-error">{state.errors.phone}</FieldError>
        </div>

        <div>
          <label htmlFor="countryCode" className={labelClass}>
            Delivery country
          </label>
          <select
            id="countryCode"
            name="countryCode"
            defaultValue={
              countries.some((country) => country.code === "PK")
                ? "PK"
                : (countries[0]?.code ?? "PK")
            }
            aria-invalid={Boolean(state.errors.countryCode)}
            aria-describedby={
              state.errors.countryCode ? "countryCode-error" : undefined
            }
            className={inputClass}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-champagne/60">
            {countries.length > 1
              ? "Delivery countries reflect our currently approved courier destinations. Any shipping charge is confirmed when the order is placed."
              : "Delivery is currently only configured for Pakistan."}
          </p>
          <FieldError id="countryCode-error">
            {state.errors.countryCode}
          </FieldError>
        </div>

        <div>
          <label htmlFor="city" className={labelClass}>
            City
          </label>
          <input
            id="city"
            name="city"
            autoComplete="address-level2"
            required
            aria-invalid={Boolean(state.errors.city)}
            aria-describedby={state.errors.city ? "city-error" : undefined}
            className={inputClass}
          />
          <FieldError id="city-error">{state.errors.city}</FieldError>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="addressLine1" className={labelClass}>
            Delivery address
          </label>
          <input
            id="addressLine1"
            name="addressLine1"
            autoComplete="address-line1"
            required
            aria-invalid={Boolean(state.errors.addressLine1)}
            aria-describedby={
              state.errors.addressLine1 ? "addressLine1-error" : undefined
            }
            className={inputClass}
          />
          <FieldError id="addressLine1-error">
            {state.errors.addressLine1}
          </FieldError>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="addressLine2" className={labelClass}>
            Address line 2 <span className="font-normal text-champagne/60">(optional)</span>
          </label>
          <input
            id="addressLine2"
            name="addressLine2"
            autoComplete="address-line2"
            aria-invalid={Boolean(state.errors.addressLine2)}
            aria-describedby={
              state.errors.addressLine2 ? "addressLine2-error" : undefined
            }
            className={inputClass}
          />
          <FieldError id="addressLine2-error">
            {state.errors.addressLine2}
          </FieldError>
        </div>

        <div>
          <label htmlFor="postalCode" className={labelClass}>
            Postal code <span className="font-normal text-champagne/60">(optional)</span>
          </label>
          <input
            id="postalCode"
            name="postalCode"
            autoComplete="postal-code"
            aria-invalid={Boolean(state.errors.postalCode)}
            aria-describedby={
              state.errors.postalCode ? "postalCode-error" : undefined
            }
            className={inputClass}
          />
          <FieldError id="postalCode-error">{state.errors.postalCode}</FieldError>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="customerNotes" className={labelClass}>
            Order notes <span className="font-normal text-champagne/60">(optional)</span>
          </label>
          <textarea
            id="customerNotes"
            name="customerNotes"
            rows={3}
            aria-invalid={Boolean(state.errors.customerNotes)}
            aria-describedby={
              state.errors.customerNotes ? "customerNotes-error" : undefined
            }
            className={inputClass}
          />
          <FieldError id="customerNotes-error">
            {state.errors.customerNotes}
          </FieldError>
        </div>
      </div>

      <fieldset className="border-t border-gold/20 pt-6">
        <legend className="font-nav text-sm font-semibold uppercase tracking-[0.18em] text-champagne">
          Payment method
        </legend>
        <p className="mt-2 text-sm text-champagne/70">
          Payment instructions are shown after you place the order. No money is
          taken automatically and every payment is verified manually.
        </p>

        <div className="mt-4 space-y-3">
          {methods.map((method) => (
            <label
              key={method.id}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-brand border border-gold/25 bg-champagne/[0.02] px-4 py-3 text-sm text-champagne"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                required
                className="h-4 w-4 border-gold/40 bg-charcoal text-gold focus-visible:outline-focus"
              />
              <span className="font-semibold text-white">{method.label}</span>
            </label>
          ))}
        </div>
        <FieldError id="paymentMethod-error">
          {state.errors.paymentMethod}
        </FieldError>
      </fieldset>

      <button type="submit" className={buttonPrimary} disabled={isPending}>
        {isPending ? "Checking details…" : "Continue to review"}
      </button>
    </form>
  );
}
