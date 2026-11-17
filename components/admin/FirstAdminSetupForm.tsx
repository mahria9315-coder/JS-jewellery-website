"use client";

import { useActionState } from "react";

import {
  adminFirstTimeSetupAction,
  type AdminSetupState,
} from "@/lib/actions/admin";
import {
  buttonPrimary,
  inputClass,
  labelClass,
} from "@/components/ui/FormPrimitives";

const initialState: AdminSetupState = { message: undefined };

export function FirstAdminSetupForm() {
  const [state, formAction, isPending] = useActionState(
    adminFirstTimeSetupAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-5" noValidate>
      {state.message ? (
        <p
          role="alert"
          className="rounded-card border border-red-400/40 bg-red-950/20 px-4 py-3 text-sm text-red-100"
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className={labelClass}>
          Administrator name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={120}
          className={inputClass}
          placeholder="Super Admin"
        />
        <p className="mt-1 text-xs text-champagne/60">
          Optional. This name appears in the administration area.
        </p>
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
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-champagne/60">
          Use at least 12 characters, including at least one letter and one number.
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="setupSecret" className={labelClass}>
          One-time setup secret
        </label>
        <input
          id="setupSecret"
          name="setupSecret"
          type="password"
          autoComplete="off"
          required
          spellCheck={false}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-champagne/60">
          Enter the server-configured setup secret provided by the website owner.
          It is validated on the server and never stored in the browser.
        </p>
      </div>

      <button type="submit" className={buttonPrimary} disabled={isPending}>
        {isPending ? "Creating administrator account…" : "Create first administrator"}
      </button>
    </form>
  );
}
