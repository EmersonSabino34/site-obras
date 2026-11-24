"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { requestStatusLabel, workStatusLabel } from "@/lib/admin/labels";
import { generateTemporaryPassword, hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroyAllSessions, requireAdmin } from "@/lib/auth/session";
import { logActivity } from "@/lib/data/activity";
import { getQuote, saveQuote, transitionQuote } from "@/lib/data/quotes";
import { getRequest, setRequestStatus } from "@/lib/data/requests";
import {
  REQUEST_STATUSES,
  WORK_STATUSES,
  type RequestStatus,
  type WorkStatus,
} from "@/lib/data/types";
import {
  createClientUser,
  emailExists,
  getPasswordHash,
  getUser,
  setActive,
  setName,
  setPassword,
} from "@/lib/data/users";
import { addWorkUpdate, getWork, setWorkDates, setWorkStatus } from "@/lib/data/works";
import { formatDate, formatMoney, todayLisbon } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import {
  adminClientSchema,
  adminNameSchema,
  adminPasswordSchema,
  fieldErrors,
  formValues,
  quoteSchema,
  workDatesSchema,
  workUpdateSchema,
  type FormState,
} from "@/lib/validation";

const t = getDictionary("pt").account.errors;
const idOf = (formData: FormData, key = "id") => {
  const value = Number(formData.get(key));
  return Number.isInteger(value) && value > 0 ? value : null;
};

// ---------------------------------------------------------------- Requests

export async function updateRequestStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idOf(formData);
  const status = String(formData.get("status")) as RequestStatus;
  if (!id || !REQUEST_STATUSES.includes(status)) return;
  const request = await getRequest(id);
  if (!request) return;
  if (await setRequestStatus(id, status)) {
    await logActivity({
      actorId: admin.id,
      clientId: request.user_id,
      action: "request.status_changed",
      entity: "request",
      entityId: id,
      details: requestStatusLabel[status],
    });
  }
  refresh();
}

// ---------------------------------------------------------------- Quotes

export async function saveQuoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const quoteId = idOf(formData, "quote_id");

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    items = [];
  }
  const parsed = quoteSchema.safeParse({ ...Object.fromEntries(formData), items });
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error, t);
    if (errors.items) errors.items = "Adicione pelo menos uma linha com descrição, quantidade e preço válidos.";
    return { errors, message: "Verifique os campos assinalados." };
  }
  const data = parsed.data;
  const client = await getUser(data.client_id);
  if (!client || client.role !== "client") return { errors: { client_id: "Cliente inválido." } };

  const id = await saveQuote(
    {
      userId: data.client_id,
      requestId: data.request_id,
      title: data.title,
      location: data.location,
      notes: data.notes,
      vatRate: data.vat_rate,
      validUntil: data.valid_until,
      items: data.items,
    },
    quoteId ?? undefined,
  );
  if (!id) return { message: "Este orçamento já foi enviado e não pode ser editado." };

  const saved = await getQuote(id);
  await logActivity({
    actorId: admin.id,
    clientId: data.client_id,
    action: quoteId ? "quote.updated" : "quote.created",
    entity: "quote",
    entityId: id,
    details: saved ? `${saved.number} · ${formatMoney(saved.total_cents)}` : undefined,
  });
  if (data.request_id && !quoteId) {
    await setRequestStatus(data.request_id, "em_analise");
  }
  redirect(`/admin/orcamentos/${id}`);
}

export async function sendQuoteAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idOf(formData);
  const quote = id ? await getQuote(id) : null;
  if (!quote || quote.items.length === 0) return;
  if (await transitionQuote(quote.id, ["rascunho"], "enviado", { sent: true })) {
    if (quote.request_id) await setRequestStatus(quote.request_id, "orcamentado");
    await logActivity({
      actorId: admin.id,
      clientId: quote.user_id,
      action: "quote.sent",
      entity: "quote",
      entityId: quote.id,
      details: `${quote.number} · ${formatMoney(quote.total_cents)}`,
    });
  }
  refresh();
}

export async function withdrawQuoteAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idOf(formData);
  const quote = id ? await getQuote(id) : null;
  if (!quote) return;
  if (await transitionQuote(quote.id, ["enviado"], "rascunho")) {
    await logActivity({
      actorId: admin.id,
      clientId: quote.user_id,
      action: "quote.withdrawn",
      entity: "quote",
      entityId: quote.id,
      details: quote.number,
    });
  }
  refresh();
}

export async function cancelQuoteAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idOf(formData);
  const quote = id ? await getQuote(id) : null;
  if (!quote) return;
  if (await transitionQuote(quote.id, ["rascunho", "enviado"], "cancelado")) {
    await logActivity({
      actorId: admin.id,
      clientId: quote.user_id,
      action: "quote.cancelled",
      entity: "quote",
      entityId: quote.id,
      details: quote.number,
    });
  }
  refresh();
}

// ---------------------------------------------------------------- Works

