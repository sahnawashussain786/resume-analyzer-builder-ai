export default function Spinner({ full = false, label }) {
  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
      {label && <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
  if (!full) return spinner;
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      {spinner}
    </div>
  );
}
