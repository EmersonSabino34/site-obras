import Link from "next/link";

import { activityHref, describeActivity } from "@/lib/admin/labels";
import type { ActivityEntry } from "@/lib/data/activity";
import { formatDateTime } from "@/lib/format";

const dot: Record<string, string> = {
  user: "bg-sky-500",
  request: "bg-brand-500",
  quote: "bg-violet-500",
  work: "bg-emerald-500",
};

export function ActivityFeed({ entries, empty = "Ainda não há atividade." }: { entries: ActivityEntry[]; empty?: string }) {
  if (entries.length === 0) return <p className="py-6 text-center text-sm text-slate-500">{empty}</p>;

  return (
    <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-slate-200">
      {entries.map((entry) => {
        const href = activityHref(entry);
        const text = describeActivity(entry);
        const highlight = entry.action === "quote.accepted" || entry.action === "request.created";
        return (
          <li key={entry.id} className="relative flex gap-4 pl-0">
            <span
              aria-hidden="true"
              className={`relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-white ${dot[entry.entity ?? ""] ?? "bg-slate-400"}`}
            />
            <div className="min-w-0 text-sm">
              {href ? (
                <Link
                  href={href}
                  className={`hover:text-brand-700 hover:underline ${highlight ? "font-semibold text-navy-900" : "text-slate-700"}`}
                >
                  {text}
                </Link>
              ) : (
                <span className="text-slate-700">{text}</span>
              )}
              <p className="mt-0.5 text-xs text-slate-500">
                {formatDateTime(entry.created_at)}
                {entry.actor_role === "admin" ? " · equipa" : entry.actor_role === "client" ? " · cliente" : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
