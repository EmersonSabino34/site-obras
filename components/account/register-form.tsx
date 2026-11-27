"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerAction } from "@/lib/actions/account";

import { FormMessage, SelectField, TextField } from "../forms";
import { SubmitButton } from "../submit-button";

type Labels = {
  name: string;
  email: string;
  phone: string;
  clientType: string;
  company: string;
  nif: string;
  city: string;
  address: string;
  password: string;
  passwordConfirm: string;
  passwordHint: string;
  consentBefore: string;
  submit: string;
  optional: string;
};

export function RegisterForm({
  lang,
  labels,
  clientTypes,
  selectLabel,
  privacyLabel,
  passwordLabels,
}: {
  lang: string;
  passwordLabels?: { show: string; hide: string };
  labels: Labels;
  clientTypes: string[];
  selectLabel: string;
  privacyLabel: string;
}) {
  const [state, action] = useActionState(registerAction, undefined);
  const v = state?.values ?? {};
  const e = state?.errors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {state?.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField className="sm:col-span-2" label={labels.name} name="name" autoComplete="name" required defaultValue={v.name} error={e.name} />
        <TextField label={labels.email} name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={v.email} error={e.email} />
        <TextField label={labels.phone} name="phone" type="tel" inputMode="tel" autoComplete="tel" required defaultValue={v.phone} error={e.phone} />
        <SelectField
          label={labels.clientType}
          name="client_type"
          optionalLabel={labels.optional}
          placeholder={selectLabel}
          options={clientTypes.map((type) => ({ value: type, label: type }))}
          defaultValue={v.client_type}
          error={e.client_type}
        />
        <TextField label={labels.company} name="company" autoComplete="organization" optionalLabel={labels.optional} defaultValue={v.company} error={e.company} />
        <TextField label={labels.nif} name="nif" optionalLabel={labels.optional} defaultValue={v.nif} error={e.nif} />
        <TextField label={labels.city} name="city" autoComplete="address-level2" optionalLabel={labels.optional} defaultValue={v.city} error={e.city} />
        <TextField className="sm:col-span-2" label={labels.address} name="address" autoComplete="street-address" optionalLabel={labels.optional} defaultValue={v.address} error={e.address} />
        <TextField label={labels.password} name="password" type="password" autoComplete="new-password" required hint={labels.passwordHint} passwordLabels={passwordLabels} error={e.password} />
        <TextField label={labels.passwordConfirm} name="password_confirm" type="password" autoComplete="new-password" required passwordLabels={passwordLabels} error={e.password_confirm} />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            name="consent"
            required
            defaultChecked={v.consent === "on"}
            aria-invalid={e.consent ? true : undefined}
            className="mt-0.5 size-4 rounded border-slate-300 dark:border-white/15 accent-brand-500"
          />
          <span>
            {labels.consentBefore}{" "}
            <Link href={`/${lang}/privacidade`} target="_blank" className="font-semibold text-brand-700 dark:text-brand-400 underline underline-offset-2">
              {privacyLabel}
            </Link>
            .
          </span>
        </label>
        {e.consent ? <p className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">{e.consent}</p> : null}
      </div>

      <SubmitButton className="w-full py-3 text-base">{labels.submit}</SubmitButton>
    </form>
  );
}
