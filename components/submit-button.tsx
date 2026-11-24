"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

const variants = {
  primary: "bg-brand-500 text-navy-950 hover:bg-brand-400 shadow-sm",
  navy: "bg-navy-900 text-white hover:bg-navy-800 shadow-sm",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  danger: "bg-white text-red-700 border border-red-200 hover:bg-red-50",
  outline: "bg-white text-navy-900 border border-slate-300 hover:border-navy-900",
};

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
  confirmMessage,
  name,
  value,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  /** Asks for confirmation before submitting (for irreversible actions). */
  confirmMessage?: string;
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
      aria-busy={pending || undefined}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-wait disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {pending ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}
