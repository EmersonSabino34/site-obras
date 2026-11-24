import type { Tone } from "@/lib/admin/labels";

const tones: Record<Tone, string> = {
  orange: "bg-brand-100 text-brand-700 ring-brand-500/30",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
  navy: "bg-navy-900 text-white ring-navy-900",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/25",
};

export function StatusBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}
