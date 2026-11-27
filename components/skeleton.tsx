/** Loading placeholder shown while personal data streams in. */
export function PageSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse space-y-6">
      <div className="h-10 w-full max-w-md rounded-lg bg-slate-200 dark:bg-white/10" />
      <div className="h-5 w-full max-w-lg rounded bg-slate-200 dark:bg-white/10" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-white/10" />
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-white/10" />
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-white/10" />
    </div>
  );
}
