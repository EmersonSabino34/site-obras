import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { first, nowIso, run } from "@/lib/db";
import type { Locale } from "@/lib/locales";

import { SESSION_COOKIE } from "./constants";

const SESSION_DAYS = 30;

export type SessionUser = {
  id: number;
  role: "client" | "admin";
  name: string;
  email: string;
  locale: string;
  must_change_password: number;
};

// Only a hash of the token is stored, so a database leak can't be used to log in.
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await run("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [
    hashToken(token),
    userId,
    expires.toISOString(),
  ]);
  await run("UPDATE users SET last_login_at = ? WHERE id = ?", [nowIso(), userId]);
  // Housekeeping: drop expired sessions.
  await run("DELETE FROM sessions WHERE expires_at < ?", [nowIso()]);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

/** The logged-in user for this request, or null. Deduplicated per request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  // The session check compares against the current time, so it must run per request
  // (not during prefetch prerendering).
  await connection();
  return first<SessionUser>(
    `SELECT u.id, u.role, u.name, u.email, u.locale, u.must_change_password
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > ? AND u.active = 1`,
    [hashToken(token), nowIso()],
  );
});

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE id = ?", [hashToken(token)]);
  store.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: number) {
  await run("DELETE FROM sessions WHERE user_id = ?", [userId]);
}

// ---- Data Access Layer guards: call these in every protected page and action ----

export async function requireClient(lang: Locale) {
  const user = await getSessionUser();
  if (!user) redirect(`/${lang}/conta/entrar`);
  if (user.role === "admin") redirect("/admin");
  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") redirect("/admin/entrar");
  return user;
}

// ---- Brute-force protection ----

const WINDOW_MINUTES = 15;
const MAX_FAILURES = 8;

export async function isLoginBlocked(email: string) {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const row = await first<{ failures: number }>(
    "SELECT COUNT(*) AS failures FROM login_attempts WHERE email = ? AND success = 0 AND created_at > ?",
    [email, since],
  );
  return (row?.failures ?? 0) >= MAX_FAILURES;
}

export async function recordLoginAttempt(email: string, success: boolean) {
  await run("INSERT INTO login_attempts (email, success) VALUES (?, ?)", [email, success ? 1 : 0]);
  if (success) {
    await run("DELETE FROM login_attempts WHERE email = ? AND success = 0", [email]);
  }
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await run("DELETE FROM login_attempts WHERE created_at < ?", [dayAgo]);
}
