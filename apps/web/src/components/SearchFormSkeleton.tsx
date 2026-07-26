function SearchFieldSkeleton({
  label,
  wide = false,
}: {
  label: string;
  wide?: boolean;
}) {
  return (
    <div className="min-w-0" aria-hidden>
      <span className="field-label">{label}</span>
      <div className="control pointer-events-none border-line/80 bg-surface/40">
        <span className="h-5 w-5 shrink-0 animate-pulse rounded-md bg-line" />
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span
            className="h-3.5 animate-pulse rounded bg-line"
            style={{ width: wide ? '72%' : '58%' }}
          />
          <span className="h-2.5 w-2/5 animate-pulse rounded bg-line/80" />
        </span>
      </div>
    </div>
  );
}

export function SearchFormSkeleton({
  label = 'Loading search form…',
}: {
  label?: string;
}) {
  return (
    <div className="search-form" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="mb-4 inline-flex rounded-full bg-surface p-1">
        <span className="h-9 w-[4.75rem] animate-pulse rounded-full bg-line/90" />
        <span className="h-9 w-[4.75rem] animate-pulse rounded-full bg-line/70" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2.7fr)_minmax(0,1.6fr)_minmax(0,1.15fr)] lg:items-end">
        <div className="search-route-pair min-w-0 sm:col-span-2 lg:col-span-1">
          <div className="search-route-from min-w-0">
            <SearchFieldSkeleton label="From" />
          </div>
          <div className="search-route-swap-skel" aria-hidden />
          <div className="search-route-to min-w-0">
            <SearchFieldSkeleton label="To" />
          </div>
        </div>
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <SearchFieldSkeleton label="Dates" wide />
        </div>
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <SearchFieldSkeleton label="Travellers & cabin" />
        </div>
      </div>

      <button type="button" className="search-submit" disabled tabIndex={-1}>
        <span className="search-submit-label">Search flights</span>
      </button>
    </div>
  );
}
