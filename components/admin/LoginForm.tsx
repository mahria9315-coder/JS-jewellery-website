"use client";

import { useActionState } from "react";

import {
  adminLoginAction,
  type AdminLoginState,
} from "@/lib/actions/admin";
import {
  buttonPrimary,
  inputClass,
  labelClass,
} from "@/components/ui/FormPrimitives";

const initialState: AdminLoginState = { message: undefined };

export function AdminLoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(
    adminLoginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <input type="hidden" name="next" value={next} />

      {state.message ? (
        <p
          role="alert"
          className="rounded-card border border-red-400/40 bg-red-950/20 px-4 py-3 text-sm text-red-100"
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="email" className={labelClass}>
          Administrator email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
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
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <button type="submit" className={buttonPrimary} disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
