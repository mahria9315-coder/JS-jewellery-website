"use client";

import { useActionState } from "react";

import {
  adminChangePasswordAction,
  type AdminPasswordState,
} from "@/lib/actions/admin";
import {
  buttonPrimary,
  inputClass,
  labelClass,
} from "@/components/ui/FormPrimitives";

const initialState: AdminPasswordState = {};

export function AdminPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    adminChangePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-5">
      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={
            state.ok
              ? "rounded-card border border-emerald-400/40 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100"
              : "rounded-card border border-red-400/40 bg-red-950/20 px-4 py-3 text-sm text-red-100"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="currentPassword" className={labelClass}>
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="newPassword" className={labelClass}>
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-champagne/60">
          Use at least 12 characters. Other signed-in sessions are signed out
          after a password change.
        </p>
      </div>

      <button type="submit" className={buttonPrimary} disabled={isPending}>
        {isPending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}
