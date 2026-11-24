"use client";

import Link from "next/link";
import { useActionState } from "react";

import { whatsappNumberFor } from "@/lib/admin/labels";
import {
  addWorkUpdateAction,
  createClientAction,
  resetClientPasswordAction,
} from "@/lib/actions/admin";

import { FormMessage, SelectField, TextareaField, TextField } from "../forms";
import { WhatsAppIcon } from "../icons";
import { SubmitButton } from "../submit-button";
import { linkButton } from "./ui";

// ---------------------------------------------------------------- Work updates

export function WorkUpdateForm({ workId }: { workId: number }) {
  const [state, action] = useActionState(addWorkUpdateAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={workId} />
      {state?.message ? <FormMessage tone={state.ok ? "success" : "error"}>{state.message}</FormMessage> : null}
      <TextareaField
        label="Nova atualização"
        name="message"
        rows={3}
        required
        placeholder="Ex.: Concluída a preparação das paredes; pintura começa amanhã."
        defaultValue={state?.ok ? "" : state?.values?.message}
        error={state?.errors?.message}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="visible" defaultChecked className="size-4 accent-brand-500" />
          Visível para o cliente na área de cliente
        </label>
        <SubmitButton variant="navy">Publicar atualização</SubmitButton>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- Credentials helper

function CredentialsCard({
  name,
  email,
  password,
  phoneNumber,
  loginUrl,
  locale,
  intro,
}: {
  name: string;
  email: string;
  password: string;
  phoneNumber: string | null;
  loginUrl: string;
  locale: string;
  intro: string;
}) {
  const firstName = name.split(" ")[0];
  const message =
    locale === "en"
      ? `Hello ${firstName}! Your HENPROTRUST client area is ready.\nLog in at ${loginUrl}\nEmail: ${email}\nTemporary password: ${password}\nPlease change your password after logging in.`
      : `Olá ${firstName}! A sua área de cliente HENPROTRUST está pronta.\nEntre em ${loginUrl}\nEmail: ${email}\nPalavra-passe temporária: ${password}\nPor segurança, altere a palavra-passe depois de entrar.`;

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="font-semibold text-emerald-900">{intro}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-emerald-800">Email</dt>
        <dd className="font-mono font-semibold text-navy-900">{email}</dd>
        <dt className="text-emerald-800">Palavra-passe</dt>
        <dd className="font-mono font-semibold text-navy-900 select-all">{password}</dd>
      </dl>
      <p className="text-xs text-emerald-800">
        Esta palavra-passe só é mostrada agora. O cliente será convidado a alterá-la no primeiro acesso.
      </p>
      {phoneNumber ? (
        <a
          href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkButton.whatsapp}
        >
          <WhatsAppIcon className="size-4" />
          Enviar acesso por WhatsApp
        </a>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- New client

export function NewClientForm({ clientTypes, siteUrl }: { clientTypes: string[]; siteUrl: string }) {
  const [state, action] = useActionState(createClientAction, undefined);
  const v = state?.values ?? {};
  const e = state?.errors ?? {};

  if (state?.ok && state.data) {
    const { id, password, email, locale, name, phone } = state.data;
    return (
      <div className="space-y-5">
        <CredentialsCard
          intro={`Conta criada para ${name}.`}
          name={name}
          email={email}
          password={password}
          phoneNumber={whatsappNumberFor(phone)}
          locale={locale}
          loginUrl={`${siteUrl}/${locale}/conta/entrar`}
        />
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/orcamentos/novo?cliente=${id}`} className={linkButton.primary}>
            Criar orçamento para este cliente
          </Link>
          <Link href={`/admin/clientes/${id}`} className={linkButton.outline}>
            Ver ficha do cliente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      {state?.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField className="sm:col-span-2" label="Nome" name="name" required defaultValue={v.name} error={e.name} />
        <TextField label="Email" name="email" type="email" required defaultValue={v.email} error={e.email} />
        <TextField label="Telemóvel" name="phone" type="tel" required defaultValue={v.phone} error={e.phone} hint="Usado para enviar o acesso por WhatsApp." />
        <SelectField
          label="Tipo de cliente"
          name="client_type"
          placeholder="—"
          options={clientTypes.map((type) => ({ value: type, label: type }))}
          defaultValue={v.client_type}
        />
        <TextField label="Empresa / condomínio" name="company" defaultValue={v.company} error={e.company} />
        <TextField label="NIF" name="nif" defaultValue={v.nif} error={e.nif} />
        <TextField label="Localidade" name="city" defaultValue={v.city} error={e.city} />
        <TextField className="sm:col-span-2" label="Morada" name="address" defaultValue={v.address} error={e.address} />
        <SelectField
          label="Idioma do cliente"
          name="locale"
          options={[
            { value: "pt", label: "Português" },
            { value: "en", label: "English" },
          ]}
          defaultValue={v.locale ?? "pt"}
        />
      </div>
      <SubmitButton variant="navy" className="py-3">
        Criar conta e gerar palavra-passe
      </SubmitButton>
    </form>
  );
}

// ---------------------------------------------------------------- Reset password

export function ResetPasswordForm({
  clientId,
  name,
  email,
  phoneNumber,
  locale,
  siteUrl,
}: {
  clientId: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  locale: string;
  siteUrl: string;
}) {
  const [state, action] = useActionState(resetClientPasswordAction, undefined);

  if (state?.ok && state.data?.password) {
    return (
      <CredentialsCard
        intro="Nova palavra-passe temporária gerada. As sessões abertas do cliente foram terminadas."
        name={name}
        email={email}
        password={state.data.password}
        phoneNumber={phoneNumber}
        locale={locale}
        loginUrl={`${siteUrl}/${locale}/conta/entrar`}
      />
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="id" value={clientId} />
      {state?.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <SubmitButton
        variant="outline"
        className="w-full"
        confirmMessage="Gerar uma nova palavra-passe temporária? A atual deixa de funcionar."
      >
        Repor palavra-passe
      </SubmitButton>
    </form>
  );
}
