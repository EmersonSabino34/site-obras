import "server-only";

import { first, nowIso, query, run } from "@/lib/db";

import type { RequestStatus, ServiceRequest, WithClient } from "./types";

export async function createRequest(
  userId: number,
  input: { service: string; location: string | null; description: string },
) {
  const { id } = await run(
    "INSERT INTO requests (user_id, service, location, description) VALUES (?, ?, ?, ?)",
    [userId, input.service, input.location, input.description],
  );
  return id;
}

export function listRequestsForUser(userId: number) {
  return query<ServiceRequest>(
    "SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
  );
}

export type RequestRow = ServiceRequest & WithClient & { client_phone: string | null; quotes_count: number };

export function listRequests(status?: RequestStatus) {
  return query<RequestRow>(
    `SELECT r.*, u.name AS client_name, u.email AS client_email, u.phone AS client_phone,
            (SELECT COUNT(*) FROM quotes q WHERE q.request_id = r.id) AS quotes_count
       FROM requests r JOIN users u ON u.id = r.user_id
      ${status ? "WHERE r.status = ?" : ""}
      ORDER BY CASE r.status WHEN 'novo' THEN 0 WHEN 'em_analise' THEN 1 ELSE 2 END, r.created_at DESC
      LIMIT 500`,
    status ? [status] : [],
  );
}

export function getRequest(id: number) {
  return first<RequestRow>(
    `SELECT r.*, u.name AS client_name, u.email AS client_email, u.phone AS client_phone,
            (SELECT COUNT(*) FROM quotes q WHERE q.request_id = r.id) AS quotes_count
       FROM requests r JOIN users u ON u.id = r.user_id
      WHERE r.id = ?`,
    [id],
  );
}

export async function setRequestStatus(id: number, status: RequestStatus) {
  const { changes } = await run(
    "UPDATE requests SET status = ?, updated_at = ? WHERE id = ? AND status != ?",
    [status, nowIso(), id, status],
  );
  return changes > 0;
}
