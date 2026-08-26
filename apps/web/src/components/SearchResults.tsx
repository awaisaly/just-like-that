'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Popover from '@radix-ui/react-popover';
import { formatMoney } from '@jlt/shared';
import { apiFetch } from '../lib/api';
import { airlineDisplayName } from '../lib/airline';
import type { NormalizedOffer, NormalizedSegment, TravellerSummary } from '../lib/flight';
import { isMockOfferId } from '../lib/flight';
import { INSTALMENTS_HREF, instalmentCopy } from '../lib/instalments';
import {
  flightSearchCacheKey,
  useCheckoutStore,
  useLiveFlightSearchStore,
  useResultsFilterStore,
  useSearchStore,
} from '../lib/stores';
import { AirlineLogoStack } from './AirlineLogo';
import { FlexibleDatesBar } from './FlexibleDatesBar';
import {
  DesktopFlightFilters,
  MobileFlightFilters,
  countActiveFilters,
  draftFromFilters,
  emptyFilters,
  filtersFromDraft,
  offerMatchesFilters,
  type Filters,
} from './FlightFilters';
import { FlightItinerary } from './FlightItinerary';

type SortKey = 'cheapest' | 'best' | 'fastest' | 'depart' | 'arrive' | 'stops';

const SORT_OPTIONS: {
  key: SortKey;
  title: string;
  shortTitle: string;
  description: string;
}[] = [
  {
    key: 'cheapest',
    title: 'Price per person',
    shortTitle: 'Price',
    description: 'Cheapest first',
  },
  {
    key: 'best',
    title: 'Best',
    shortTitle: 'Best',
    description: 'Cheap short flights',
  },
  {
    key: 'fastest',
    title: 'Total journey time',
    shortTitle: 'Duration',
    description: 'Fastest first',
  },
  {
    key: 'depart',
    title: 'Departure time',
    shortTitle: 'Depart',
    description: 'Earliest first',
  },
  {
    key: 'arrive',
    title: 'Arrival time',
    shortTitle: 'Arrive',
    description: 'Earliest first',
  },
  {
    key: 'stops',
    title: 'Stops',
    shortTitle: 'Stops',
    description: 'Fewest stops first',
  },
];

const PAGE_SIZE = 8;

function airlineNamesFromOffers(offers: NormalizedOffer[]): Record<string, string> {
  const names: Record<string, string> = {};
  for (const offer of offers) {
    for (const slice of offer.slices) {
      for (const segment of slice.segments) {
        const code = segment.carrier.trim().toUpperCase();
        names[code] = airlineDisplayName(code, segment.carrierName);
      }
    }
  }
  return names;
}

function offerStops(o: NormalizedOffer): number {
  // Worst-leg stop count — used for ranking convenience like Booking/Agoda.
  return Math.max(0, ...o.slices.map((slice) => Math.max(0, slice.segments.length - 1)));
}
function sliceDuration(segments: NormalizedSegment[]): number {
  if (!segments.length) return 0;
  return Math.max(
    0,
    Math.round(
      (new Date(segments[segments.length - 1]!.arriveAt).getTime() -
        new Date(segments[0]!.departAt).getTime()) /
        60000,
    ),
  );
}
function offerDuration(o: NormalizedOffer): number {
  // Total journey time across all slices (outbound + return), like Booking/Agoda.
  return o.slices.reduce((sum, slice) => sum + sliceDuration(slice.segments), 0);
}

function offerDepartAt(o: NormalizedOffer): number {
  const first = o.slices[0]?.segments[0];
  return first ? new Date(first.departAt).getTime() : 0;
}

function offerArriveAt(o: NormalizedOffer): number {
  const segs = o.slices[0]?.segments ?? [];
  const last = segs[segs.length - 1];
  return last ? new Date(last.arriveAt).getTime() : 0;
}

function hasCheckedBag(o: NormalizedOffer): boolean {
  const checked = o.baggage.checked.toLowerCase();
  return Boolean(checked) && !checked.includes('not included') && !checked.includes('none') && !checked.includes('not specified');
}

