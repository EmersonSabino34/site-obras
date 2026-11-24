import type { QuoteDisplayStatus, QuoteStatus } from "./data/types";

const TIME_ZONE = "Europe/Lisbon";
const intlLocale = (locale: string) => (locale === "en" ? "en-GB" : "pt-PT");

export function formatMoney(cents: number, locale = "pt") {
  return new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

export function formatNumber(value: number, locale = "pt") {
  return new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 2 }).format(value);
}

/** Accepts ISO timestamps or plain YYYY-MM-DD dates. */
export function formatDate(value: string | null | undefined, locale = "pt") {
  if (!value) return "—";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

export function formatDateTime(value: string | null | undefined, locale = "pt") {
  if (!value) return "—";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

/** Today's date in Portugal as YYYY-MM-DD. */
export function todayLisbon() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

export function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function quoteDisplayStatus(quote: {
  status: QuoteStatus;
  valid_until: string | null;
}): QuoteDisplayStatus {
  if (quote.status === "enviado" && quote.valid_until && quote.valid_until < todayLisbon()) {
    return "expirado";
  }
  return quote.status;
}

export function lineTotalCents(quantity: number, unitPriceCents: number) {
  return Math.round(quantity * unitPriceCents);
}

export function computeTotals(
  items: { quantity: number; unit_price_cents: number }[],
  vatRate: number,
) {
  const subtotal = items.reduce((sum, item) => sum + lineTotalCents(item.quantity, item.unit_price_cents), 0);
  const vat = Math.round((subtotal * vatRate) / 100);
  return { subtotal, vat, total: subtotal + vat };
}

/**
 * Parses numbers typed the Portuguese way ("1 234,50") or the English way ("1234.50").
 * Returns NaN when invalid.
 */
export function parseDecimal(input: string) {
  let value = input.trim().replace(/\s|€/g, "");
  if (!value) return Number.NaN;
  if (value.includes(",")) {
    value = value.replace(/\./g, "").replace(",", ".");
  }
  return /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : Number.NaN;
}
