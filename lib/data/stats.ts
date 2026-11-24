import "server-only";

import { first } from "@/lib/db";
import { todayLisbon } from "@/lib/format";

export type DashboardStats = {
  requests_new: number;
  requests_review: number;
  quotes_draft: number;
  quotes_waiting: number;
  quotes_expired: number;
  quotes_accepted: number;
  quotes_rejected: number;
  accepted_total_cents: number;
  accepted_year_cents: number;
  pipeline_cents: number;
  works_pending: number;
  works_active: number;
  works_done: number;
  clients_total: number;
  clients_new_30d: number;
};

export async function getDashboardStats() {
  const today = todayLisbon();
  const yearStart = `${today.slice(0, 4)}-01-01`;
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const stats = await first<DashboardStats>(
    `SELECT
       (SELECT COUNT(*) FROM requests WHERE status = 'novo') AS requests_new,
       (SELECT COUNT(*) FROM requests WHERE status = 'em_analise') AS requests_review,
       (SELECT COUNT(*) FROM quotes WHERE status = 'rascunho') AS quotes_draft,
       (SELECT COUNT(*) FROM quotes WHERE status = 'enviado' AND (valid_until IS NULL OR valid_until >= ?)) AS quotes_waiting,
       (SELECT COUNT(*) FROM quotes WHERE status = 'enviado' AND valid_until < ?) AS quotes_expired,
       (SELECT COUNT(*) FROM quotes WHERE status = 'aceite') AS quotes_accepted,
       (SELECT COUNT(*) FROM quotes WHERE status = 'recusado') AS quotes_rejected,
       (SELECT COALESCE(SUM(total_cents), 0) FROM quotes WHERE status = 'aceite') AS accepted_total_cents,
       (SELECT COALESCE(SUM(total_cents), 0) FROM quotes WHERE status = 'aceite' AND decided_at >= ?) AS accepted_year_cents,
       (SELECT COALESCE(SUM(total_cents), 0) FROM quotes WHERE status = 'enviado' AND (valid_until IS NULL OR valid_until >= ?)) AS pipeline_cents,
       (SELECT COUNT(*) FROM works WHERE status = 'por_iniciar') AS works_pending,
       (SELECT COUNT(*) FROM works WHERE status = 'em_curso') AS works_active,
       (SELECT COUNT(*) FROM works WHERE status = 'concluida') AS works_done,
       (SELECT COUNT(*) FROM users WHERE role = 'client') AS clients_total,
       (SELECT COUNT(*) FROM users WHERE role = 'client' AND created_at >= ?) AS clients_new_30d`,
    [today, today, yearStart, today, monthAgo],
  );
  return stats!;
}