export async function updateWorkStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idOf(formData);
  const status = String(formData.get("status")) as WorkStatus;
  if (!id || !WORK_STATUSES.includes(status)) return;
  const work = await getWork(id);
  if (!work) return;
  if (await setWorkStatus(id, status, todayLisbon())) {
    await logActivity({
      actorId: admin.id,
      clientId: work.user_id,
      action: "work.status_changed",
      entity: "work",
      entityId: id,
      details: `${work.title}: ${workStatusLabel[status]}`,
    });
  }
  refresh();
}

export async function updateWorkDatesAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idOf(formData);
  const parsed = workDatesSchema.safeParse(Object.fromEntries(formData));
  if (!id || !parsed.success) return;
  const work = await getWork(id);
  if (!work) return;
  await setWorkDates(id, parsed.data.start_date, parsed.data.end_date);
  await logActivity({
    actorId: admin.id,
    clientId: work.user_id,
    action: "work.dates_changed",
    entity: "work",
    entityId: id,
    details: `início ${formatDate(parsed.data.start_date)}, conclusão ${formatDate(parsed.data.end_date)}`,
  });
  refresh();
}

export async function addWorkUpdateAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = idOf(formData);
  const parsed = workUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error, t), values: formValues(formData) };
  const work = id ? await getWork(id) : null;
  if (!work) return { message: t.generic };

  await addWorkUpdate(work.id, admin.id, parsed.data.message, parsed.data.visible);
  const preview = parsed.data.message.length > 80 ? `${parsed.data.message.slice(0, 80)}…` : parsed.data.message;
  await logActivity({
    actorId: admin.id,
    clientId: work.user_id,
    action: "work.update_added",
    entity: "work",
    entityId: work.id,
    details: `${parsed.data.visible ? "" : "[interna] "}${preview}`,
  });
  refresh();
  return { ok: true, message: "Atualização publicada." };
}

// ---------------------------------------------------------------- Clients

export async function createClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = adminClientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error, t), values: formValues(formData) };
  const data = parsed.data;
  if (await emailExists(data.email)) {
    return { errors: { email: "Já existe uma conta com este email." }, values: formValues(formData) };
  }

  const temporaryPassword = generateTemporaryPassword();
  const id = await createClientUser({
    ...data,
    passwordHash: await hashPassword(temporaryPassword),
    mustChangePassword: true,
    createdBy: admin.id,
  });
  await logActivity({
    actorId: admin.id,
    clientId: id,
    action: "client.created_by_admin",
    entity: "user",
    entityId: id,
  });
  return {
    ok: true,
    data: {
      id: String(id),
      password: temporaryPassword,
      email: data.email,
      locale: data.locale,
      name: data.name,
      phone: data.phone,
    },
  };
}

export async function resetClientPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = idOf(formData);
  const client = id ? await getUser(id) : null;
  if (!client || client.role !== "client") return { message: "Cliente não encontrado." };

  const temporaryPassword = generateTemporaryPassword();
  await setPassword(client.id, await hashPassword(temporaryPassword), true);
  await destroyAllSessions(client.id);
  await logActivity({
    actorId: admin.id,
    clientId: client.id,
    action: "client.password_reset",
    entity: "user",
    entityId: client.id,
  });
  return { ok: true, data: { password: temporaryPassword } };
}

export async function toggleClientActiveAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idOf(formData);
  const client = id ? await getUser(id) : null;
  if (!client || client.role !== "client") return;
  const activate = client.active !== 1;
  await setActive(client.id, activate);
  if (!activate) await destroyAllSessions(client.id);
  await logActivity({
    actorId: admin.id,
    clientId: client.id,
    action: activate ? "client.reactivated" : "client.deactivated",
    entity: "user",
    entityId: client.id,
  });
  refresh();
}

// ---------------------------------------------------------------- My account (admin)

const adminMessages = {
  ...t,
  adminPasswordShort: "A palavra-passe deve ter pelo menos 10 caracteres.",
};

export async function updateAdminNameAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = adminNameSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error, adminMessages), values: formValues(formData) };
  await setName(admin.id, parsed.data.name);
  await logActivity({ actorId: admin.id, action: "admin.profile_updated" });
  refresh();
  return { ok: true, message: "Nome guardado.", values: formValues(formData) };
}

export async function changeAdminPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = adminPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error, adminMessages, formData) };

  const current = await getPasswordHash(admin.id);
  if (!current || !(await verifyPassword(parsed.data.current_password, current.password_hash))) {
    return { errors: { current_password: t.wrongPassword } };
  }
  await setPassword(admin.id, await hashPassword(parsed.data.password), false);
  // End sessions on other devices; keep this one signed in.
  await destroyAllSessions(admin.id);
  await createSession(admin.id);
  await logActivity({ actorId: admin.id, action: "admin.password_changed" });
  refresh();
  return { ok: true, message: "Palavra-passe alterada. As sessões noutros aparelhos foram terminadas." };
}
