"use client";

import { useActionState } from "react";

import { loginAction } from "@/lib/actions/account";

import { FormMessage, TextField } from "../forms";
import { SubmitButton } from "../submit-button";

export function LoginForm({
  lang,
  scope = "client",
  labels,
}: {
  lang: string;
  scope?: "client" | "admin";
  labels: { email: string; password: string; submit: string };
}) {
  const [state, action] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="scope" value={scope} />
      {state?.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <TextField
        label={labels.email}
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state?.values?.email}
        error={state?.errors?.email}
      />
      <TextField
        label={labels.password}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state?.errors?.password}
      />
      <SubmitButton className="w-full py-3 text-base">{labels.submit}</SubmitButton>
    </form>
  );
}
