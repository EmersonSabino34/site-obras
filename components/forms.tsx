import type { ReactNode } from "react";

import { PasswordInput } from "./password-input";

/** Input styles without margin (for inputs inside wrappers). */
export const inputBase =
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-navy-900 shadow-xs transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/15 disabled:bg-slate-100";

export const inputClass = `mt-1.5 ${inputBase}`;

const DEFAULT_PASSWORD_LABELS = { show: "Mostrar palavra-passe", hide: "Ocultar palavra-passe" };

type BaseProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Text shown after the label for optional fields, e.g. "opcional". */
  optionalLabel?: string;
  className?: string;
};

function Label({ htmlFor, label, required, optionalLabel }: { htmlFor: string } & Pick<BaseProps, "label" | "required" | "optionalLabel">) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-navy-900">
      {label}
      {required ? (
        <span className="text-brand-700" aria-hidden="true">
          {" "}*
        </span>
      ) : optionalLabel ? (
        <span className="font-normal text-slate-500"> ({optionalLabel})</span>
      ) : null}
    </label>
  );
}

function Help({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={id} className="mt-1.5 text-sm font-medium text-red-600">
        {error}
      </p>
    );
  }
  return hint ? (
    <p id={id} className="mt-1.5 text-sm text-slate-500">
      {hint}
    </p>
  ) : null;
}

export function TextField({
  label,
  name,
  error,
  hint,
  required,
  optionalLabel,
  className = "",
  type = "text",
  defaultValue,
  autoComplete,
  placeholder,
  inputMode,
  min,
  max,
  passwordLabels = DEFAULT_PASSWORD_LABELS,
}: BaseProps & {
  type?: string;
  defaultValue?: string | null;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal";
  min?: string;
  max?: string;
  /** Accessible labels for the show/hide button of password fields. */
  passwordLabels?: { show: string; hide: string };
}) {
  const id = `field-${name}`;
  const describedBy = error || hint ? `${id}-help` : undefined;

  if (type === "password") {
    return (
      <div className={className}>
        <Label htmlFor={id} label={label} required={required} optionalLabel={optionalLabel} />
        <PasswordInput
          id={id}
          name={name}
          required={required}
          autoComplete={autoComplete}
          invalid={Boolean(error)}
          describedBy={describedBy}
          className={inputBase}
          labels={passwordLabels}
        />
        <Help id={`${id}-help`} error={error} hint={hint} />
      </div>
    );
  }

  const noAutoCorrect = type === "email";
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} required={required} optionalLabel={optionalLabel} />
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? undefined}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        min={min}
        max={max}
        autoCapitalize={noAutoCorrect ? "none" : undefined}
        autoCorrect={noAutoCorrect ? "off" : undefined}
        spellCheck={noAutoCorrect ? false : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClass}
      />
      <Help id={`${id}-help`} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  error,
  hint,
  required,
  optionalLabel,
  className = "",
  defaultValue,
  placeholder,
  options,
}: BaseProps & {
  defaultValue?: string | null;
  placeholder?: string;
  options: { value: string; label: string }[];
}) {
  const id = `field-${name}`;
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} required={required} optionalLabel={optionalLabel} />
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-help` : undefined}
        className={inputClass}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Help id={`${id}-help`} error={error} hint={hint} />
    </div>
  );
}

export function TextareaField({
  label,
  name,
  error,
  hint,
  required,
  optionalLabel,
  className = "",
  defaultValue,
  placeholder,
  rows = 5,
}: BaseProps & { defaultValue?: string | null; placeholder?: string; rows?: number }) {
  const id = `field-${name}`;
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} required={required} optionalLabel={optionalLabel} />
      <textarea
        id={id}
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-help` : undefined}
        className={`${inputClass} resize-y`}
      />
      <Help id={`${id}-help`} error={error} hint={hint} />
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {children}
    </p>
  );
}
