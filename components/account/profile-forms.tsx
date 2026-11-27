"use client";

import { useActionState } from "react";

import { changePasswordAction, updateProfileAction } from "@/lib/actions/account";
import type { User } from "@/lib/data/types";

import { FormMessage, SelectField, TextField } from "../forms";
import { SubmitButton } from "../submit-button";

type ProfileLabels = {
  name: string;
  email: string;
  phone: string;
  clientType: string;
  company: string;
  nif: string;
  city: string;
  address: string;
  optional: string;
  save: string;
  emailNote: string;
};

export function ProfileForm({
  lang,
  user,
  labels,
  clientTypes,
  selectLabel,
}: {
  lang: string;
  user: Pick<User, "name" | "email" | "phone" | "client_type" | "company" | "nif" | "city" | "address">;
  labels: ProfileLabels;
  clientTypes: string[];
  selectLabel: string;
}) {
  const [state, action] = useActionState(updateProfileAction, undefined);
  const v = state?.values ?? {};
  const e = state?.errors ?? {};
  const value = (key: keyof typeof user) => (key in v ? v[key] : (user[key] ?? ""));

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {state?.message ? (
        <FormMessage tone={state.ok ? "success" : "error"}>{state.message}</FormMessage>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField className="sm:col-span-2" label={labels.name} name="name" autoComplete="name" required defaultValue={value("name")} error={e.name} />
        <div>
          <label htmlFor="field-email" className="text-sm font-semibold text-navy-900 dark:text-white">
            {labels.email}
          </label>
          <input id="field-email" type="email" value={user.email} disabled readOnly className="mt-1.5 block w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3.5 py-2.5 text-slate-500 dark:text-slate-400" />
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{labels.emailNote}</p>
        </div>
        <TextField label={labels.phone} name="phone" type="tel" autoComplete="tel" required defaultValue={value("phone")} error={e.phone} />
        <SelectField
          label={labels.clientType}
          name="client_type"
          optionalLabel={labels.optional}
          placeholder={selectLabel}
          options={clientTypes.map((type) => ({ value: type, label: type }))}
          defaultValue={value("client_type")}
          error={e.client_type}
        />
        <TextField label={labels.company} name="company" optionalLabel={labels.optional} defaultValue={value("company")} error={e.company} />
        <TextField label={labels.nif} name="nif" optionalLabel={labels.optional} defaultValue={value("nif")} error={e.nif} />
        <TextField label={labels.city} name="city" optionalLabel={labels.optional} defaultValue={value("city")} error={e.city} />
        <TextField className="sm:col-span-2" label={labels.address} name="address" optionalLabel={labels.optional} defaultValue={value("address")} error={e.address} />
      </div>
      <SubmitButton>{labels.save}</SubmitButton>
    </form>
  );
}

export function PasswordForm({
  lang,
  labels,
  passwordLabels,
}: {
  lang: string;
  passwordLabels?: { show: string; hide: string };
  labels: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    changePassword: string;
    passwordHint: string;
  };
}) {
  const [state, action] = useActionState(changePasswordAction, undefined);
  const e = state?.errors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {state?.message ? (
        <FormMessage tone={state.ok ? "success" : "error"}>{state.message}</FormMessage>
      ) : null}
      <TextField label={labels.currentPassword} name="current_password" type="password" autoComplete="current-password" required passwordLabels={passwordLabels} error={e.current_password} />
      <TextField label={labels.newPassword} name="password" type="password" autoComplete="new-password" required hint={labels.passwordHint} passwordLabels={passwordLabels} error={e.password} />
      <TextField label={labels.confirmPassword} name="password_confirm" type="password" autoComplete="new-password" required passwordLabels={passwordLabels} error={e.password_confirm} />
      <SubmitButton variant="navy">{labels.changePassword}</SubmitButton>
    </form>
  );
}
