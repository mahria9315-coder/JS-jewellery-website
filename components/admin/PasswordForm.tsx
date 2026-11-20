"use client";

import { useActionState } from "react";

import {
  adminChangePasswordAction,
  type AdminPasswordState,
} from "@/lib/actions/admin";
import {
  buttonPrimary,
  labelClass,
} from "@/components/ui/FormPrimitives";

import { PasswordInput } from "./PasswordInput";

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
              ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="currentPassword" className={labelClass}>
          Current password
        </label>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          autoComplete="current-password"
          required
        />
      </div>

      <div>
        <label htmlFor="newPassword" className={labelClass}>
          New password
        </label>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          autoComplete="new-password"
          required
          minLength={12}
          describedBy="new-password-help"
        />
        <p id="new-password-help" className="mt-1 text-xs text-slate-500">
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
