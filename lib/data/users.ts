import "server-only";

import { first, nowIso, query, run } from "@/lib/db";

import type { User } from "./types";

const USER_COLUMNS = `id, role, name, email, phone, client_type, company, nif, city, address,
  locale, active, must_change_password, created_at, last_login_at`;

export type ProfileInput = {
  name: string;
  phone: string;
  client_type: string | null;
  company: string | null;
  nif: string | null;
  city: string | null;
  address: string | null;
};

export function findUserForLogin(email: string) {
  return first<{ id: number; role: "client" | "admin"; password_hash: string; active: number }>(
    "SELECT id, role, password_hash, active FROM users WHERE email = ?",
    [email],
  );
}

export function getUser(id: number) {
  return first<User>(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [id]);
}

export function getPasswordHash(id: number) {
  return first<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", [id]);
}

export async function emailExists(email: string) {
  return (await first("SELECT 1 FROM users WHERE email = ?", [email])) !== null;
}

export async function createClientUser(
  input: ProfileInput & {
    email: string;
    passwordHash: string;
    locale: string;
    mustChangePassword?: boolean;
    createdBy?: number;
    privacyAccepted?: boolean;
  },
) {
  const { id } = await run(
    `INSERT INTO users (role, name, email, phone, client_type, company, nif, city, address,
                        locale, password_hash, must_change_password, created_by, privacy_accepted_at)
     VALUES ('client', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.email,
      input.phone,
      input.client_type,
      input.company,
      input.nif,
      input.city,
      input.address,
      input.locale,
      input.passwordHash,
      input.mustChangePassword ? 1 : 0,
      input.createdBy ?? null,
      input.privacyAccepted ? nowIso() : null,
    ],
  );
  return id;
}

export async function updateProfile(id: number, input: ProfileInput & { locale?: string }) {
  await run(
    `UPDATE users SET name = ?, phone = ?, client_type = ?, company = ?, nif = ?, city = ?, address = ?,
            locale = COALESCE(?, locale)
      WHERE id = ?`,
    [
      input.name,
      input.phone,
      input.client_type,
      input.company,
      input.nif,
      input.city,
      input.address,
      input.locale ?? null,
      id,
    ],
  );
}

export async function setName(id: number, name: string) {
  await run("UPDATE users SET name = ? WHERE id = ?", [name, id]);
}

export async function setPassword(id: number, passwordHash: string, mustChange: boolean) {
  await run("UPDATE users SET password_hash = ?, must_change_password = ? WHERE id = ?", [
    passwordHash,
    mustChange ? 1 : 0,
    id,
  ]);
}

export async function setActive(id: number, active: boolean) {
  await run("UPDATE users SET active = ? WHERE id = ? AND role = 'client'", [active ? 1 : 0, id]);
}

export type ClientListRow = User & {
  requests_count: number;
  quotes_count: number;
  accepted_total_cents: number;
  works_active: number;
};

export function listClients(search?: string) {
  const args: string[] = [];
  let where = "u.role = 'client'";
  if (search) {
    where += " AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.company LIKE ? OR u.nif LIKE ?)";
    const like = `%${search}%`;
    args.push(like, like, like, like, like);
  }
  return query<ClientListRow>(
    `SELECT ${USER_COLUMNS.split(",").map((c) => `u.${c.trim()}`).join(", ")},
            (SELECT COUNT(*) FROM requests r WHERE r.user_id = u.id) AS requests_count,
            (SELECT COUNT(*) FROM quotes q WHERE q.user_id = u.id AND q.status != 'rascunho') AS quotes_count,
            (SELECT COALESCE(SUM(q.total_cents), 0) FROM quotes q WHERE q.user_id = u.id AND q.status = 'aceite') AS accepted_total_cents,
            (SELECT COUNT(*) FROM works w WHERE w.user_id = u.id AND w.status IN ('por_iniciar', 'em_curso')) AS works_active
       FROM users u
      WHERE ${where}
      ORDER BY u.created_at DESC
      LIMIT 500`,
    args,
  );
}

export function listClientOptions() {
  return query<{ id: number; name: string; email: string; company: string | null }>(
    "SELECT id, name, email, company FROM users WHERE role = 'client' AND active = 1 ORDER BY name COLLATE NOCASE",
  );
}
