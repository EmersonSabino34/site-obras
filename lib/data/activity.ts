import "server-only";

import { query, run } from "@/lib/db";

export type ActivityAction =
  | "client.registered"
  | "client.created_by_admin"
  | "client.profile_updated"
  | "client.password_changed"
  | "client.password_reset"
  | "client.deactivated"
  | "client.reactivated"
  | "request.created"
  | "request.status_changed"
  | "quote.created"
  | "quote.updated"
  | "quote.sent"
  | "quote.withdrawn"
  | "quote.cancelled"
  | "quote.viewed"
  | "quote.accepted"
  | "quote.rejected"
  | "work.created"
  | "work.status_changed"
  | "work.dates_changed"
  | "work.update_added";

export type ActivityEntry = {
  id: number;
  action: ActivityAction;
  entity: string | null;
  entity_id: number | null;
  details: string | null;
  created_at: string;
  actor_id: number | null;
  actor_name: string | null;
  actor_role: string | null;
  client_id: number | null;
  client_name: string | null;
};

export async function logActivity(entry: {
  actorId?: number | null;
  clientId?: number | null;
  action: ActivityAction;
  entity?: "user" | "request" | "quote" | "work";
  entityId?: number;
  details?: string;
}) {
  await run(
    "INSERT INTO activity (actor_id, client_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
    [
      entry.actorId ?? null,
      entry.clientId ?? null,
      entry.action,
      entry.entity ?? null,
      entry.entityId ?? null,
      entry.details ?? null,
    ],
  );
}

export async function listActivity(options: { clientId?: number; limit?: number; action?: string } = {}) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (options.clientId) {
    where.push("a.client_id = ?");
    args.push(options.clientId);
  }
  if (options.action) {
    where.push("a.action LIKE ?");
    args.push(`${options.action}.%`);
  }
  args.push(options.limit ?? 50);
  return query<ActivityEntry>(
    `SELECT a.id, a.action, a.entity, a.entity_id, a.details, a.created_at,
            a.actor_id, actor.name AS actor_name, actor.role AS actor_role,
            a.client_id, client.name AS client_name
       FROM activity a
       LEFT JOIN users actor ON actor.id = a.actor_id
       LEFT JOIN users client ON client.id = a.client_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT ?`,
    args,
  );
}
