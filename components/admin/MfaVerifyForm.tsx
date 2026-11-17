"use client";

import { useActionState } from "react";

import {
  adminMfaVerifyAction,
  type AdminMfaVerifyState,
} from "@/lib/actions/admin";
import {
  buttonPrimary,
  inputClass,
  labelClass,
} from "@/components/ui/FormPrimitives";

const initialState: AdminMfaVerifyState = { message: undefined };

export function MfaVerifyForm() {
  const [state, formAction, isPending] = useActionState(
    adminMfaVerifyAction,
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
        <label htmlFor="mfa-code" className={labelClass}>
          Authenticator code or recovery code
        </label>
        <input
          id="mfa-code"
          name="code"
          type="text"
          inputMode="text"
          autoComplete="one-time-code"
          autoCapitalize="characters"
          spellCheck={false}
          required
          autoFocus
          className={inputClass}
        />
        <p className="mt-2 text-xs text-champagne/60">
          Enter the current six-digit code from your authenticator app, or one
          of the recovery codes you saved when you enrolled.
        </p>
      </div>

      <button type="submit" className={buttonPrimary} disabled={isPending}>
        {isPending ? "Verifying…" : "Verify and sign in"}
      </button>
    </form>
  );
}
