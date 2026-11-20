"use client";

import { useState } from "react";

/** Password input with an accessible show/hide control for admin forms. */
export function PasswordInput({
  id,
  name,
  autoComplete,
  required,
  minLength,
  autoFocus,
  placeholder,
  describedBy,
}: {
  id: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  autoFocus?: boolean;
  placeholder?: string;
  describedBy?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mt-1.5">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-describedby={describedBy}
        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-16 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-emerald-500 focus:outline-none focus-visible:outline-focus"
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={id}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-focus"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
