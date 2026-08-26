'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { formatMoney, type Money } from '@jlt/shared';
import { apiFetch } from '../lib/api';
import type { NormalizedOffer, TravellerSummary } from '../lib/flight';
import { flightSearchCacheKey, useLiveFlightSearchStore, useSearchStore } from '../lib/stores';

const DAY_OFFSETS = [-3, -2, -1, 0, 1, 2, 3] as const;

type DayChip = {
  offset: number;
  departDate: string;
  returnDate?: string;
  departDay: string;
  returnDay?: string;
  departLabel: string;
  returnLabel?: string;
  selected: boolean;
};

function shiftIso(iso: string, days: number) {
  return format(addDays(parseISO(iso), days), 'yyyy-MM-dd');
}

export function FlexibleDatesBar({
  from,
  to,
  depart,
  returnDate,
  adults,
  childrenCount = 0,
  infants = 0,
  cabin = 'economy',
  selectedCheapest,
  loading = false,
}: {
  from: string;
  to: string;
  depart: string;
  returnDate?: string;
  adults: number;
  childrenCount?: number;
  infants?: number;
  cabin?: TravellerSummary['cabin'];
  selectedCheapest?: Money | null;
  loading?: boolean;
}) {
  const router = useRouter();
  const setDraft = useSearchStore((state) => state.setDraft);
  const setSearching = useSearchStore((state) => state.setSearching);
  const setLiveResults = useLiveFlightSearchStore((state) => state.setResults);
  const [prices, setPrices] = useState<Record<string, Money | null>>({});
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  const tripNights = useMemo(() => {
    if (!returnDate) return null;
    return Math.max(0, differenceInCalendarDays(parseISO(returnDate), parseISO(depart)));
  }, [depart, returnDate]);

  const days = useMemo<DayChip[]>(() => {
    return DAY_OFFSETS.map((offset) => {
      const departDate = shiftIso(depart, offset);
      const nextReturn =
        tripNights != null ? shiftIso(departDate, tripNights) : undefined;
      return {
        offset,
        departDate,
        returnDate: nextReturn,
        departDay: format(parseISO(departDate), 'EEE'),
        returnDay: nextReturn ? format(parseISO(nextReturn), 'EEE') : undefined,
        departLabel: format(parseISO(departDate), 'd MMM'),
        returnLabel: nextReturn ? format(parseISO(nextReturn), 'd MMM') : undefined,
        selected: offset === 0,
      };
    });
  }, [depart, tripNights]);

  const dayKey = days.map((day) => day.departDate).join(',');

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setPrices({});

    (async () => {
      try {
        const data = await apiFetch<{
          quotes: Array<{ departDate: string; cheapest: Money | null }>;
        }>('/api/flights/flexible-dates', {
          method: 'POST',
          body: JSON.stringify({
            origin: from,
            destination: to,
            departDate: depart,
            returnDate,
            adults,
            children: childrenCount,
            infants,
            cabin,
          }),
          signal: controller.signal,
        });
        if (cancelled) return;
        const next: Record<string, Money | null> = {};
        for (const quote of data.quotes) {
          next[quote.departDate] = quote.cheapest;
        }
        setPrices(next);
      } catch {
        if (cancelled || controller.signal.aborted) return;
        const next: Record<string, Money | null> = {};
        for (const day of days) next[day.departDate] = null;
        setPrices(next);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dayKey captures days
  }, [dayKey, from, to, adults, childrenCount, infants, cabin]);

  useEffect(() => {
    if (!selectedCheapest) return;
    setPrices((prev) => ({ ...prev, [depart]: selectedCheapest }));
  }, [depart, selectedCheapest]);

  async function selectDay(day: DayChip) {
    if (day.selected || pendingDate) return;

    const params = new URLSearchParams({
      from,
      to,
      depart: day.departDate,
      adults: String(adults),
      children: String(childrenCount),
      infants: String(infants),
      cabin,
      trip: day.returnDate ? 'return' : 'oneway',
    });
    if (day.returnDate) params.set('return', day.returnDate);

    setDraft({
      origin: from,
      destination: to,
      departDate: day.departDate,
      returnDate: day.returnDate ?? '',
      tripType: day.returnDate ? 'return' : 'oneway',
      adults,
      children: childrenCount,
      infants,
      cabin,
    });

    const cacheKey = flightSearchCacheKey({
      origin: from,
      destination: to,
      departDate: day.departDate,
      returnDate: day.returnDate,
      adults,
      children: childrenCount,
      infants,
      cabin,
    });
    const live = useLiveFlightSearchStore.getState();
    if (live.key !== cacheKey || !live.results) {
      setPendingDate(day.departDate);
      setSearching(true);
      try {
        const data = await apiFetch<{ results: NormalizedOffer[] }>('/api/flights/search', {
          method: 'POST',
          body: JSON.stringify({
            origin: from,
            destination: to,
            departDate: day.departDate,
            returnDate: day.returnDate,
            adults,
            children: childrenCount,
            infants,
            cabin,
          }),
        });
        setLiveResults(cacheKey, data.results);
      } catch {
        // Navigation still proceeds; results page will retry.
      } finally {
        setSearching(false);
        setPendingDate(null);
      }
    }

    const href = `/flights/search?${params.toString()}`;
    const scrollY = window.scrollY;
    router.push(href, { scroll: false });
    requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - scrollY) > 2) {
        window.scrollTo({ top: scrollY, behavior: 'auto' });
      }
    });
  }

  return (
    <div className="flex-dates">
      <div className="flex-dates-head">
        <p className="flex-dates-title">Flexible dates</p>
        <p className="flex-dates-hint">
          {returnDate ? 'Keeps your trip length · tap a day to search' : 'Tap a nearby day to search'}
        </p>
      </div>
      <div
        className={`flex-dates-track${returnDate ? ' is-return' : ''}`}
        role="listbox"
        aria-label={returnDate ? 'Flexible round-trip dates' : 'Flexible departure dates'}
      >
        {days.map((day) => {
          const price = day.selected ? selectedCheapest ?? prices[day.departDate] : prices[day.departDate];
          const busy = pendingDate === day.departDate;
          const pricePending = !day.selected && price === undefined && !loading;
          const rangeLabel = day.returnLabel
            ? `${day.departLabel} – ${day.returnLabel}`
            : day.departLabel;
          const daysLabel = day.returnDay
            ? `${day.departDay} – ${day.returnDay}`
            : day.departDay;
          return (
            <button
              key={day.departDate}
              type="button"
              role="option"
              aria-selected={day.selected}
              aria-label={
                day.returnLabel
                  ? `${rangeLabel}, ${daysLabel}`
                  : `${day.departDay} ${day.departLabel}`
              }
              disabled={day.selected || Boolean(pendingDate)}
              className={`flex-dates-chip${day.selected ? ' is-selected' : ''}${busy ? ' is-pending' : ''}${day.returnLabel ? ' is-return' : ''}`}
              onClick={() => selectDay(day)}
            >
              <span className="flex-dates-day">{daysLabel}</span>
              <span className="flex-dates-date">{rangeLabel}</span>
              <span className="flex-dates-price">
                {busy || (loading && day.selected) || pricePending
                  ? '…'
                  : price
                    ? formatMoney(price)
                    : '—'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
