export function AdminSearchForm({
  action,
  defaultValue = "",
  label = "Search",
  placeholder = "Search…",
  extra,
}: {
  action: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  extra?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} method="get" role="search" className="flex w-full gap-2">
      {Object.entries(extra ?? {}).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null,
      )}
      <label htmlFor={`search-${action}`} className="sr-only">
        {label}
      </label>
      <input
        id={`search-${action}`}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="block min-h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-emerald-500 focus:outline-none focus-visible:outline-focus"
      />
      <button
        type="submit"
        className="inline-flex min-h-10 flex-none items-center justify-center rounded-lg bg-emerald-700 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-focus"
      >
        {label}
      </button>
    </form>
  );
}
