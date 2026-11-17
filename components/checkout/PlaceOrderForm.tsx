"use client";

import { useActionState } from "react";

import {
  placeOrderAction,
  type CheckoutFormState,
} from "@/lib/actions/checkout";
import {
  buttonPrimary,
  checkboxClass,
  labelClass,
} from "@/components/ui/FormPrimitives";
import Link from "next/link";

const initialState: CheckoutFormState = { errors: {} };

export function PlaceOrderForm() {
  const [state, formAction, isPending] = useActionState(
    placeOrderAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-5">
      {state.message ? (
        <p
          role="alert"
          className="rounded-card border border-red-400/40 bg-red-950/20 px-4 py-3 text-sm text-red-100"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex items-start gap-3">
        <input
          id="acceptedPolicy"
          name="acceptedPolicy"
          type="checkbox"
          value="true"
          required
          aria-describedby="acceptedPolicy-note"
          className={checkboxClass}
        />
        <div>
          <label htmlFor="acceptedPolicy" className={labelClass}>
            I have read the returns and refund policy.
          </label>
          <p id="acceptedPolicy-note" className="mt-1 text-sm text-champagne/70">
            The approved Pakistan terms include a 3-day change-of-mind window
            and a 25% deduction where the law permits it. Protected cases are
            handled separately.{" "}
            <Link
              href="/returns"
              className="font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
            >
              Read the returns policy
            </Link>
            .
          </p>
        </div>
      </div>

      <button type="submit" className={buttonPrimary} disabled={isPending}>
        {isPending ? "Placing order…" : "Place order"}
      </button>
      <p className="text-xs text-champagne/60">
        This creates an order with payment pending. It does not charge you and
        it does not mark the payment as received. Your delivery details are used
        only to process this order; see the{" "}
        <Link
          href="/privacy"
          className="font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
        >
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}