function compareOffers(
  a: NormalizedOffer,
  b: NormalizedOffer,
  sort: SortKey,
  scoreOf: (offer: NormalizedOffer) => number,
): number {
  if (sort === 'cheapest') {
    const byPrice = a.price.total.amount - b.price.total.amount;
    if (byPrice !== 0) return byPrice;
    const byScore = scoreOf(a) - scoreOf(b);
    if (byScore !== 0) return byScore;
    return offerDuration(a) - offerDuration(b);
  }

  if (sort === 'fastest') {
    const byDuration = offerDuration(a) - offerDuration(b);
    if (byDuration !== 0) return byDuration;
    const byScore = scoreOf(a) - scoreOf(b);
    if (byScore !== 0) return byScore;
    return a.price.total.amount - b.price.total.amount;
  }

  if (sort === 'depart') {
    const byDepart = offerDepartAt(a) - offerDepartAt(b);
    if (byDepart !== 0) return byDepart;
    return a.price.total.amount - b.price.total.amount;
  }

  if (sort === 'arrive') {
    const byArrive = offerArriveAt(a) - offerArriveAt(b);
    if (byArrive !== 0) return byArrive;
    return a.price.total.amount - b.price.total.amount;
  }

  if (sort === 'stops') {
    const byStops = offerStops(a) - offerStops(b);
    if (byStops !== 0) return byStops;
    const byDuration = offerDuration(a) - offerDuration(b);
    if (byDuration !== 0) return byDuration;
    return a.price.total.amount - b.price.total.amount;
  }

  // Best: balance price, duration, stops and baggage (Booking-style default).
  const byScore = scoreOf(a) - scoreOf(b);
  if (byScore !== 0) return byScore;
  const byPrice = a.price.total.amount - b.price.total.amount;
  if (byPrice !== 0) return byPrice;
  return offerDuration(a) - offerDuration(b);
}

function createBestScorer(offers: NormalizedOffer[]) {
  if (!offers.length) return () => 0;

  const prices = offers.map((o) => o.price.total.amount);
  const durations = offers.map((o) => offerDuration(o));
  const stopsList = offers.map((o) => offerStops(o));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const maxStops = Math.max(...stopsList, 1);
  const priceSpan = Math.max(maxPrice - minPrice, 1);
  const durationSpan = Math.max(maxDuration - minDuration, 1);

  return (offer: NormalizedOffer) => {
    const priceNorm = (offer.price.total.amount - minPrice) / priceSpan;
    const durationNorm = (offerDuration(offer) - minDuration) / durationSpan;
    const stopsNorm = offerStops(offer) / maxStops;
    const baggagePenalty = hasCheckedBag(offer) ? 0 : 0.08;
    const flexibilityBonus =
      (offer.conditions.changeable ? -0.03 : 0) + (offer.conditions.refundable ? -0.02 : 0);

    return (
      priceNorm * 0.45 +
      durationNorm * 0.35 +
      stopsNorm * 0.12 +
      baggagePenalty +
      flexibilityBonus
    );
  };
}
function stopCities(segments: NormalizedSegment[]): string[] {
  return segments.slice(0, -1).map((s) => s.destination);
}
function departHour(o: NormalizedOffer): number {
  const s = o.slices[0]?.segments[0];
  return s ? new Date(s.departAt).getHours() : 0;
}
function fmtDuration(min: number): string {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
function cabinLabel(cabin: string): string {
  return cabin
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function offerCarriers(o: NormalizedOffer): string[] {
  return [
    ...new Set(o.slices.flatMap((slice) => slice.segments.map((segment) => segment.carrier))),
  ];
}

function arriveHour(o: NormalizedOffer): number {
  const segs = o.slices[0]?.segments ?? [];
  const last = segs[segs.length - 1];
  return last ? new Date(last.arriveAt).getHours() : 0;
}

function matchesFilters(o: NormalizedOffer, filters: Filters) {
  return offerMatchesFilters(o, filters, {
    offerStops,
    offerCarriers,
    offerDuration,
    departHour,
    arriveHour,
    hasCheckedBag,
  });
}

function ResultsListSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-live="polite">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-2xl border border-line bg-white"
        />
      ))}
    </div>
  );
}

