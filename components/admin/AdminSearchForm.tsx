import { inputClass } from "@/components/ui/FormPrimitives";

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
    <form action={action} method="get" role="search" className="flex gap-2">
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
        className={`${inputClass} mt-0 max-w-sm`}
      />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-brand border border-gold/40 bg-champagne/[0.03] px-4 text-sm font-medium text-champagne transition-colors hover:border-gold hover:text-accent focus-visible:outline-focus"
      >
        {label}
      </button>
    </form>
  );
}
