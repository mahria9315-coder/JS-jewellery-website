"use client";

import { useActionState } from "react";

import {
  lookupOrderAction,
  requestReturnAction,
  submitPaymentAction,
  type OrderFormState,
} from "@/lib/actions/orders";
import { BUSINESS_EMAIL, BUSINESS_EMAIL_URL } from "@/lib/site";
import {
  FieldError,
  buttonPrimary,
  buttonSecondary,
  inputClass,
  labelClass,
  linkClass,
} from "@/components/ui/FormPrimitives";

const initialState: OrderFormState = { message: undefined };

function FormMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="rounded-card border border-red-400/40 bg-red-950/20 px-4 py-3 text-sm text-red-100"
    >
      {message}
    </p>
  );
}

export function PaymentSubmissionForm({
  orderNumber,
  accessToken,
  suggestedReference,
}: {
  orderNumber: string;
  accessToken: string;
  suggestedReference: string;
}) {
  const [state, formAction, isPending] = useActionState(
    submitPaymentAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name="accessToken" value={accessToken} />
      <FormMessage message={state.message} />

      <div>
        <label htmlFor="reference" className={labelClass}>
          Payment reference or transaction ID
        </label>
        <input
          id="reference"
          name="reference"
          required
          minLength={3}
          maxLength={120}
          placeholder={suggestedReference}
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-champagne/60">
          Use the reference {suggestedReference} in your transfer description if
          possible, then paste the bank or Easypaisa transaction ID here.
        </p>
      </div>

      <div>
        <label htmlFor="note" className={labelClass}>
          Note <span className="font-normal text-champagne/60">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          maxLength={500}
          className={inputClass}
        />
      </div>

      <button type="submit" className={buttonPrimary} disabled={isPending}>
        {isPending ? "Submitting…" : "Submit payment details"}
      </button>
      <p className="text-xs text-champagne/60">
        This only tells us to check the payment. It does not mark the order as
        paid.
      </p>
    </form>
  );
}

export function ReturnRequestForm({
  orderNumber,
  accessToken,
  reasons,
}: {
  orderNumber: string;
  accessToken: string;
  reasons: { value: string; label: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    requestReturnAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name="accessToken" value={accessToken} />
      <FormMessage message={state.message} />

      <div>
        <label htmlFor="reason" className={labelClass}>
          Reason
        </label>
        <select id="reason" name="reason" required className={inputClass}>
          {reasons.map((reason) => (
            <option key={reason.value} value={reason.value}>
              {reason.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="explanation" className={labelClass}>
          What happened?
        </label>
        <textarea
          id="explanation"
          name="explanation"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className={inputClass}
        />
        <FieldError id="explanation-error" />
      </div>

      <button type="submit" className={buttonSecondary} disabled={isPending}>
        {isPending ? "Submitting…" : "Submit return request"}
      </button>
      <p className="text-xs text-champagne/60">
        The refund amount is calculated by our team under the approved policy.
        Protected issues are never reduced by the change-of-mind deduction.
      </p>
    </form>
  );
}

export function OrderLookupForm() {
  const [state, formAction, isPending] = useActionState(
    lookupOrderAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <FormMessage message={state.message} />

      <div>
        <label htmlFor="orderNumber" className={labelClass}>
          Order number
        </label>
        <input
          id="orderNumber"
          name="orderNumber"
          required
          placeholder="JS-20261108-XXXXXX"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="lookupEmail" className={labelClass}>
          Email used at checkout
        </label>
        <input
          id="lookupEmail"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <button type="submit" className={buttonPrimary} disabled={isPending}>
        {isPending ? "Looking up…" : "Find my order"}
      </button>

      <p className="text-sm text-champagne/70">
        We only show an order when both the order number and email match. If you
        cannot find it, email{" "}
        <a href={BUSINESS_EMAIL_URL} className={linkClass}>
          {BUSINESS_EMAIL}
        </a>
        .
      </p>
    </form>
  );
}
