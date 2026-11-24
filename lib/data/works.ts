import "server-only";

import { first, nowIso, query, run } from "@/lib/db";

import type { WithClient, Work, WorkStatus, WorkUpdate } from "./types";

export type WorkRow = Work &
  WithClient & {
    quote_number: string | null;
    total_cents: number | null;
    updates_count: number;
    last_update_at: string | null;
  };

const WORK_ROW_SELECT = `
  SELECT w.*, u.name AS client_name, u.email AS client_email,
         q.number AS quote_number, q.total_cents,
         (SELECT COUNT(*) FROM work_updates wu WHERE wu.work_id = w.id) AS updates_count,
         (SELECT MAX(created_at) FROM work_updates wu WHERE wu.work_id = w.id) AS last_update_at
    FROM works w
    JOIN users u ON u.id = w.user_id
    LEFT JOIN quotes q ON q.id = w.quote_id`;

export function listWorks(status?: WorkStatus) {
  return query<WorkRow>(
    `${WORK_ROW_SELECT}
     ${status ? "WHERE w.status = ?" : ""}
     ORDER BY CASE w.status WHEN 'em_curso' THEN 0 WHEN 'por_iniciar' THEN 1 ELSE 2 END, w.updated_at DESC
     LIMIT 500`,
    status ? [status] : [],
  );
}

export function listWorksByUser(userId: number) {
  return query<WorkRow>(`${WORK_ROW_SELECT} WHERE w.user_id = ? ORDER BY w.created_at DESC`, [userId]);
}

export function getWork(id: number) {
  return first<WorkRow & { client_phone: string | null }>(
    `SELECT w.*, u.name AS client_name, u.email AS client_email, u.phone AS client_phone,
            q.number AS quote_number, q.total_cents,
            (SELECT COUNT(*) FROM work_updates wu WHERE wu.work_id = w.id) AS updates_count,
            (SELECT MAX(created_at) FROM work_updates wu WHERE wu.work_id = w.id) AS last_update_at
       FROM works w JOIN users u ON u.id = w.user_id LEFT JOIN quotes q ON q.id = w.quote_id
      WHERE w.id = ?`,
    [id],
  );
}

export function getWorkByQuote(quoteId: number) {
  return first<Work>("SELECT * FROM works WHERE quote_id = ?", [quoteId]);
}

export function listWorkUpdates(workId: number, onlyVisible = false) {
  return query<WorkUpdate & { author_name: string | null }>(
    `SELECT wu.*, u.name AS author_name FROM work_updates wu LEFT JOIN users u ON u.id = wu.author_id
      WHERE wu.work_id = ? ${onlyVisible ? "AND wu.visible_to_client = 1" : ""}
      ORDER BY wu.created_at DESC`,
    [workId],
  );
}

/** Works of a client with the updates they are allowed to see. */
export async function listWorksForClient(userId: number) {
  const works = await query<Work & { quote_number: string | null }>(
    `SELECT w.*, q.number AS quote_number FROM works w LEFT JOIN quotes q ON q.id = w.quote_id
      WHERE w.user_id = ? ORDER BY w.created_at DESC`,
    [userId],
  );
  return Promise.all(
    works.map(async (work) => ({ ...work, updates: await listWorkUpdates(work.id, true) })),
  );
}

export async function setWorkStatus(id: number, status: WorkStatus, today: string) {
  const { changes } = await run(
    `UPDATE works SET status = ?, updated_at = ?,
            start_date = CASE WHEN ? = 'em_curso' AND start_date IS NULL THEN ? ELSE start_date END,
            end_date   = CASE WHEN ? = 'concluida' AND end_date IS NULL THEN ? ELSE end_date END
      WHERE id = ? AND status != ?`,
    [status, nowIso(), status, today, status, today, id, status],
  );
  return changes > 0;
}

export async function setWorkDates(id: number, start: string | null, end: string | null) {
  await run("UPDATE works SET start_date = ?, end_date = ?, updated_at = ? WHERE id = ?", [
    start,
    end,
    nowIso(),
    id,
  ]);
}

export async function addWorkUpdate(workId: number, authorId: number, message: string, visible: boolean) {
  await run(
    "INSERT INTO work_updates (work_id, author_id, message, visible_to_client) VALUES (?, ?, ?, ?)",
    [workId, authorId, message, visible ? 1 : 0],
  );
  await run("UPDATE works SET updated_at = ? WHERE id = ?", [nowIso(), workId]);
}
