'use client';

import { useEffect, useId, useState } from 'react';
import { formatMoney } from '@jlt/shared';
import type { NormalizedOffer } from '../lib/flight';
import type { ResultsFilterDraft } from '../lib/stores';
import { AirlineLogo } from './AirlineLogo';
import { airlineDisplayName } from '../lib/airline';

export type Filters = {
  maxStops: number | null;
  airlines: Set<string>;
  maxPrice: number | null;
  departWindows: Set<string>;
  arriveWindows: Set<string>;
  maxDurationMin: number | null;
  bagsIncluded: boolean;
  flexibleFares: boolean;
};

export const TIME_WINDOWS = [
  { key: 'early', label: 'Early', hint: 'Before 06:00', from: 0, to: 6 },
  { key: 'morning', label: 'Morning', hint: '06:00 – 12:00', from: 6, to: 12 },
  { key: 'afternoon', label: 'Afternoon', hint: '12:00 – 18:00', from: 12, to: 18 },
  { key: 'evening', label: 'Evening', hint: 'After 18:00', from: 18, to: 24 },
] as const;

export function emptyFilters(): Filters {
  return {
    maxStops: null,
    airlines: new Set(),
    maxPrice: null,
    departWindows: new Set(),
    arriveWindows: new Set(),
    maxDurationMin: null,
    bagsIncluded: false,
    flexibleFares: false,
  };
}

export function filtersFromDraft(draft: ResultsFilterDraft): Filters {
  return {
    maxStops: draft.maxStops,
    airlines: new Set(draft.airlines ?? []),
    maxPrice: draft.maxPrice,
    departWindows: new Set(draft.departWindows ?? []),
    arriveWindows: new Set(draft.arriveWindows ?? []),
    maxDurationMin: draft.maxDurationMin ?? null,
    bagsIncluded: Boolean(draft.bagsIncluded),
    flexibleFares: Boolean(draft.flexibleFares),
  };
}

export function draftFromFilters(filters: Filters): ResultsFilterDraft {
  return {
    maxStops: filters.maxStops,
    airlines: [...filters.airlines],
    maxPrice: filters.maxPrice,
    departWindows: [...filters.departWindows],
    arriveWindows: [...filters.arriveWindows],
    maxDurationMin: filters.maxDurationMin,
    bagsIncluded: filters.bagsIncluded,
    flexibleFares: filters.flexibleFares,
  };
}

export function countActiveFilters(filters: Filters): number {
  let count = 0;
  if (filters.maxStops !== null) count += 1;
  if (filters.airlines.size) count += 1;
  if (filters.maxPrice !== null) count += 1;
  if (filters.departWindows.size) count += 1;
  if (filters.arriveWindows.size) count += 1;
  if (filters.maxDurationMin !== null) count += 1;
  if (filters.bagsIncluded) count += 1;
  if (filters.flexibleFares) count += 1;
  return count;
}

function toggleSet<T>(set: Set<T>, v: T): Set<T> {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
}

function fmtDuration(min: number) {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function hourInWindows(hour: number, selected: Set<string>) {
  if (!selected.size) return true;
  return TIME_WINDOWS.some((w) => selected.has(w.key) && hour >= w.from && hour < w.to);
}

type FilterPanelProps = {
  filters: Filters;
  setFilters: (next: Filters) => void;
  airlines: string[];
  airlineNames?: Record<string, string>;
  priceBounds: { min: number; max: number };
  durationBounds: { min: number; max: number };
  loading?: boolean;
  matchCount?: number;
};

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ff-section">
      <h3 className="ff-section-title">{title}</h3>
      {children}
    </section>
  );
}

