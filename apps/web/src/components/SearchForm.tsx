'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { findAirport } from '../data/airports';
import { apiFetch } from '../lib/api';
import type { NormalizedOffer } from '../lib/flight';
import {
  flightSearchCacheKey,
  useLiveFlightSearchStore,
  useSearchStore,
  type SearchDraft,
} from '../lib/stores';
import { AirportCombobox } from './AirportCombobox';
import { DateRangeField } from './DateRangeField';
import { PassengerSelector, type Passengers } from './PassengerSelector';
import { SearchFormSkeleton } from './SearchFormSkeleton';

type ActivePanel = 'origin' | 'destination' | 'dates' | 'passengers' | null;

export type SearchFormParams = {
  from?: string;
  to?: string;
  depart?: string;
  return?: string;
  trip?: string;
  adults?: string;
  children?: string;
  infants?: string;
  cabin?: string;
};

type FormValues = {
  tripType: 'return' | 'oneway';
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  passengers: Passengers;
};

type Cabin = Passengers['cabin'];

const today = new Date().toISOString().slice(0, 10);
const cabins: Cabin[] = ['economy', 'premium_economy', 'business', 'first'];

const emptyFormValues: FormValues = {
  tripType: 'return',
  origin: '',
  destination: '',
  departDate: '',
  returnDate: '',
  passengers: { adults: 1, children: 0, infants: 0, cabin: 'economy' },
};

function airportRule(label: string) {
  return {
    required: `Select a ${label.toLowerCase()} airport`,
    validate: (value: string) =>
      Boolean(findAirport(value)) || `Choose a valid ${label.toLowerCase()} from the list`,
  };
}

function parseCabin(value?: string): Cabin {
  return cabins.includes(value as Cabin) ? (value as Cabin) : 'economy';
}

function draftToForm(draft: SearchDraft): FormValues {
  let departDate = draft.departDate && draft.departDate >= today ? draft.departDate : '';
  let returnDate = draft.returnDate && draft.returnDate >= today ? draft.returnDate : '';
  if (departDate && returnDate && returnDate < departDate) returnDate = '';

  return {
    tripType: draft.tripType,
    origin: findAirport(draft.origin) ? draft.origin : '',
    destination: findAirport(draft.destination) ? draft.destination : '',
    departDate,
    returnDate: draft.tripType === 'return' ? returnDate : '',
    passengers: {
      adults: draft.adults,
      children: draft.children,
      infants: draft.infants,
      cabin: draft.cabin,
    },
  };
}

/** URL fields override remembered draft; missing URL fields keep the draft. */
function mergeFormValues(draft: SearchDraft, params?: SearchFormParams | null): FormValues {
  const remembered = draftToForm(draft);
  if (!params) return remembered;

  const from = (params.from ?? '').toUpperCase();
  const to = (params.to ?? '').toUpperCase();
  const tripType = params.trip
    ? params.trip === 'oneway'
      ? 'oneway'
      : 'return'
    : remembered.tripType;

  const departDate = params.depart
    ? params.depart >= today
      ? params.depart
      : ''
    : remembered.departDate;
  let returnDate = params.return
    ? params.return >= today
      ? params.return
      : ''
    : remembered.returnDate;
  if (tripType === 'oneway') returnDate = '';
  else if (departDate && returnDate && returnDate < departDate) returnDate = '';

  return {
    tripType,
    origin: params.from != null && params.from !== '' ? (findAirport(from) ? from : '') : remembered.origin,
    destination:
      params.to != null && params.to !== '' ? (findAirport(to) ? to : '') : remembered.destination,
    departDate,
    returnDate,
    passengers: {
      adults:
        params.adults != null
          ? Math.min(9, Math.max(1, Number(params.adults) || 1))
          : remembered.passengers.adults,
      children:
        params.children != null
          ? Math.min(8, Math.max(0, Number(params.children) || 0))
          : remembered.passengers.children,
      infants:
        params.infants != null
          ? Math.min(4, Math.max(0, Number(params.infants) || 0))
          : remembered.passengers.infants,
      cabin: params.cabin != null ? parseCabin(params.cabin) : remembered.passengers.cabin,
    },
  };
}

