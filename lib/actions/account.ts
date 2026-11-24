"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { DUMMY_HASH, hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  destroyAllSessions,
  destroySession,
  isLoginBlocked,
  recordLoginAttempt,
  requireClient,
} from "@/lib/auth/session";
import { logActivity } from "@/lib/data/activity";
import { acceptQuote, getQuote, rejectQuote } from "@/lib/data/quotes";
import { createRequest } from "@/lib/data/requests";
import {
  createClientUser,
  emailExists,
  findUserForLogin,
  getPasswordHash,
  setPassword,
  updateProfile,
} from "@/lib/data/users";
import { formatMoney } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import { hasLocale, type Locale } from "@/lib/locales";
import {
  fieldErrors,
  formValues,
  loginSchema,
  passwordChangeSchema,
  profileSchema,
  registerSchema,
  requestSchema,
  type FormState,
} from "@/lib/validation";

function langOf(formData: FormData): Locale {
  const value = String(formData.get("lang") ?? "");
  return hasLocale(value) ? value : "pt";
}

const errorsFor = (lang: Locale) => getDictionary(lang).account.errors;

// ---------------------------------------------------------------- Register

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const lang = langOf(formData);
  const t = errorsFor(lang);
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error, t, formData), values: formValues(formData) };
  }
  const data = parsed.data;
  if (await emailExists(data.email)) {
    return { errors: { email: t.emailTaken }, values: formValues(formData) };
  }

  let userId: number;
  try {
    userId = await createClientUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      client_type: data.client_type,
      company: data.company,
      nif: data.nif,
      city: data.city,
      address: data.address,
      locale: lang,
      passwordHash: await hashPassword(data.password),
      privacyAccepted: true,
    });
  } catch {
    // Most likely the same email registered at the same moment (unique constraint).
    return { errors: { email: t.emailTaken }, values: formValues(formData) };
  }

  await logActivity({
    actorId: userId,
    clientId: userId,
    action: "client.registered",
    entity: "user",
    entityId: userId,
  });
  await createSession(userId);
  redirect(`/${lang}/conta`);
}

// ---------------------------------------------------------------- Login / logout

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const lang = langOf(formData);
  const scope = formData.get("scope") === "admin" ? "admin" : "client";
  const t = errorsFor(lang);
  const values = formValues(formData);

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error, t), values };
  const { email, password } = parsed.data;

  if (await isLoginBlocked(email)) return { message: t.tooManyAttempts, values };

  const user = await findUserForLogin(email);
  // Always run the hash check so response time doesn't reveal whether the email exists.
  // Spaces accidentally copied around the password (e.g. from WhatsApp) are forgiven.
  const storedHash = user?.password_hash ?? DUMMY_HASH;
  const valid =
    (await verifyPassword(password, storedHash)) ||
    (password.trim() !== password && (await verifyPassword(password.trim(), storedHash)));
  const allowed = user && valid && user.active === 1 && (scope === "client" || user.role === "admin");

  await recordLoginAttempt(email, Boolean(allowed));
  if (!allowed) return { message: t.invalidCredentials, values };

  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : `/${lang}/conta`);
}

export async function logoutAction(formData: FormData) {
  await destroySession();
  redirect(formData.get("scope") === "admin" ? "/admin/entrar" : `/${langOf(formData)}`);
}

// ---------------------------------------------------------------- Requests

export async function createRequestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const lang = langOf(formData);
  const user = await requireClient(lang);
  const parsed = requestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error, errorsFor(lang)), values: formValues(formData) };
  }

  const id = await createRequest(user.id, parsed.data);
  await logActivity({
    actorId: user.id,
    clientId: user.id,
    action: "request.created",
    entity: "request",
    entityId: id,
    details: parsed.data.service + (parsed.data.location ? ` · ${parsed.data.location}` : ""),
  });
  redirect(`/${lang}/conta?pedido=enviado`);
}

// ---------------------------------------------------------------- Quotes

export async function respondToQuoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const lang = langOf(formData);
  const user = await requireClient(lang);
  const t = errorsFor(lang);
  const quoteId = Number(formData.get("quote_id"));
  const decision = formData.get("decision");

  const quote = Number.isInteger(quoteId) ? await getQuote(quoteId) : null;
  if (!quote || quote.user_id !== user.id) return { message: t.quoteUnavailable };
  const summary = `${quote.number} · ${formatMoney(quote.total_cents)}`;

  if (decision === "accept") {
    if (formData.get("confirm") !== "on") return { errors: { confirm: t.confirmQuote } };
    const workId = await acceptQuote(quote.id, user.id);
    if (!workId) return { message: t.quoteUnavailable };
    await logActivity({
      actorId: user.id,
      clientId: user.id,
      action: "quote.accepted",
      entity: "quote",
      entityId: quote.id,
      details: summary,
    });
    await logActivity({
      actorId: user.id,
      clientId: user.id,
      action: "work.created",
      entity: "work",
      entityId: workId,
      details: quote.title,
    });
    redirect(`/${lang}/conta/orcamentos/${quote.id}?resultado=aceite`);
  }

  if (decision === "reject") {
    const note = String(formData.get("note") ?? "").trim().slice(0, 1000) || null;
    const ok = await rejectQuote(quote.id, user.id, note);
    if (!ok) return { message: t.quoteUnavailable };
    await logActivity({
      actorId: user.id,
      clientId: user.id,
      action: "quote.rejected",
      entity: "quote",
      entityId: quote.id,
      details: note ? `${summary} — “${note}”` : summary,
    });
    redirect(`/${lang}/conta/orcamentos/${quote.id}`);
  }

  return { message: t.generic };
}

// ---------------------------------------------------------------- Profile

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const lang = langOf(formData);
  const user = await requireClient(lang);
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error, errorsFor(lang)), values: formValues(formData) };
  }
  await updateProfile(user.id, { ...parsed.data, locale: lang });
  await logActivity({
    actorId: user.id,
    clientId: user.id,
    action: "client.profile_updated",
    entity: "user",
    entityId: user.id,
  });
  refresh();
  return { ok: true, message: getDictionary(lang).account.profilePage.saved, values: formValues(formData) };
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const lang = langOf(formData);
  const user = await requireClient(lang);
  const t = errorsFor(lang);
  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error, t, formData) };

  const current = await getPasswordHash(user.id);
  if (!current || !(await verifyPassword(parsed.data.current_password, current.password_hash))) {
    return { errors: { current_password: t.wrongPassword } };
  }
  await setPassword(user.id, await hashPassword(parsed.data.password), false);
  // Log out every other device, keep this one signed in.
  await destroyAllSessions(user.id);
  await createSession(user.id);
  await logActivity({
    actorId: user.id,
    clientId: user.id,
    action: "client.password_changed",
    entity: "user",
    entityId: user.id,
  });
  refresh();
  return { ok: true, message: getDictionary(lang).account.profilePage.passwordChanged };
}
