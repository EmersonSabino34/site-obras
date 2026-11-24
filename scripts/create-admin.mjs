#!/usr/bin/env node
// Creates (or updates the password of) an administrator account.
//
//   npm run admin:create -- --email nome@exemplo.pt --name "Nome" --password "palavra-passe"
//
// Without --password a strong random password is generated and printed once.
// Uses the same database as the app (DATABASE_URL / DATABASE_AUTH_TOKEN, TURSO_DATABASE_URL /
// TURSO_AUTH_TOKEN, or the local file). For the Vercel database, load the variables first:
//   vercel env pull .env.production.local   then   node --env-file=.env.production.local scripts/create-admin.mjs …

import { randomBytes, scrypt } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { createClient } from "@libsql/client";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    password: { type: "string" },
  },
});

const email = values.email?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Indique um email válido: npm run admin:create -- --email nome@exemplo.pt --name "Nome"');
  process.exit(1);
}
const name = values.name?.trim() || "Administrador";
const password = values.password ?? randomBytes(12).toString("base64url");
if (password.length < 10) {
  console.error("A palavra-passe do administrador deve ter pelo menos 10 caracteres.");
  process.exit(1);
}

// Same format as lib/auth/password.ts
const N = 16384, R = 8, P = 1, KEY_LENGTH = 64;
const salt = randomBytes(16);
const key = await new Promise((resolve, reject) =>
  scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 }, (error, derived) =>
    error ? reject(error) : resolve(derived),
  ),
);
const hash = ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");

const url = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL ?? "file:data/henprotrust.db";
const authToken = process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;
if (url.startsWith("file:")) mkdirSync(path.dirname(path.resolve(url.slice(5))), { recursive: true });
console.log(`Base de dados: ${url.startsWith("file:") ? url : url.replace(/^(libsql:\/\/[^.]+).*/, "$1…")}`);
const db = createClient({ url, authToken });

// Make sure the schema exists (the app applies the same SQL on start-up).
const { SCHEMA } = await import("../lib/db/schema.mjs");
await db.executeMultiple(SCHEMA);

const existing = await db.execute({ sql: "SELECT id, role FROM users WHERE email = ?", args: [email] });
if (existing.rows.length) {
  await db.execute({
    sql: "UPDATE users SET role = 'admin', name = ?, password_hash = ?, active = 1, must_change_password = 0 WHERE email = ?",
    args: [name, hash, email],
  });
  console.log(`✓ Conta ${email} atualizada como administrador.`);
} else {
  await db.execute({
    sql: "INSERT INTO users (role, name, email, password_hash, locale) VALUES ('admin', ?, ?, ?, 'pt')",
    args: [name, email, hash],
  });
  console.log(`✓ Administrador ${email} criado.`);
}
if (!values.password) console.log(`  Palavra-passe gerada (guarde-a agora): ${password}`);
console.log("  Entre em /admin/entrar");
db.close();
