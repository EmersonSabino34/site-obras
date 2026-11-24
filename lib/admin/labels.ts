import type { ActivityAction, ActivityEntry } from "@/lib/data/activity";
import type { QuoteDisplayStatus, RequestStatus, Unit, WorkStatus } from "@/lib/data/types";

export const requestStatusLabel: Record<RequestStatus, string> = {
  novo: "Novo",
  em_analise: "Em análise",
  orcamentado: "Orçamentado",
  arquivado: "Arquivado",
};

export const quoteStatusLabel: Record<QuoteDisplayStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aceite: "Aceite",
  recusado: "Recusado",
  cancelado: "Anulado",
  expirado: "Expirado",
};

export const workStatusLabel: Record<WorkStatus, string> = {
  por_iniciar: "Por iniciar",
  em_curso: "Em curso",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const unitLabel: Record<Unit, string> = {
  un: "unidade",
  m2: "m²",
  ml: "m linear",
  m3: "m³",
  h: "hora",
  dia: "dia",
  vg: "verba global",
};

export type Tone = "orange" | "blue" | "green" | "red" | "gray" | "navy" | "amber";

export const statusTone: Record<string, Tone> = {
  novo: "orange",
  em_analise: "blue",
  orcamentado: "green",
  arquivado: "gray",
  rascunho: "gray",
  enviado: "blue",
  aceite: "green",
  recusado: "red",
  cancelado: "gray",
  expirado: "amber",
  por_iniciar: "amber",
  em_curso: "blue",
  concluida: "green",
  cancelada: "gray",
};

const templates: Record<ActivityAction, string> = {
  "client.registered": "{client} criou conta na área de cliente",
  "client.created_by_admin": "{actor} criou a conta de {client}",
  "client.profile_updated": "{client} atualizou os seus dados",
  "client.password_changed": "{client} alterou a palavra-passe",
  "admin.password_changed": "{actor} alterou a sua palavra-passe de acesso à gestão",
  "admin.profile_updated": "{actor} atualizou o seu nome na gestão",
  "client.password_reset": "{actor} gerou uma palavra-passe temporária para {client}",
  "client.deactivated": "{actor} desativou a conta de {client}",
  "client.reactivated": "{actor} reativou a conta de {client}",
  "request.created": "{client} enviou um pedido de orçamento — {details}",
  "request.status_changed": "{actor} alterou o estado do pedido #{id} — {details}",
  "quote.created": "{actor} criou o orçamento {details}",
  "quote.updated": "{actor} editou o orçamento {details}",
  "quote.sent": "{actor} enviou o orçamento {details} a {client}",
  "quote.withdrawn": "{actor} retirou o orçamento {details} (voltou a rascunho)",
  "quote.cancelled": "{actor} anulou o orçamento {details}",
  "quote.viewed": "{client} abriu o orçamento {details}",
  "quote.accepted": "{client} aceitou o orçamento {details}",
  "quote.rejected": "{client} recusou o orçamento {details}",
  "work.created": "Obra aberta: {details}",
  "work.status_changed": "{actor} alterou o estado da obra #{id} — {details}",
  "work.dates_changed": "{actor} atualizou as datas da obra #{id} — {details}",
  "work.update_added": "{actor} publicou uma atualização na obra #{id} — {details}",
};

export function describeActivity(entry: ActivityEntry) {
  return templates[entry.action]
    .replace("{actor}", entry.actor_name ?? "Sistema")
    .replace("{client}", entry.client_name ?? "cliente")
    .replace("{details}", entry.details ?? "")
    .replace("{id}", String(entry.entity_id ?? ""))
    .replace(/\s+—\s*$/, "");
}

export function activityHref(entry: Pick<ActivityEntry, "entity" | "entity_id" | "client_id">) {
  if (!entry.entity_id) return entry.client_id ? `/admin/clientes/${entry.client_id}` : null;
  switch (entry.entity) {
    case "request":
      return `/admin/pedidos/${entry.entity_id}`;
    case "quote":
      return `/admin/orcamentos/${entry.entity_id}`;
    case "work":
      return `/admin/obras/${entry.entity_id}`;
    case "user":
      return `/admin/clientes/${entry.entity_id}`;
    default:
      return null;
  }
}

/** Normalises a phone number for wa.me links (Portuguese numbers get +351). */
export function whatsappNumberFor(phone: string | null | undefined) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.slice(1);
  if (digits.startsWith("00")) return digits.slice(2);
  if (/^[29]\d{8}$/.test(digits)) return `351${digits}`;
  return digits || null;
}
