"use client";

import { useActionState } from "react";

import {
  adminConfirmMfaEnrollmentAction,
  type AdminMfaState,
} from "@/lib/actions/admin";
import {
  buttonPrimary,
  inputClass,
  labelClass,
} from "@/components/ui/FormPrimitives";

const initialState: AdminMfaState = { message: undefined };

export function MfaEnrollmentConfirmForm() {
  const [state, formAction, isPending] = useActionState(
    adminConfirmMfaEnrollmentAction,
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

      <div>
        <label htmlFor="mfa-confirm-code" className={labelClass}>
          Six-digit code from your authenticator app
        </label>
        <input
          id="mfa-confirm-code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          className={inputClass}
        />
      </div>

      <button type="submit" className={buttonPrimary} disabled={isPending}>
        {isPending ? "Confirming…" : "Confirm and generate recovery codes"}
      </button>
    </form>
  );
}
