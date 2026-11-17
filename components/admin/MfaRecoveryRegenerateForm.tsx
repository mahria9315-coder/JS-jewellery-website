"use client";

import { useActionState } from "react";

import {
  adminRegenerateRecoveryCodesAction,
  type AdminMfaState,
} from "@/lib/actions/admin";
import {
  buttonSecondary,
  inputClass,
  labelClass,
} from "@/components/ui/FormPrimitives";

const initialState: AdminMfaState = { message: undefined };

export function MfaRecoveryRegenerateForm() {
  const [state, formAction, isPending] = useActionState(
    adminRegenerateRecoveryCodesAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-5 space-y-4">
      {state.message ? (
        <p
          role="alert"
          className="rounded-card border border-red-400/40 bg-red-950/20 px-4 py-3 text-sm text-red-100"
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="mfa-regenerate-code" className={labelClass}>
          Confirm with a current authenticator code
        </label>
        <input
          id="mfa-regenerate-code"
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

      <button type="submit" className={buttonSecondary} disabled={isPending}>
        {isPending ? "Replacing codes…" : "Replace recovery codes"}
      </button>
    </form>
  );
}
