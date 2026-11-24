import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";

import { createClient, type Client, type InArgs } from "@libsql/client";

import { SCHEMA } from "./schema.mjs";

/**
 * Database connection.
 *
 * - Local / own server: a SQLite file (default `data/henprotrust.db`).
 * - Cloud (e.g. Vercel): set DATABASE_URL to a Turso/libSQL URL
 *   (libsql://…) and DATABASE_AUTH_TOKEN to its token. The names created by
 *   the Turso integration on the Vercel Marketplace (TURSO_DATABASE_URL /
 *   TURSO_AUTH_TOKEN) also work.
 */
// `||` (not `??`) so that empty variables count as missing.
const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:data/henprotrust.db";
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

async function connect(): Promise<Client> {
  if (url.startsWith("file:")) {
    if (process.env.VERCEL) {
      throw new Error(
        "Base de dados não configurada: na Vercel não há disco permanente. " +
          "Ligue uma base Turso (Storage → Turso) ou defina DATABASE_URL e DATABASE_AUTH_TOKEN.",
      );
    }
    mkdirSync(path.dirname(path.resolve(url.slice("file:".length))), { recursive: true });
  }
  const client = createClient({ url, authToken });
  if (url.startsWith("file:")) {
    await client.execute("PRAGMA journal_mode = WAL");
  }
  await client.execute("PRAGMA foreign_keys = ON");
  await client.executeMultiple(SCHEMA);
  return client;
}

// Reuse one connection per server process (also across dev hot reloads).
const globalForDb = globalThis as unknown as { henprotrustDb?: Promise<Client> };

export function db(): Promise<Client> {
  globalForDb.henprotrustDb ??= connect().catch((error) => {
    globalForDb.henprotrustDb = undefined;
    throw error;
  });
  return globalForDb.henprotrustDb;
}

export async function query<T>(sql: string, args: InArgs = []): Promise<T[]> {
  const result = await (await db()).execute({ sql, args });
  return result.rows.map((row) => ({ ...row })) as T[];
}

export async function first<T>(sql: string, args: InArgs = []): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

/** Runs a write statement and returns the new row id (for INSERTs) and affected rows. */
export async function run(sql: string, args: InArgs = []) {
  const result = await (await db()).execute({ sql, args });
  return {
    id: result.lastInsertRowid !== undefined ? Number(result.lastInsertRowid) : 0,
    changes: result.rowsAffected,
  };
}

export const nowIso = () => new Date().toISOString();
