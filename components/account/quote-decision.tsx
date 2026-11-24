"use client";

import { useActionState } from "react";

import { respondToQuoteAction } from "@/lib/actions/account";

import { FormMessage, TextareaField } from "../forms";
import { BadgeCheckIcon } from "../icons";
import { SubmitButton } from "../submit-button";

export function QuoteDecision({
  lang,
  quoteId,
  labels,
}: {
  lang: string;
  quoteId: number;
  labels: {
    acceptTitle: string;
    acceptText: string;
    confirm: string;
    accept: string;
    rejectTitle: string;
    rejectReason: string;
    reject: string;
  };
}) {
  const [acceptState, acceptAction] = useActionState(respondToQuoteAction, undefined);
  const [rejectState, rejectAction] = useActionState(respondToQuoteAction, undefined);

  return (
    <div className="space-y-4 print:hidden">
      <form
        action={acceptAction}
        className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-6 sm:p-8"
      >
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="quote_id" value={quoteId} />
        <input type="hidden" name="decision" value="accept" />
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-navy-900">
          <BadgeCheckIcon className="size-6 text-emerald-600" />
          {labels.acceptTitle}
        </h2>
        <p className="mt-2 text-slate-700">{labels.acceptText}</p>
        {acceptState?.message ? (
          <div className="mt-4">
            <FormMessage tone="error">{acceptState.message}</FormMessage>
          </div>
        ) : null}
        <label className="mt-5 flex items-start gap-3 font-medium text-navy-900">
          <input
            type="checkbox"
            name="confirm"
            required
            className="mt-1 size-4 rounded border-slate-300 accent-emerald-600"
            aria-invalid={acceptState?.errors?.confirm ? true : undefined}
          />
          {labels.confirm}
        </label>
        {acceptState?.errors?.confirm ? (
          <p className="mt-1.5 text-sm font-medium text-red-600">{acceptState.errors.confirm}</p>
        ) : null}
        <SubmitButton variant="success" className="mt-6 w-full py-3 text-base sm:w-auto">
          {labels.accept}
        </SubmitButton>
      </form>

      <details className="group rounded-2xl border border-slate-200 bg-white p-6">
        <summary className="cursor-pointer list-none font-semibold text-slate-700 marker:hidden">
          <span className="underline decoration-slate-300 underline-offset-4 group-open:no-underline">
            {labels.rejectTitle}
          </span>
        </summary>
        <form action={rejectAction} className="mt-4 space-y-4">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="quote_id" value={quoteId} />
          <input type="hidden" name="decision" value="reject" />
          {rejectState?.message ? <FormMessage tone="error">{rejectState.message}</FormMessage> : null}
          <TextareaField label={labels.rejectReason} name="note" rows={3} />
          <SubmitButton variant="danger">{labels.reject}</SubmitButton>
        </form>
      </details>
    </div>
  );
}
