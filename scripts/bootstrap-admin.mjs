#!/usr/bin/env node
// Runs before `next build`. Creates the FIRST administrator from environment
// variables — useful where the database credentials can't be read locally
// (e.g. Vercel + Turso integration, whose secrets can't be downloaded).
//
// Does nothing unless both variables are set:
//   ADMIN_BOOTSTRAP_EMAIL          e.g. henprotrust@gmail.com
//   ADMIN_BOOTSTRAP_PASSWORD_HASH  from: npm run admin:create -- --print-hash --password "…"
//   ADMIN_BOOTSTRAP_NAME           (optional)
//
// Never overwrites an existing account. Remove the variables once the admin exists.

import { createClient } from "@libsql/client";

import { SCHEMA } from "../lib/db/schema.mjs";

const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const hash = process.env.ADMIN_BOOTSTRAP_PASSWORD_HASH?.trim();
const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "Administrador";

if (!email || !hash) process.exit(0);

if (!hash.startsWith("scrypt$")) {
  console.error("bootstrap-admin: ADMIN_BOOTSTRAP_PASSWORD_HASH inválido (gere-o com --print-hash).");
  process.exit(1);
}

const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
if (!url) {
  console.warn("bootstrap-admin: base de dados não configurada; administrador não criado.");
  process.exit(0);
}

const db = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN });
await db.executeMultiple(SCHEMA);

const existing = await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email] });
if (existing.rows.length) {
  console.log(`bootstrap-admin: a conta ${email} já existe — nada a fazer.`);
} else {
  await db.execute({
    sql: "INSERT INTO users (role, name, email, password_hash, locale) VALUES ('admin', ?, ?, ?, 'pt')",
    args: [name, email, hash],
  });
  console.log(`bootstrap-admin: ✓ administrador ${email} criado.`);
}
db.close();