function SortByMenu({
  sort,
  onChange,
  disabled,
}: {
  sort: SortKey;
  onChange: (sort: SortKey) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const active = SORT_OPTIONS.find((option) => option.key === sort) ?? SORT_OPTIONS[1]!;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`sort-by-trigger${open ? ' is-open' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Sort by: ${active.title}`}
        >
          <span className="sort-by-trigger-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none">
              <path
                d="M3 4.5h10M5 8h6M6.5 11.5h3"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="sort-by-trigger-copy">
            <span className="sort-by-trigger-label">Sort by</span>
            <span className="sort-by-trigger-value">{active.shortTitle}</span>
          </span>
          <svg
            className={`sort-by-chevron${open ? ' is-open' : ''}`}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 10.5 8 6.5l4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="sort-by-menu"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Popover.Arrow className="sort-by-arrow" />
          <div role="listbox" aria-label="Sort flights by">
            {SORT_OPTIONS.map((option) => {
              const selected = option.key === sort;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`sort-by-option${selected ? ' is-selected' : ''}`}
                  onClick={() => {
                    onChange(option.key);
                    setOpen(false);
                  }}
                >
                  <span className="sort-by-option-check" aria-hidden="true">
                    {selected ? (
                      <svg viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3.5 8.2 6.4 11l6.1-6.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                  <span className="sort-by-option-copy">
                    <span className="sort-by-option-title">{option.title}</span>
                    <span className="sort-by-option-desc">{option.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}


function OfferDetails({
  offer,
  refreshing,
}: {
  offer: NormalizedOffer;
  refreshing?: boolean;
}) {
  return (
    <div className="space-y-5 border-t border-line bg-surface/60 px-4 py-4 sm:px-5">
      {refreshing ? (
        <p className="m-0 text-xs font-semibold text-muted">Refreshing live fare details…</p>
      ) : null}

      {offer.slices.map((slice, sliceIndex) => {
        const segments = slice.segments;
        const stops = Math.max(0, segments.length - 1);
        const via = stopCities(segments);
        return (
          <section key={sliceIndex} className="rounded-2xl border border-line bg-white px-3 py-2 sm:px-4">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2 border-b border-line px-0.5 pb-2.5">
              <h3 className="m-0 text-sm font-bold text-brand-navy">
                {sliceIndex === 0 ? 'Outbound' : 'Return'}
              </h3>
              <p className="m-0 text-xs font-semibold text-muted">
                {fmtDuration(sliceDuration(segments))}
                {stops === 0
                  ? ' · Direct'
                  : ` · ${stops} stop${stops > 1 ? 's' : ''}${via.length ? ` via ${via.join(', ')}` : ''}`}
              </p>
            </div>
            <FlightItinerary segments={segments} cabinLabel={cabinLabel(offer.cabin)} />
          </section>
        );
      })}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">Baggage</p>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Cabin</dt>
              <dd className="m-0 font-semibold text-ink">{offer.baggage.carryOn}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Checked</dt>
              <dd className="m-0 font-semibold text-ink">{offer.baggage.checked}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-line bg-white p-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">
            Onboard
          </p>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Meal</dt>
              <dd className="m-0 text-right font-semibold text-ink">
                {offer.amenities?.meal.label ?? 'Not specified by airline'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Wi‑Fi</dt>
              <dd className="m-0 text-right font-semibold text-ink">
                {offer.amenities?.wifi.label ?? 'Not specified by airline'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Power</dt>
              <dd className="m-0 text-right font-semibold text-ink">
                {offer.amenities?.power.label ?? 'Not specified by airline'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Seat</dt>
              <dd className="m-0 text-right font-semibold text-ink">
                {offer.amenities?.seat.label ?? 'Not specified by airline'}
              </dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-line bg-white p-3 sm:col-span-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">Fare</p>
          <dl className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Cabin</dt>
              <dd className="m-0 font-semibold text-ink">{cabinLabel(offer.cabin)}</dd>
            </div>
            {offer.fareBrand ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Brand</dt>
                <dd className="m-0 font-semibold text-ink">{offer.fareBrand}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Changes</dt>
              <dd className="m-0 font-semibold text-ink">
                {offer.conditions.changeable ? 'Allowed' : 'Not allowed'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Refunds</dt>
              <dd className="m-0 font-semibold text-ink">
                {offer.conditions.refundable ? 'Allowed' : 'Not allowed'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-white p-3">
        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">Price breakdown</p>
        <dl className="mt-2 space-y-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Base fare</dt>
            <dd className="m-0 font-semibold text-ink">{formatMoney(offer.price.base)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Taxes & fees</dt>
            <dd className="m-0 font-semibold text-ink">{formatMoney(offer.price.taxes)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-line pt-1.5">
            <dt className="font-semibold text-ink">Total</dt>
            <dd className="m-0 font-bold text-brand-navy">{formatMoney(offer.price.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function OfferCard({
  offer,
  badges,
  onSelect,
}: {
  offer: NormalizedOffer;
  badges: Array<'best' | 'cheapest' | 'fastest'>;
  onSelect: (offer: NormalizedOffer) => void;
}) {
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsOffer, setDetailsOffer] = useState(offer);
  const hydratedIdRef = useRef<string | null>(
    isMockOfferId(offer.providerOfferId) ? offer.providerOfferId : null,
  );
  const offerId = offer.providerOfferId;

  // Sync from parent only when the result identity changes (new search).
  // Do not depend on the whole `offer` object — live detail refresh used to
  // push a new reference up, reset hydration, and collapse this panel.
  useEffect(() => {
    setDetailsOffer(offer);
    hydratedIdRef.current = isMockOfferId(offerId) ? offerId : null;
  }, [offerId]); // eslint-disable-line react-hooks/exhaustive-deps -- intentional

  useEffect(() => {
    if (!open || hydratedIdRef.current === offerId || isMockOfferId(offerId)) {
      return;
    }

    let cancelled = false;
    (async () => {
      setRefreshing(true);
      try {
        const data = await apiFetch<{ offer: NormalizedOffer }>(
          `/api/flights/offers/${encodeURIComponent(offerId)}`,
        );
        if (!cancelled) {
          setDetailsOffer(data.offer);
          hydratedIdRef.current = offerId;
        }
      } catch {
        // Keep search-time details if the live refresh fails or the offer expired.
        if (!cancelled) hydratedIdRef.current = offerId;
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, offerId]);

  const segs = detailsOffer.slices[0]?.segments ?? [];
  const first = segs[0];
  const last = segs[segs.length - 1];
  const stops = offerStops(detailsOffer);
  const via = stopCities(segs);
  const carriers = offerCarriers(detailsOffer);
  const carrierNames = airlineNamesFromOffers([detailsOffer]);
  const carrier = carriers[0] ?? first?.carrier ?? '';
  const hasReturn = (detailsOffer.slices.length ?? 0) > 1;

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="flex flex-1 items-center gap-4 p-4 sm:p-5">
          <AirlineLogoStack codes={carriers.length ? carriers : [carrier]} names={carrierNames} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-brand-navy">
                {first ? fmtTime(first.departAt) : ''}
              </span>
              <span className="flex flex-1 items-center gap-1 text-muted">
                <span className="h-px flex-1 bg-line" />
                <span className="whitespace-nowrap text-xs">
                  {fmtDuration(offerDuration(detailsOffer))}
                </span>
                <span className="h-px flex-1 bg-line" />
              </span>
              <span className="text-xl font-bold text-brand-navy">
                {last ? fmtTime(last.arriveAt) : ''}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">{first?.origin}</span>
              <span
                className={
                  stops === 0
                    ? 'text-xs font-semibold text-emerald-600'
                    : 'text-xs font-semibold text-muted'
                }
              >
                {stops === 0
                  ? 'Direct'
                  : `${stops} stop${stops > 1 ? 's' : ''}${via.length ? ` · ${via.join(', ')}` : ''}`}
              </span>
              <span className="font-semibold text-ink">{last?.destination}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {carriers.length > 1 ? (
                <span className="chip">
                  {carriers.map((code) => carrierNames[code] ?? airlineDisplayName(code)).join(' · ')}
                </span>
              ) : null}
              {detailsOffer.fareBrand ? <span className="chip">{detailsOffer.fareBrand}</span> : null}
              {hasReturn ? <span className="chip">Return</span> : null}
              {badges.includes('best') ? <span className="chip-deal">Best</span> : null}
              {badges.includes('cheapest') ? <span className="chip-deal">Cheapest</span> : null}
              {badges.includes('fastest') ? <span className="chip">Fastest</span> : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line bg-surface p-4 sm:w-56 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:p-5">
          <div className="text-right">
            <div className="price">{formatMoney(detailsOffer.price.total)}</div>
            <div className="text-xs text-muted">per adult · incl. taxes</div>
            <p className="instalment-price-note mt-1">or pay in instalments</p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white transition hover:bg-accent-dark"
            onClick={() => onSelect(detailsOffer)}
          >
            Select
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between border-t border-line px-4 py-2.5 text-left text-sm font-semibold text-brand transition hover:bg-chip sm:px-5"
      >
        <span>{open ? 'Hide flight details' : 'Flight details · meals · baggage'}</span>
        <span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open ? <OfferDetails offer={detailsOffer} refreshing={refreshing} /> : null}
    </article>
  );
}

export function SearchResults({
  from,
  to,
  depart,
  returnDate,
  adults,
  childrenCount = 0,
  infants = 0,
  cabin = 'economy',
  hideEmpty = false,
}: {
  from: string;
  to: string;
  depart?: string;
  returnDate?: string;
  adults: number;
  childrenCount?: number;
  infants?: number;
  cabin?: TravellerSummary['cabin'];
  /** When true, incomplete searches render nothing (page shows its own empty state). */
  hideEmpty?: boolean;
}) {
  const router = useRouter();
  const selectOffer = useCheckoutStore((s) => s.selectOffer);
  const setSearching = useSearchStore((s) => s.setSearching);
  const liveKey = useLiveFlightSearchStore((s) => s.key);
  const liveVersion = useLiveFlightSearchStore((s) => s.version);
  const filtersHydrated = useResultsFilterStore((s) => s.hasHydrated);
  const persistFilters = useResultsFilterStore((s) => s.setFilters);
  const storedMaxStops = useResultsFilterStore((s) => s.maxStops);
  const storedAirlines = useResultsFilterStore((s) => s.airlines);
  const storedMaxPrice = useResultsFilterStore((s) => s.maxPrice);
  const storedDepartWindows = useResultsFilterStore((s) => s.departWindows);
  const storedArriveWindows = useResultsFilterStore((s) => s.arriveWindows);
  const storedMaxDurationMin = useResultsFilterStore((s) => s.maxDurationMin);
  const storedBagsIncluded = useResultsFilterStore((s) => s.bagsIncluded);
  const storedFlexibleFares = useResultsFilterStore((s) => s.flexibleFares);

  const requestKey =
    from && to && depart
      ? flightSearchCacheKey({
          origin: from,
          destination: to,
          departDate: depart,
          returnDate: returnDate || undefined,
          adults,
          children: childrenCount,
          infants,
          cabin,
        })
      : null;

  const [results, setResults] = useState<NormalizedOffer[]>(() => {
    const live = useLiveFlightSearchStore.getState();
    if (requestKey && live.key === requestKey && live.results) return live.results;
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (!requestKey) return false;
    const live = useLiveFlightSearchStore.getState();
    if (live.key === requestKey && live.results) return false;
    return true;
  });
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<SortKey>('best');
  const [filters, setFiltersState] = useState<Filters>(emptyFilters());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreLockRef = useRef(false);
  const filtersReady = useRef(false);

  useEffect(() => {
    if (!filtersHydrated || filtersReady.current) return;
    setFiltersState(
      filtersFromDraft({
        maxStops: storedMaxStops,
        airlines: storedAirlines,
        maxPrice: storedMaxPrice,
        departWindows: storedDepartWindows,
        arriveWindows: storedArriveWindows ?? [],
        maxDurationMin: storedMaxDurationMin ?? null,
        bagsIncluded: storedBagsIncluded ?? false,
        flexibleFares: storedFlexibleFares ?? false,
      }),
    );
    filtersReady.current = true;
  }, [
    filtersHydrated,
    storedMaxStops,
    storedAirlines,
    storedMaxPrice,
    storedDepartWindows,
    storedArriveWindows,
    storedMaxDurationMin,
    storedBagsIncluded,
    storedFlexibleFares,
  ]);

  function setFilters(next: Filters) {
    setFiltersState(next);
    persistFilters(draftFromFilters(next));
  }

  useEffect(() => {
    if (!requestKey || !from || !to || !depart) {
      setLoading(false);
      setSearching(false);
      setResults([]);
      setVisibleCount(PAGE_SIZE);
      return;
    }

    // Prefer results prefetched by the search form — navigate only happens after these are ready.
    const live = useLiveFlightSearchStore.getState();
    if (live.key === requestKey && live.results) {
      setResults(live.results);
      setVisibleCount(PAGE_SIZE);
      setLoading(false);
      setSearching(false);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setSearching(true);
      setError(null);
      setVisibleCount(PAGE_SIZE);
      try {
        const data = await apiFetch<{ results: NormalizedOffer[] }>('/api/flights/search', {
          method: 'POST',
          body: JSON.stringify({
            origin: from,
            destination: to,
            departDate: depart,
            returnDate: returnDate || undefined,
            adults,
            children: childrenCount,
            infants,
            cabin,
          }),
        });
        if (!cancelled) {
          useLiveFlightSearchStore.getState().setResults(requestKey, data.results);
          setResults(data.results);
          setVisibleCount(PAGE_SIZE);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSearching(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      // Release the form button if this request is abandoned (Strict Mode / param change / leave page).
      setSearching(false);
    };
  }, [
    requestKey,
    from,
    to,
    depart,
    returnDate,
    adults,
    childrenCount,
    infants,
    cabin,
    liveKey,
    liveVersion,
    setSearching,
  ]);

  const airlines = useMemo(() => {
    const s = new Set<string>();
    results.forEach((o) => offerCarriers(o).forEach((code) => s.add(code)));
    return [...s].sort();
  }, [results]);
  const airlineNames = useMemo(() => airlineNamesFromOffers(results), [results]);

  const priceBounds = useMemo(() => {
    if (!results.length) return { min: 0, max: 1000 };
    const amounts = results.map((o) => o.price.total.amount);
    return { min: Math.min(...amounts), max: Math.max(...amounts) };
  }, [results]);

  const durationBounds = useMemo(() => {
    if (!results.length) return { min: 60, max: 24 * 60 };
    const durations = results.map((o) => offerDuration(o));
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    return {
      min: Math.max(30, Math.floor(min / 15) * 15),
      max: Math.max(min + 15, Math.ceil(max / 15) * 15),
    };
  }, [results]);

  const matched = useMemo(
    () => results.filter((o) => matchesFilters(o, filters)),
    [results, filters],
  );

  const scoreOf = useMemo(() => createBestScorer(matched), [matched]);

  const filtered = useMemo(() => {
    return [...matched].sort((a, b) => compareOffers(a, b, sort, scoreOf));
  }, [matched, sort, scoreOf]);

  const sortWinners = useMemo(() => {
    if (!matched.length) {
      return { best: null, cheapest: null, fastest: null };
    }
    const best = [...matched].sort((a, b) => compareOffers(a, b, 'best', scoreOf))[0]!;
    const cheapest = [...matched].sort((a, b) => compareOffers(a, b, 'cheapest', scoreOf))[0]!;
    const fastest = [...matched].sort((a, b) => compareOffers(a, b, 'fastest', scoreOf))[0]!;
    return { best, cheapest, fastest };
  }, [matched, scoreOf]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setLoadingMore(false);
  }, [sort, filters]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    if (!hasMore || loading) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingMoreLockRef.current) return;
        loadingMoreLockRef.current = true;
        setLoadingMore(true);
        window.setTimeout(() => {
          setVisibleCount((count) => count + PAGE_SIZE);
          loadingMoreLockRef.current = false;
          setLoadingMore(false);
        }, 180);
      },
      { root: null, rootMargin: '240px 0px', threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, visible.length]);

  if (!from || !to || !depart) {
    if (hideEmpty) return null;
    return (
      <div className="card text-center">
        <p className="m-0 font-semibold text-brand-navy">Ready when you are</p>
        <p className="mt-1 text-sm text-muted">
          Choose from, to, and a departure date, then tap Search flights.
        </p>
      </div>
    );
  }

  return (
    <div className="flights-results grid min-w-0 max-w-full items-start gap-5 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
      <div className="hidden min-w-0 lg:block">
        <DesktopFlightFilters
          filters={filters}
          setFilters={setFilters}
          airlines={airlines}
          airlineNames={airlineNames}
          priceBounds={priceBounds}
          durationBounds={durationBounds}
          loading={loading}
          matchCount={matched.length}
          onClear={() => setFilters(emptyFilters())}
        />
      </div>

      <div className="grid min-w-0 max-w-full gap-3">
        <div className="flights-results-promise">
          <div>
            <p className="m-0 text-sm font-extrabold text-brand-navy">
              <span className="text-accent">{instalmentCopy.motto}</span>
            </p>
            <p className="m-0 mt-0.5 text-xs text-muted">
              Select a fare, book with a UK agent — pay in instalments before you fly.
            </p>
          </div>
          <Link href={INSTALMENTS_HREF} className="flights-results-promise-cta">
            How it works →
          </Link>
        </div>

        {depart ? (
          <FlexibleDatesBar
            from={from}
            to={to}
            depart={depart}
            returnDate={returnDate}
            adults={adults}
            childrenCount={childrenCount}
            infants={infants}
            cabin={cabin}
            selectedCheapest={sortWinners.cheapest?.price.total ?? null}
            loading={loading}
          />
        ) : null}

        <div className="flights-results-toolbar">
          <div className="flex overflow-hidden rounded-xl border border-line bg-white">
            {(
              [
                { key: 'best', label: 'Best', offer: sortWinners.best },
                { key: 'cheapest', label: 'Cheapest', offer: sortWinners.cheapest },
                { key: 'fastest', label: 'Fastest', offer: sortWinners.fastest },
              ] as { key: SortKey; label: string; offer: NormalizedOffer | null }[]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSort(tab.key)}
                disabled={loading}
                className={`sort-tab ${sort === tab.key ? 'sort-tab-active' : 'text-muted'} disabled:cursor-wait`}
              >
                <span className="sort-tab-label">{tab.label}</span>
                {tab.offer ? (
                  <span className="sort-tab-meta">
                    {formatMoney(tab.offer.price.total)} · {fmtDuration(offerDuration(tab.offer))}
                  </span>
                ) : (
                  <span className="sort-tab-meta">{loading ? '…' : '—'}</span>
                )}
              </button>
            ))}
          </div>

          <SortByMenu sort={sort} onChange={setSort} disabled={loading} />
        </div>

        <MobileFlightFilters
          filters={filters}
          setFilters={setFilters}
          airlines={airlines}
          airlineNames={airlineNames}
          priceBounds={priceBounds}
          durationBounds={durationBounds}
          loading={loading}
          matchCount={matched.length}
          onClear={() => setFilters(emptyFilters())}
        />

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-700">{error}</p>
        ) : null}

        {loading ? (
          <>
            <p className="text-sm text-muted">Searching flights…</p>
            <ResultsListSkeleton />
          </>
        ) : (
          <>
            <div className="flights-results-meta">
              <p className="m-0 text-sm text-muted">
                Showing {visible.length} of {filtered.length} matching
                {filtered.length !== results.length ? ` · ${results.length} total` : ''}{' '}
                {results.length === 1 ? 'flight' : 'flights'}
                {' · '}
                {SORT_OPTIONS.find((option) => option.key === sort)?.title ?? 'Sorted'}
              </p>
              {countActiveFilters(filters) > 0 ? (
                <button
                  type="button"
                  className="flights-results-clear"
                  onClick={() => setFilters(emptyFilters())}
                >
                  Clear all filters
                  <span className="flights-results-clear-count">
                    {countActiveFilters(filters)}
                  </span>
                </button>
              ) : null}
            </div>

            {visible.map((offer) => {
              const badges: Array<'best' | 'cheapest' | 'fastest'> = [];
              if (sortWinners.best?.providerOfferId === offer.providerOfferId) {
                badges.push('best');
              }
              if (sortWinners.cheapest?.providerOfferId === offer.providerOfferId) {
                badges.push('cheapest');
              }
              if (sortWinners.fastest?.providerOfferId === offer.providerOfferId) {
                badges.push('fastest');
              }

              return (
                <OfferCard
                  key={offer.providerOfferId}
                  offer={offer}
                  badges={badges}
                  onSelect={(selected) => {
                    selectOffer(selected, {
                      adults,
                      children: childrenCount,
                      infants,
                      cabin,
                    });
                    router.push(`/flights/offers/${selected.providerOfferId}`);
                  }}
                />
              );
            })}

            {hasMore ? (
              <div ref={loadMoreRef} className="stack" aria-busy={loadingMore} aria-live="polite">
                {loadingMore ? (
                  <>
                    <div className="h-28 animate-pulse rounded-2xl border border-line bg-white" />
                    <div className="h-28 animate-pulse rounded-2xl border border-line bg-white" />
                  </>
                ) : (
                  <p className="py-2 text-center text-sm text-muted">Scroll for more flights</p>
                )}
              </div>
            ) : null}

            {!error && !filtered.length ? (
              <div className="card text-center text-muted">
                No flights match your filters.{' '}
                <button
                  type="button"
                  className="font-semibold text-brand hover:underline"
                  onClick={() => setFilters(emptyFilters())}
                >
                  Clear filters
                </button>
              </div>
            ) : !error && !hasMore && filtered.length ? (
              <p className="py-1 text-center text-sm text-muted">You’ve reached the end of results</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
