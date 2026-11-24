import type { ReactNode } from "react";

import type { QuoteWithDetails } from "@/lib/data/quotes";
import type { Unit } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n";
import { formatDate, formatMoney, formatNumber, lineTotalCents } from "@/lib/format";
import { site } from "@/lib/site";

import { BRAND_NAVY, FullLogo } from "./logo";

type Labels = Dictionary["account"]["quotePage"];

/** The quote as a document: used by the client area and the admin panel, and printable. */
export function QuoteDocument({
  quote,
  locale,
  labels,
  units,
  status,
}: {
  quote: QuoteWithDetails;
  locale: string;
  labels: Labels;
  units: Record<Unit, string>;
  status?: ReactNode;
}) {
  const { client } = quote;
  const money = (cents: number) => formatMoney(cents, locale);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
      <div className="h-1.5 bg-brand-500" />
      <div className="p-6 sm:p-10 print:p-0 print:pt-6">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <FullLogo className="w-40" letters={BRAND_NAVY} title="HENPROTRUST" />
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              {site.legal.companyName}
              {site.legal.nif ? ` · NIF ${site.legal.nif}` : ""}
              <br />
              {site.base}, Portugal · {site.phoneDisplay}
              <br />
              {site.email}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">{labels.title}</p>
            <p className="mt-1 font-display text-2xl font-bold text-navy-900">{quote.number}</p>
            {status ? <div className="mt-2 sm:flex sm:justify-end">{status}</div> : null}
            <dl className="mt-4 grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-sm sm:justify-end">
              <dt className="text-slate-500">{labels.issuedOn}</dt>
              <dd className="font-medium text-navy-900">{formatDate(quote.sent_at ?? quote.created_at, locale)}</dd>
              <dt className="text-slate-500">{labels.validUntil}</dt>
              <dd className="font-medium text-navy-900">{formatDate(quote.valid_until, locale)}</dd>
            </dl>
          </div>
        </header>

        <section className="grid gap-6 border-b border-slate-200 py-8 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.client}</h2>
            <p className="mt-2 font-semibold text-navy-900">{client.name}</p>
            {client.company ? <p className="text-slate-600">{client.company}</p> : null}
            <p className="text-sm text-slate-600">
              {[client.address, client.city].filter(Boolean).join(", ")}
            </p>
            {client.nif ? <p className="text-sm text-slate-600">NIF {client.nif}</p> : null}
            <p className="text-sm text-slate-600">
              {client.email}
              {client.phone ? ` · ${client.phone}` : ""}
            </p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.workLocation}</h2>
            <p className="mt-2 font-semibold text-navy-900">{quote.title}</p>
            <p className="text-slate-600">{quote.location ?? "—"}</p>
          </div>
        </section>

        <section className="py-8">
          <h2 className="font-display text-lg font-bold text-navy-900">{labels.items}</h2>

          {/* Phones: one card per line (the table below is used on larger screens and in print) */}
          <ol className="mt-4 divide-y divide-slate-100 border-y border-slate-200 sm:hidden print:hidden">
            {quote.items.map((item) => (
              <li key={item.id} className="py-3">
                <p className="whitespace-pre-line text-navy-900">
                  <span className="mr-2 text-slate-400">{item.position}.</span>
                  {item.description}
                </p>
                <p className="mt-1 flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-slate-500 tabular-nums">
                    {formatNumber(item.quantity, locale)} {units[item.unit]} × {money(item.unit_price_cents)}
                  </span>
                  <span className="font-semibold text-navy-900 tabular-nums">
                    {money(lineTotalCents(item.quantity, item.unit_price_cents))}
                  </span>
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-4 hidden overflow-x-auto sm:block print:block">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b-2 border-navy-900 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3 font-semibold">#</th>
                  <th className="py-2 pr-3 font-semibold">{labels.description}</th>
                  <th className="py-2 pr-3 text-right font-semibold">{labels.quantity}</th>
                  <th className="py-2 pr-3 font-semibold">{labels.unit}</th>
                  <th className="py-2 pr-3 text-right font-semibold">{labels.unitPrice}</th>
                  <th className="py-2 text-right font-semibold">{labels.amount}</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-3 text-slate-400">{item.position}</td>
                    <td className="py-3 pr-3 whitespace-pre-line text-navy-900">{item.description}</td>
                    <td className="py-3 pr-3 text-right tabular-nums">{formatNumber(item.quantity, locale)}</td>
                    <td className="py-3 pr-3 text-slate-600">{units[item.unit]}</td>
                    <td className="py-3 pr-3 text-right tabular-nums">{money(item.unit_price_cents)}</td>
                    <td className="py-3 text-right font-medium tabular-nums">
                      {money(lineTotalCents(item.quantity, item.unit_price_cents))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">{labels.subtotal}</dt>
              <dd className="tabular-nums">{money(quote.subtotal_cents)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">
                {labels.vat} ({formatNumber(quote.vat_rate, locale)}%)
              </dt>
              <dd className="tabular-nums">{money(quote.vat_cents)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t-2 border-navy-900 pt-3 text-base">
              <dt className="font-bold text-navy-900">{labels.total}</dt>
              <dd className="font-display text-xl font-bold text-navy-900 tabular-nums">{money(quote.total_cents)}</dd>
            </div>
          </dl>
        </section>

        {quote.notes ? (
          <section className="border-t border-slate-200 pt-8">
            <h2 className="font-display text-lg font-bold text-navy-900">{labels.notes}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">{quote.notes}</p>
          </section>
        ) : null}

        {quote.status === "aceite" && quote.decided_at ? (
          <p className="mt-8 rounded-xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
            ✓ {labels.acceptedOn.replace("{date}", formatDate(quote.decided_at, locale))} — {client.name}
          </p>
        ) : null}
      </div>
    </article>
  );
}