export function buildSearchQuery(v: FormValues): string | null {
  if (!findAirport(v.origin) || !findAirport(v.destination)) return null;
  if (v.origin === v.destination) return null;
  if (!v.departDate) return null;
  if (v.tripType === 'return') {
    if (!v.returnDate || v.returnDate < v.departDate) return null;
  }

  const params = new URLSearchParams({
    from: v.origin,
    to: v.destination,
    depart: v.departDate,
    adults: String(v.passengers.adults),
    children: String(v.passengers.children),
    infants: String(v.passengers.infants),
    cabin: v.passengers.cabin,
    trip: v.tripType,
  });
  if (v.tripType === 'return' && v.returnDate) params.set('return', v.returnDate);
  return params.toString();
}

function SearchSubmitButton({
  busy = false,
  disabled = false,
  type = 'submit',
}: {
  busy?: boolean;
  disabled?: boolean;
  type?: 'submit' | 'button';
}) {
  return (
    <button
      type={type}
      disabled={disabled || busy}
      className={`search-submit${busy ? ' is-searching' : ''}`}
      tabIndex={type === 'button' ? -1 : undefined}
      aria-busy={busy || undefined}
    >
      <span className="search-submit-mark" aria-hidden="true">
        <svg className="search-submit-arc" viewBox="0 0 24 24" fill="none">
          <path
            d="M3.2 15c3.4-4.6 9-6.8 14.2-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="2.75 3.5"
          />
        </svg>
        <svg className="search-submit-plane" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2h0A1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16Z" />
        </svg>
      </span>
      <span className="search-submit-label">{busy ? 'Searching…' : 'Search flights'}</span>
    </button>
  );
}

function SearchFormRestoring() {
  return <SearchFormSkeleton label="Restoring your last search…" />;
}

