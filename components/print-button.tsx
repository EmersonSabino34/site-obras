"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 px-4 py-2 text-sm font-semibold text-navy-900 dark:text-white transition-colors hover:border-navy-900 dark:hover:border-white/40 print:hidden"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-4" aria-hidden="true">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v8H6z" />
      </svg>
      {label}
    </button>
  );
}
