"use client";

import { useActionState, useId, useState } from "react";

import { saveQuoteAction } from "@/lib/actions/admin";
import type { Unit } from "@/lib/data/types";
import { formatMoney, lineTotalCents, parseDecimal } from "@/lib/format";

import { FormMessage, inputClass, SelectField, TextareaField, TextField } from "../forms";
import { CloseIcon } from "../icons";
import { SubmitButton } from "../submit-button";

type Row = { key: string; description: string; quantity: string; unit: Unit; price: string };

export type QuoteEditorInitial = {
  quoteId?: number;
  clientId?: number;
  requestId?: number | null;
  title?: string;
  location?: string | null;
  notes?: string | null;
  vatRate?: number;
  validUntil?: string | null;
  items?: { description: string; quantity: number; unit: Unit; unit_price_cents: number }[];
};

const decimalToText = (value: number) => String(value).replace(".", ",");

export function QuoteEditor({
  initial,
  clients,
  units,
  vatRates,
  requestSummary,
}: {
  initial: QuoteEditorInitial;
  clients: { id: number; name: string; email: string; company: string | null }[];
  units: { value: Unit; label: string }[];
  vatRates: readonly number[];
  requestSummary?: string;
}) {
  const [state, action] = useActionState(saveQuoteAction, undefined);
  const baseId = useId();
  const [counter, setCounter] = useState(0);
  const newRow = (index: number): Row => ({
    key: `${baseId}-new-${index}`,
    description: "",
    quantity: "1",
    unit: "un",
    price: "",
  });
  const [rows, setRows] = useState<Row[]>(() =>
    initial.items?.length
      ? initial.items.map((item, index) => ({
          key: `${baseId}-${index}`,
          description: item.description,
          quantity: decimalToText(item.quantity),
          unit: item.unit,
          price: decimalToText(item.unit_price_cents / 100),
        }))
      : [newRow(0)],
  );
  const [vatRate, setVatRate] = useState(initial.vatRate ?? 23);

  const parsed = rows.map((row) => {
    const quantity = parseDecimal(row.quantity);
    const price = parseDecimal(row.price);
    const valid = row.description.trim() !== "" && quantity > 0 && price >= 0;
    return {
      row,
      valid,
      quantity,
      unit_price_cents: Number.isFinite(price) ? Math.round(price * 100) : 0,
    };
  });
  const subtotal = parsed.reduce(
    (sum, item) => sum + (item.valid ? lineTotalCents(item.quantity, item.unit_price_cents) : 0),
    0,
  );
  const vat = Math.round((subtotal * vatRate) / 100);
  const itemsJson = JSON.stringify(
    parsed
      .filter((item) => item.row.description.trim() || item.row.price.trim())
      .map((item) => ({
        description: item.row.description.trim(),
        quantity: Number.isFinite(item.quantity) ? item.quantity : 0,
        unit: item.row.unit,
        unit_price_cents: item.unit_price_cents,
      })),
  );

  const update = (key: string, patch: Partial<Row>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const addRow = () => {
    setRows((current) => [...current, newRow(counter + 1)]);
    setCounter((value) => value + 1);
  };
  const removeRow = (key: string) =>
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));

  const e = state?.errors ?? {};

  return (
    <form action={action} className="space-y-6">
      {initial.quoteId ? <input type="hidden" name="quote_id" value={initial.quoteId} /> : null}
      {initial.requestId ? <input type="hidden" name="request_id" value={initial.requestId} /> : null}
      <input type="hidden" name="items" value={itemsJson} />
      {state?.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="font-display text-base font-bold text-navy-900">Dados do orçamento</h2>
        {requestSummary ? (
          <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{requestSummary}</p>
        ) : null}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <SelectField
            className="sm:col-span-2"
            label="Cliente"
            name="client_id"
            required
            placeholder="Selecione o cliente"
            defaultValue={initial.clientId ? String(initial.clientId) : ""}
            options={clients.map((client) => ({
              value: String(client.id),
              label: `${client.name}${client.company ? ` — ${client.company}` : ""} (${client.email})`,
            }))}
            error={e.client_id}
          />
          <TextField
            label="Título / trabalho"
            name="title"
            required
            placeholder="Ex.: Pintura das zonas comuns"
            defaultValue={initial.title}
            error={e.title}
          />
          <TextField
            label="Local da obra"
            name="location"
            placeholder="Ex.: Rua…, Peniche"
            defaultValue={initial.location}
            error={e.location}
          />
          <TextField
            label="Válido até"
            name="valid_until"
            type="date"
            defaultValue={initial.validUntil}
            error={e.valid_until}
          />
          <div>
            <label htmlFor="field-vat_rate" className="text-sm font-semibold text-navy-900">
              Taxa de IVA
            </label>
            <select
              id="field-vat_rate"
              name="vat_rate"
              value={vatRate}
              onChange={(event) => setVatRate(Number(event.target.value))}
              className={inputClass}
            >
              {vatRates.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%{rate === 6 ? " (taxa reduzida — confirmar enquadramento)" : rate === 0 ? " (isento / autoliquidação)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-navy-900">Trabalhos e valores</h2>
          <p className="text-xs text-slate-500">Valores sem IVA · aceita vírgula (ex.: 12,50)</p>
        </div>
        {e.items ? <p className="mt-3 text-sm font-medium text-red-600">{e.items}</p> : null}

        <div className="mt-5 space-y-3">
          <div className="hidden grid-cols-[1fr_6rem_8.5rem_8rem_7rem_2.5rem] gap-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:grid">
            <span>Descrição</span>
            <span className="text-right">Qtd.</span>
            <span>Unidade</span>
            <span className="text-right">Preço unit. (€)</span>
            <span className="text-right">Valor</span>
            <span />
          </div>
          {parsed.map(({ row, valid, quantity, unit_price_cents }, index) => (
            <div
              key={row.key}
              className="grid gap-3 rounded-xl border border-slate-200 p-3 lg:grid-cols-[1fr_6rem_9.5rem_8rem_7rem_2.5rem] lg:items-start lg:border-0 lg:p-0"
            >
              <textarea
                aria-label={`Descrição da linha ${index + 1}`}
                value={row.description}
                onChange={(event) => update(row.key, { description: event.target.value })}
                rows={1}
                placeholder="Descrição do trabalho"
                className={`${inputClass} mt-0 min-h-[2.75rem] resize-y`}
              />
              <input
                aria-label={`Quantidade da linha ${index + 1}`}
                inputMode="decimal"
                value={row.quantity}
                onChange={(event) => update(row.key, { quantity: event.target.value })}
                className={`${inputClass} mt-0 text-right tabular-nums`}
              />
              <select
                aria-label={`Unidade da linha ${index + 1}`}
                value={row.unit}
                onChange={(event) => update(row.key, { unit: event.target.value as Unit })}
                className={`${inputClass} mt-0`}
              >
                {units.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
              <input
                aria-label={`Preço unitário da linha ${index + 1}`}
                inputMode="decimal"
                value={row.price}
                placeholder="0,00"
                onChange={(event) => update(row.key, { price: event.target.value })}
                className={`${inputClass} mt-0 text-right tabular-nums`}
              />
              <p className="self-center text-right text-sm font-semibold tabular-nums text-navy-900">
                {valid ? formatMoney(lineTotalCents(quantity, unit_price_cents)) : "—"}
              </p>
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                disabled={rows.length === 1}
                aria-label={`Remover linha ${index + 1}`}
                className="grid size-10 place-items-center justify-self-end rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-700"
        >
          + Adicionar linha
        </button>

        <dl className="mt-6 ml-auto max-w-xs space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">IVA ({vatRate}%)</dt>
            <dd className="tabular-nums">{formatMoney(vat)}</dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="font-bold text-navy-900">Total</dt>
            <dd className="font-display text-lg font-bold tabular-nums text-navy-900">{formatMoney(subtotal + vat)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <TextareaField
          label="Condições e observações (visível para o cliente)"
          name="notes"
          rows={6}
          defaultValue={initial.notes}
          placeholder={"Ex.:\nPrazo de execução: a acordar após adjudicação.\nCondições de pagamento: …\nTrabalhos não incluídos nesta proposta serão orçamentados à parte."}
          error={e.notes}
        />
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <SubmitButton variant="navy" className="py-3">
          {initial.quoteId ? "Guardar alterações" : "Guardar rascunho"}
        </SubmitButton>
      </div>
      <p className="text-right text-xs text-slate-500">
        O orçamento fica como rascunho até o enviar ao cliente na página seguinte.
      </p>
    </form>
  );
}
