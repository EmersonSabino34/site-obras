export type RequestStatus = "novo" | "em_analise" | "orcamentado" | "arquivado";
export type QuoteStatus = "rascunho" | "enviado" | "aceite" | "recusado" | "cancelado";
/** Status as shown to people: an "enviado" quote past its validity date is "expirado". */
export type QuoteDisplayStatus = QuoteStatus | "expirado";
export type WorkStatus = "por_iniciar" | "em_curso" | "concluida" | "cancelada";

export const REQUEST_STATUSES: RequestStatus[] = ["novo", "em_analise", "orcamentado", "arquivado"];
export const QUOTE_STATUSES: QuoteStatus[] = ["rascunho", "enviado", "aceite", "recusado", "cancelado"];
export const WORK_STATUSES: WorkStatus[] = ["por_iniciar", "em_curso", "concluida", "cancelada"];

export const UNITS = ["un", "m2", "ml", "m3", "h", "dia", "vg"] as const;
export type Unit = (typeof UNITS)[number];

export const VAT_RATES = [23, 13, 6, 0] as const;

export type User = {
  id: number;
  role: "client" | "admin";
  name: string;
  email: string;
  phone: string | null;
  client_type: string | null;
  company: string | null;
  nif: string | null;
  city: string | null;
  address: string | null;
  locale: string;
  active: number;
  must_change_password: number;
  created_at: string;
  last_login_at: string | null;
};

export type ServiceRequest = {
  id: number;
  user_id: number;
  service: string;
  location: string | null;
  description: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
};

export type Quote = {
  id: number;
  number: string;
  user_id: number;
  request_id: number | null;
  title: string;
  location: string | null;
  notes: string | null;
  vat_rate: number;
  subtotal_cents: number;
  vat_cents: number;
  total_cents: number;
  valid_until: string | null;
  status: QuoteStatus;
  sent_at: string | null;
  viewed_at: string | null;
  decided_at: string | null;
  decision_note: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteItem = {
  id: number;
  quote_id: number;
  position: number;
  description: string;
  quantity: number;
  unit: Unit;
  unit_price_cents: number;
};

export type Work = {
  id: number;
  quote_id: number | null;
  user_id: number;
  title: string;
  location: string | null;
  status: WorkStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkUpdate = {
  id: number;
  work_id: number;
  author_id: number | null;
  message: string;
  visible_to_client: number;
  created_at: string;
};

/** Client columns added to admin listings. */
export type WithClient = { client_name: string; client_email: string };
