"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createRequestAction } from "@/lib/actions/account";

import { FormMessage, SelectField, TextareaField, TextField } from "../forms";
import { SubmitButton } from "../submit-button";

export function RequestForm({
  lang,
  labels,
  services,
  otherService,
  selectLabel,
  defaultLocation,
}: {
  lang: string;
  labels: {
    service: string;
    location: string;
    description: string;
    descriptionPlaceholder: string;
    submit: string;
    cancel: string;
  };
  services: string[];
  otherService: string;
  selectLabel: string;
  defaultLocation?: string | null;
}) {
  const [state, action] = useActionState(createRequestAction, undefined);
  const v = state?.values ?? {};
  const e = state?.errors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {state?.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label={labels.service}
          name="service"
          required
          placeholder={selectLabel}
          options={[...services, otherService].map((service) => ({ value: service, label: service }))}
          defaultValue={v.service}
          error={e.service}
        />
        <TextField
          label={labels.location}
          name="location"
          autoComplete="address-level2"
          defaultValue={v.location ?? defaultLocation}
          error={e.location}
        />
        <TextareaField
          className="sm:col-span-2"
          label={labels.description}
          name="description"
          required
          rows={6}
          placeholder={labels.descriptionPlaceholder}
          defaultValue={v.description}
          error={e.description}
        />
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/${lang}/conta`}
          className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-navy-900"
        >
          {labels.cancel}
        </Link>
        <SubmitButton className="py-3">{labels.submit}</SubmitButton>
      </div>
    </form>
  );
}
