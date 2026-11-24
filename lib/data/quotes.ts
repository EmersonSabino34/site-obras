import "server-only";

import { db, first, nowIso, query, run } from "@/lib/db";
import { computeTotals, todayLisbon } from "@/lib/format";

import type { Quote, QuoteItem, QuoteStatus, Unit, WithClient } from "./types";

export type QuoteInput = {
  userId: number;
  requestId: number | null;
  title: string;
  location: string | null;
  notes: string | null;
  vatRate: number;
  validUntil: string | null;
  items: { description: string; quantity: number; unit: Unit; unit_price_cents: number }[];
};

export type QuoteRow = Quote & WithClient;

export type QuoteWithDetails = Quote & {
  items: QuoteItem[];
  client: {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    nif: string | null;
    city: string | null;
    address: string | null;
    locale: string;
  };
};

// ---- Client side (only quotes that were sent; drafts stay private) ----

export function listQuotesForUser(userId: number) {
  return query<Quote>(
    "SELECT * FROM quotes WHERE user_id = ? AND status != 'rascunho' ORDER BY COALESCE(sent_at, created_at) DESC",
    [userId],
  );
}

export async function getQuoteForUser(id: number, userId: number) {
  const quote = await getQuote(id);
  if (!quote || quote.user_id !== userId || quote.status === "rascunho") return null;
  return quote;
}

/** Marks the first time the client opens a sent quote. Returns true the first time. */
export async function markQuoteViewed(id: number, userId: number) {
  const { changes } = await run(
    "UPDATE quotes SET viewed_at = ? WHERE id = ? AND user_id = ? AND viewed_at IS NULL AND status = 'enviado'",
    [nowIso(), id, userId],
  );
  return changes > 0;
}

/**
 * Client accepts a quote: atomically marks it accepted (only if still open and valid)
 * and opens the corresponding work. Returns the new work id, or null.
 */
export async function acceptQuote(id: number, userId: number) {
  const tx = await (await db()).transaction("write");
  try {
    const now = nowIso();
    const updated = await tx.execute({
      sql: `UPDATE quotes SET status = 'aceite', decided_at = ?, updated_at = ?
             WHERE id = ? AND user_id = ? AND status = 'enviado'
               AND (valid_until IS NULL OR valid_until >= ?)`,
      args: [now, now, id, userId, todayLisbon()],
    });
    if (updated.rowsAffected !== 1) {
      await tx.rollback();
      return null;
    }
    const work = await tx.execute({
      sql: `INSERT INTO works (quote_id, user_id, title, location)
            SELECT id, user_id, title, location FROM quotes WHERE id = ?`,
      args: [id],
    });
    await tx.commit();
    return Number(work.lastInsertRowid);
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    tx.close();
  }
}

export async function rejectQuote(id: number, userId: number, note: string | null) {
  const now = nowIso();
  const { changes } = await run(
    `UPDATE quotes SET status = 'recusado', decided_at = ?, decision_note = ?, updated_at = ?
      WHERE id = ? AND user_id = ? AND status = 'enviado'`,
    [now, note, now, id, userId],
  );
  return changes > 0;
}

// ---- Admin side ----

export async function getQuote(id: number): Promise<QuoteWithDetails | null> {
  const quote = await first<Quote>("SELECT * FROM quotes WHERE id = ?", [id]);
  if (!quote) return null;
  const [items, client] = await Promise.all([
    query<QuoteItem>("SELECT * FROM quote_items WHERE quote_id = ? ORDER BY position", [id]),
    first<QuoteWithDetails["client"]>(
      "SELECT name, email, phone, company, nif, city, address, locale FROM users WHERE id = ?",
      [quote.user_id],
    ),
  ]);
  return { ...quote, items, client: client! };
}

export function listQuotes(status?: QuoteStatus) {
  return query<QuoteRow>(
    `SELECT q.*, u.name AS client_name, u.email AS client_email
       FROM quotes q JOIN users u ON u.id = q.user_id
      ${status ? "WHERE q.status = ?" : ""}
      ORDER BY q.updated_at DESC
      LIMIT 500`,
    status ? [status] : [],
  );
}

export function listQuotesByUser(userId: number) {
  return query<Quote>("SELECT * FROM quotes WHERE user_id = ? ORDER BY created_at DESC", [userId]);
}

export function listQuotesByRequest(requestId: number) {
  return query<Quote>("SELECT * FROM quotes WHERE request_id = ? ORDER BY created_at DESC", [requestId]);
}

export async function saveQuote(input: QuoteInput, existingId?: number) {
  const totals = computeTotals(input.items, input.vatRate);
  const tx = await (await db()).transaction("write");
  try {
    let id = existingId;
    const now = nowIso();
    if (id) {
      const updated = await tx.execute({
        sql: `UPDATE quotes SET user_id = ?, request_id = ?, title = ?, location = ?, notes = ?, vat_rate = ?,
                     subtotal_cents = ?, vat_cents = ?, total_cents = ?, valid_until = ?, updated_at = ?
               WHERE id = ? AND status = 'rascunho'`,
        args: [
          input.userId,
          input.requestId,
          input.title,
          input.location,
          input.notes,
          input.vatRate,
          totals.subtotal,
          totals.vat,
          totals.total,
          input.validUntil,
          now,
          id,
        ],
      });
      if (updated.rowsAffected !== 1) {
        await tx.rollback();
        return null;
      }
      await tx.execute({ sql: "DELETE FROM quote_items WHERE quote_id = ?", args: [id] });
    } else {
      const year = todayLisbon().slice(0, 4);
      const prefix = `ORC-${year}-`;
      const last = await tx.execute({
        sql: "SELECT MAX(CAST(substr(number, ?) AS INTEGER)) AS seq FROM quotes WHERE number LIKE ?",
        args: [prefix.length + 1, `${prefix}%`],
      });
      const seq = Number(last.rows[0]?.seq ?? 0) + 1;
      const inserted = await tx.execute({
        sql: `INSERT INTO quotes (number, user_id, request_id, title, location, notes, vat_rate,
                                  subtotal_cents, vat_cents, total_cents, valid_until)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `${prefix}${String(seq).padStart(4, "0")}`,
          input.userId,
          input.requestId,
          input.title,
          input.location,
          input.notes,
          input.vatRate,
          totals.subtotal,
          totals.vat,
          totals.total,
          input.validUntil,
        ],
      });
      id = Number(inserted.lastInsertRowid);
    }
    for (const [index, item] of input.items.entries()) {
      await tx.execute({
        sql: `INSERT INTO quote_items (quote_id, position, description, quantity, unit, unit_price_cents)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [id, index + 1, item.description, item.quantity, item.unit, item.unit_price_cents],
      });
    }
    await tx.commit();
    return id;
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    tx.close();
  }
}

/** Moves a quote between statuses only from the expected current status. */
export async function transitionQuote(
  id: number,
  from: QuoteStatus[],
  to: QuoteStatus,
  extra: { sent?: boolean } = {},
) {
  const now = nowIso();
  const placeholders = from.map(() => "?").join(", ");
  const { changes } = await run(
    `UPDATE quotes SET status = ?, updated_at = ?${extra.sent ? ", sent_at = ?, viewed_at = NULL" : ""}
      WHERE id = ? AND status IN (${placeholders})`,
    [to, now, ...(extra.sent ? [now] : []), id, ...from],
  );
  return changes > 0;
}