export function SearchForm({ initialParams }: { initialParams?: SearchFormParams }) {
  const router = useRouter();
  const setDraft = useSearchStore((state) => state.setDraft);
  const setSearching = useSearchStore((state) => state.setSearching);
  const isSearching = useSearchStore((state) => state.isSearching);
  const hasHydrated = useSearchStore((state) => state.hasHydrated);
  const setLiveResults = useLiveFlightSearchStore((state) => state.setResults);
  const requestReveal = useLiveFlightSearchStore((state) => state.requestReveal);
  const [baseline, setBaseline] = useState<FormValues | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  /** Open/close a panel without letting another panel's dismiss wipe the new one. */
  function setPanelOpen(panel: Exclude<ActivePanel, null>, next: boolean) {
    setActivePanel((current) => {
      if (next) return panel;
      return current === panel ? null : current;
    });
  }

  const paramsKey = [
    initialParams?.from,
    initialParams?.to,
    initialParams?.depart,
    initialParams?.return,
    initialParams?.trip,
    initialParams?.adults,
    initialParams?.children,
    initialParams?.infants,
    initialParams?.cabin,
  ].join('|');

  // Seed once from remembered draft + page params (URL wins when present).
  useEffect(() => {
    if (!hasHydrated) return;
    setBaseline(mergeFormValues(useSearchStore.getState(), initialParams));
  }, [hasHydrated, paramsKey, initialParams]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    values: baseline ?? emptyFormValues,
    defaultValues: emptyFormValues,
  });

  const formValues = watch();
  const tripType = formValues.tripType;
  const departDate = formValues.departDate;
  const busy = isSubmitting || isSearching;
  const hasErrors = Object.keys(errors).length > 0;

  // Safety net: don't leave the button stuck on "Searching…" if a request hangs.
  useEffect(() => {
    if (!isSearching) return;
    const timer = window.setTimeout(() => setSearching(false), 12_000);
    return () => window.clearTimeout(timer);
  }, [isSearching, setSearching]);

  function syncStore(v: FormValues) {
    setDraft({
      tripType: v.tripType,
      origin: v.origin,
      destination: v.destination,
      departDate: v.departDate,
      returnDate: v.tripType === 'return' ? v.returnDate : '',
      adults: v.passengers.adults,
      children: v.passengers.children,
      infants: v.passengers.infants,
      cabin: v.passengers.cabin,
    });
  }

  // Persist edits without feeding the store back into the form (avoids loops).
  useEffect(() => {
    if (!hasHydrated || !baseline) return;
    syncStore(formValues);
  }, [
    hasHydrated,
    baseline,
    formValues.tripType,
    formValues.origin,
    formValues.destination,
    formValues.departDate,
    formValues.returnDate,
    formValues.passengers.adults,
    formValues.passengers.children,
    formValues.passengers.infants,
    formValues.passengers.cabin,
    setDraft,
  ]);

  async function navigateSearch(query: string, v: FormValues) {
    syncStore(v);
    const href = `/flights/search?${query}`;
    const current =
      typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : '';

    const request = {
      origin: v.origin,
      destination: v.destination,
      departDate: v.departDate,
      returnDate: v.tripType === 'return' ? v.returnDate || undefined : undefined,
      adults: v.passengers.adults,
      children: v.passengers.children,
      infants: v.passengers.infants,
      cabin: v.passengers.cabin,
    };
    const cacheKey = flightSearchCacheKey(request);

    searchAbortRef.current?.abort();
    const abort = new AbortController();
    searchAbortRef.current = abort;

    setSearchError(null);
    setSearching(true);

    try {
      const data = await apiFetch<{ results: NormalizedOffer[] }>('/api/flights/search', {
        method: 'POST',
        body: JSON.stringify(request),
        signal: abort.signal,
      });
      if (abort.signal.aborted) return;

      setLiveResults(cacheKey, data.results);

      // Short beat so the button animation can settle before we glide to results.
      await new Promise((r) => window.setTimeout(r, 180));
      if (abort.signal.aborted) return;

      // Arm reveal before navigation so the results page can pick it up on mount.
      requestReveal(cacheKey);
      setSearching(false);

      // Already on this results URL — reveal handler scrolls smoothly in place.
      if (current === href) return;

      router.push(href);
    } catch (err) {
      if (abort.signal.aborted) return;
      if (err instanceof Error && err.name === 'AbortError') return;
      setSearching(false);
      setSearchError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    }
  }

  function swap() {
    const o = getValues('origin');
    const d = getValues('destination');
    setValue('origin', d, { shouldValidate: hasErrors });
    setValue('destination', o, { shouldValidate: hasErrors });
  }

  function datesIncomplete(v: FormValues) {
    return !v.departDate || (v.tripType === 'return' && !v.returnDate);
  }

  function openNextPanel(from: Exclude<ActivePanel, null>) {
    // Defer so the closing popover doesn't steal focus from the next one.
    window.setTimeout(() => {
      const v = getValues();
      if (from === 'origin') {
        if (!v.destination) {
          setActivePanel('destination');
          return;
        }
        if (datesIncomplete(v)) {
          setActivePanel('dates');
          return;
        }
        setActivePanel(null);
        return;
      }
      if (from === 'destination') {
        if (datesIncomplete(v)) {
          setActivePanel('dates');
          return;
        }
        setActivePanel(null);
        return;
      }
      if (from === 'dates') {
        setActivePanel('passengers');
        return;
      }
      setActivePanel(null);
    }, 120);
  }

  function onSubmit(v: FormValues) {
    const query = buildSearchQuery(v);
    if (!query) return;
    navigateSearch(query, v);
  }

  // Show per-field skeletons while restoring remembered draft / URL params.
  if (!hasHydrated || !baseline) {
    return <SearchFormRestoring />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="search-form"
      noValidate
    >
      <Controller
        control={control}
        name="tripType"
        render={({ field }) => (
          <div
            className={`trip-type-toggle${field.value === 'oneway' ? ' is-oneway' : ' is-return'}`}
            role="group"
            aria-label="Trip type"
          >
            <span className="trip-type-pill" aria-hidden="true" />
            {(['return', 'oneway'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  field.onChange(t);
                  if (t === 'oneway') {
                    setValue('returnDate', '', { shouldValidate: false, shouldDirty: true });
                    clearErrors('returnDate');
                  }
                }}
                className={`trip-type-btn${field.value === t ? ' is-active' : ''}`}
                aria-pressed={field.value === t}
              >
                {t === 'return' ? 'Return' : 'One way'}
              </button>
            ))}
          </div>
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2.7fr)_minmax(0,1.6fr)_minmax(0,1.15fr)] lg:items-start">
        <div className="search-route-pair min-w-0 sm:col-span-2 lg:col-span-1">
          <div className="search-route-from min-w-0">
            <Controller
              control={control}
              name="origin"
              rules={airportRule('From')}
              render={({ field }) => (
                <AirportCombobox
                  label="From"
                  value={field.value}
                  onChange={field.onChange}
                  icon="🛫"
                  error={errors.origin?.message}
                  open={activePanel === 'origin'}
                  onOpenChange={(next) => setPanelOpen('origin', next)}
                  onSelected={() => openNextPanel('origin')}
                />
              )}
            />
          </div>

          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className="search-route-swap"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="search-route-swap-icon">
              <path
                d="M4 9h13.5M14 5.5 17.5 9 14 12.5M20 15H6.5M10 11.5 6.5 15 10 18.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="search-route-to min-w-0">
            <Controller
              control={control}
              name="destination"
              rules={{
                ...airportRule('To'),
                validate: (value) => {
                  if (!findAirport(value)) return 'Choose a valid destination from the list';
                  if (value === getValues('origin')) return 'Destination must be different from origin';
                  return true;
                },
              }}
              render={({ field }) => (
                <AirportCombobox
                  label="To"
                  value={field.value}
                  onChange={field.onChange}
                  icon="🛬"
                  error={errors.destination?.message}
                  open={activePanel === 'destination'}
                  onOpenChange={(next) => setPanelOpen('destination', next)}
                  onSelected={() => openNextPanel('destination')}
                />
              )}
            />
          </div>
        </div>

        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <Controller
            control={control}
            name="departDate"
            rules={{ required: 'Select a departure date' }}
            render={({ field }) => (
              <Controller
                control={control}
                name="returnDate"
                rules={{
                  validate: (value, values) => {
                    if (values.tripType !== 'return') return true;
                    if (!value) return 'Select a return date';
                    if (values.departDate && value < values.departDate) {
                      return 'Return date must be on or after departure';
                    }
                    return true;
                  },
                }}
                render={({ field: returnField }) => (
                  <DateRangeField
                    mode={tripType}
                    departDate={field.value}
                    returnDate={tripType === 'return' ? returnField.value : ''}
                    onDepartChange={field.onChange}
                    onReturnChange={(iso) => {
                      returnField.onChange(tripType === 'return' ? iso : '');
                      if (tripType !== 'return') clearErrors('returnDate');
                    }}
                    min={today}
                    departError={errors.departDate?.message}
                    returnError={
                      tripType === 'return' ? errors.returnDate?.message : undefined
                    }
                    open={activePanel === 'dates'}
                    onOpenChange={(next) => setPanelOpen('dates', next)}
                    onComplete={() => openNextPanel('dates')}
                  />
                )}
              />
            )}
          />
        </div>

        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <Controller
            control={control}
            name="passengers"
            render={({ field }) => (
              <PassengerSelector
                value={field.value}
                onChange={field.onChange}
                open={activePanel === 'passengers'}
                onOpenChange={(next) => setPanelOpen('passengers', next)}
              />
            )}
          />
        </div>
      </div>

      {hasErrors ? (
        <p className="form-alert form-alert-error" role="alert">
          <svg className="form-alert-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.75v4.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="8" cy="11.15" r="0.85" fill="currentColor" />
          </svg>
          <span>Check the highlighted fields, then search again.</span>
        </p>
      ) : null}

      {searchError ? (
        <p className="form-alert form-alert-error" role="alert">
          <svg className="form-alert-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.75v4.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="8" cy="11.15" r="0.85" fill="currentColor" />
          </svg>
          <span>{searchError}</span>
        </p>
      ) : null}

      <SearchSubmitButton busy={busy} />
    </form>
  );
}