export function FilterPanel({
  filters,
  setFilters,
  airlines,
  airlineNames,
  priceBounds,
  durationBounds,
  loading = false,
}: FilterPanelProps) {
  const priceId = useId();
  const durationId = useId();
  const priceValue = filters.maxPrice ?? priceBounds.max;
  const durationValue = filters.maxDurationMin ?? durationBounds.max;

  return (
    <div className="ff-panel" aria-busy={loading || undefined}>
      <FilterSection title="Stops">
        <div className="ff-chip-row" role="radiogroup" aria-label="Stops">
          {[
            { label: 'Any', value: null },
            { label: 'Direct', value: 0 },
            { label: '1 stop', value: 1 },
            { label: '2+ stops', value: 2 },
          ].map((opt) => {
            const selected = filters.maxStops === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`ff-chip${selected ? ' is-selected' : ''}`}
                onClick={() => setFilters({ ...filters, maxStops: opt.value })}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Departure time">
        <div className="ff-chip-grid">
          {TIME_WINDOWS.map((w) => {
            const selected = filters.departWindows.has(w.key);
            return (
              <button
                key={`dep-${w.key}`}
                type="button"
                aria-pressed={selected}
                className={`ff-time-chip${selected ? ' is-selected' : ''}`}
                onClick={() =>
                  setFilters({
                    ...filters,
                    departWindows: toggleSet(filters.departWindows, w.key),
                  })
                }
              >
                <span className="ff-time-label">{w.label}</span>
                <span className="ff-time-hint">{w.hint}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Arrival time">
        <div className="ff-chip-grid">
          {TIME_WINDOWS.map((w) => {
            const selected = filters.arriveWindows.has(w.key);
            return (
              <button
                key={`arr-${w.key}`}
                type="button"
                aria-pressed={selected}
                className={`ff-time-chip${selected ? ' is-selected' : ''}`}
                onClick={() =>
                  setFilters({
                    ...filters,
                    arriveWindows: toggleSet(filters.arriveWindows, w.key),
                  })
                }
              >
                <span className="ff-time-label">{w.label}</span>
                <span className="ff-time-hint">{w.hint}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Journey time">
        <div className="ff-slider-head">
          <label htmlFor={durationId}>Maximum duration</label>
          <strong>{fmtDuration(durationValue)}</strong>
        </div>
        <input
          id={durationId}
          type="range"
          min={durationBounds.min}
          max={durationBounds.max}
          step={15}
          value={durationValue}
          disabled={loading || durationBounds.max <= durationBounds.min}
          onChange={(e) => {
            const value = Number(e.target.value);
            setFilters({
              ...filters,
              maxDurationMin: value >= durationBounds.max ? null : value,
            });
          }}
          className="ff-range"
        />
        <div className="ff-slider-meta">
          <span>{fmtDuration(durationBounds.min)}</span>
          <span>{fmtDuration(durationBounds.max)}</span>
        </div>
      </FilterSection>

      <FilterSection title="Price">
        <div className="ff-slider-head">
          <label htmlFor={priceId}>Maximum price</label>
          <strong>
            {formatMoney({
              amount: priceValue,
              currency: 'GBP',
            })}
          </strong>
        </div>
        <input
          id={priceId}
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={25}
          value={priceValue}
          disabled={loading || priceBounds.max <= priceBounds.min}
          onChange={(e) => {
            const value = Number(e.target.value);
            setFilters({
              ...filters,
              maxPrice: value >= priceBounds.max ? null : value,
            });
          }}
          className="ff-range"
        />
        <div className="ff-slider-meta">
          <span>
            {formatMoney({ amount: priceBounds.min, currency: 'GBP' })}
          </span>
          <span>
            {formatMoney({ amount: priceBounds.max, currency: 'GBP' })}
          </span>
        </div>
      </FilterSection>

      <FilterSection title="Airlines">
        {airlines.length === 0 ? (
          <p className="ff-empty">
            {loading ? 'Airlines appear once results load' : 'No airlines in these results'}
          </p>
        ) : (
          <div className="ff-airline-list">
            {airlines.map((code) => {
              const name = airlineDisplayName(code, airlineNames?.[code]);
              const checked = filters.airlines.has(code);
              return (
                <label key={code} className={`ff-airline-row${checked ? ' is-checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setFilters({
                        ...filters,
                        airlines: toggleSet(filters.airlines, code),
                      })
                    }
                  />
                  <AirlineLogo code={code} name={name} size={28} />
                  <span className="ff-airline-name">{name}</span>
                  <span className="ff-airline-code">{code}</span>
                </label>
              );
            })}
          </div>
        )}
      </FilterSection>

      <FilterSection title="Extras">
        <div className="ff-toggle-list">
          <button
            type="button"
            className={`ff-toggle${filters.bagsIncluded ? ' is-on' : ''}`}
            aria-pressed={filters.bagsIncluded}
            onClick={() =>
              setFilters({ ...filters, bagsIncluded: !filters.bagsIncluded })
            }
          >
            <span className="ff-toggle-copy">
              <span className="ff-toggle-title">Checked bag included</span>
              <span className="ff-toggle-hint">Hide fares without hold luggage</span>
            </span>
            <span className="ff-switch" aria-hidden />
          </button>
          <button
            type="button"
            className={`ff-toggle${filters.flexibleFares ? ' is-on' : ''}`}
            aria-pressed={filters.flexibleFares}
            onClick={() =>
              setFilters({ ...filters, flexibleFares: !filters.flexibleFares })
            }
          >
            <span className="ff-toggle-copy">
              <span className="ff-toggle-title">Flexible fares</span>
              <span className="ff-toggle-hint">Changeable or refundable tickets</span>
            </span>
            <span className="ff-switch" aria-hidden />
          </button>
        </div>
      </FilterSection>
    </div>
  );
}

export function DesktopFlightFilters(props: FilterPanelProps & { onClear: () => void }) {
  const active = countActiveFilters(props.filters);
  return (
    <aside
      className="ff-desktop card sticky"
      style={{ top: 'calc(var(--site-chrome-height, 6.5rem) + 0.75rem)' }}
    >
      <div className="ff-desktop-head">
        <div>
          <p className="ff-desktop-kicker">Refine</p>
          <h2 className="ff-desktop-title">Filters</h2>
        </div>
        <button
          type="button"
          className="ff-link-btn"
          disabled={!active || props.loading}
          onClick={props.onClear}
        >
          Clear all
        </button>
      </div>
      <FilterPanel {...props} />
    </aside>
  );
}

export function MobileFlightFilters({
  filters,
  setFilters,
  airlines,
  priceBounds,
  durationBounds,
  loading = false,
  matchCount = 0,
  onClear,
}: FilterPanelProps & { onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(filters);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="ff-mobile lg:hidden">
      <div className="ff-mobile-bar">
        <button
          type="button"
          className={`ff-mobile-open${active ? ' has-active' : ''}`}
          onClick={() => setOpen(true)}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="ff-mobile-open-icon">
            <path
              d="M3 5.5h14M6 10h8M8.5 14.5h3"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          Filters
          {active ? <span className="ff-mobile-badge">{active}</span> : null}
        </button>

        <button
          type="button"
          className={`ff-quick-chip${filters.maxStops === 0 ? ' is-selected' : ''}`}
          onClick={() =>
            setFilters({
              ...filters,
              maxStops: filters.maxStops === 0 ? null : 0,
            })
          }
        >
          Direct
        </button>
        <button
          type="button"
          className={`ff-quick-chip${filters.bagsIncluded ? ' is-selected' : ''}`}
          onClick={() =>
            setFilters({ ...filters, bagsIncluded: !filters.bagsIncluded })
          }
        >
          Bags
        </button>
        <button
          type="button"
          className={`ff-quick-chip${filters.flexibleFares ? ' is-selected' : ''}`}
          onClick={() =>
            setFilters({ ...filters, flexibleFares: !filters.flexibleFares })
          }
        >
          Flexible
        </button>
        {active ? (
          <button type="button" className="ff-quick-clear" onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="ff-sheet-root" role="presentation">
          <button
            type="button"
            className="ff-sheet-backdrop"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <div
            className="ff-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="ff-sheet-handle" aria-hidden />
            <div className="ff-sheet-head">
              <div>
                <p className="ff-desktop-kicker">Refine results</p>
                <h2 id={titleId} className="ff-desktop-title">
                  Filters
                </h2>
              </div>
              <button
                type="button"
                className="ff-sheet-close"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="ff-sheet-body">
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                airlines={airlines}
                priceBounds={priceBounds}
                durationBounds={durationBounds}
                loading={loading}
              />
            </div>
            <div className="ff-sheet-foot">
              <button
                type="button"
                className="ff-sheet-secondary"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
              >
                Clear all
              </button>
              <button
                type="button"
                className="ff-sheet-primary"
                onClick={() => setOpen(false)}
              >
                Show {matchCount} {matchCount === 1 ? 'flight' : 'flights'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function offerMatchesFilters(
  offer: NormalizedOffer,
  filters: Filters,
  helpers: {
    offerStops: (o: NormalizedOffer) => number;
    offerCarriers: (o: NormalizedOffer) => string[];
    offerDuration: (o: NormalizedOffer) => number;
    departHour: (o: NormalizedOffer) => number;
    arriveHour: (o: NormalizedOffer) => number;
    hasCheckedBag: (o: NormalizedOffer) => boolean;
  },
) {
  if (filters.maxStops !== null && helpers.offerStops(offer) > filters.maxStops) {
    return false;
  }
  if (
    filters.airlines.size &&
    !helpers.offerCarriers(offer).some((code) => filters.airlines.has(code))
  ) {
    return false;
  }
  if (filters.maxPrice !== null && offer.price.total.amount > filters.maxPrice) {
    return false;
  }
  if (!hourInWindows(helpers.departHour(offer), filters.departWindows)) return false;
  if (!hourInWindows(helpers.arriveHour(offer), filters.arriveWindows)) return false;
  if (
    filters.maxDurationMin !== null &&
    helpers.offerDuration(offer) > filters.maxDurationMin
  ) {
    return false;
  }
  if (filters.bagsIncluded && !helpers.hasCheckedBag(offer)) return false;
  if (
    filters.flexibleFares &&
    !(offer.conditions.changeable || offer.conditions.refundable)
  ) {
    return false;
  }
  return true;
}
