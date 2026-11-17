"use client";

import { useFormStatus } from "react-dom";

import {
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
} from "@/components/ui/FormPrimitives";

type Variant = "primary" | "secondary" | "danger";

const variants: Record<Variant, string> = {
  primary: buttonPrimary,
  secondary: buttonSecondary,
  danger: buttonDanger,
};

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  className,
  name,
  value,
}: {
  children: string;
  pendingLabel?: string;
  variant?: Variant;
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={`${variants[variant]} ${className ?? ""}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function ConfirmSubmitButton({
  children,
  confirmMessage,
  pendingLabel = "Working…",
  variant = "danger",
  className,
}: {
  children: string;
  confirmMessage: string;
  pendingLabel?: string;
  variant?: Variant;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${variants[variant]} ${className ?? ""}`}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
