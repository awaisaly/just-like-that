import { unstable_cache } from 'next/cache';
import type { FlightSearchInput, Money } from '@jlt/shared';
import type { NormalizedOffer } from '../lib/flight';
import { searchFlights } from './flights';

/** Full offer lists — short TTL (prices / seats move quickly). */
const SEARCH_TTL_SECONDS = Number(process.env.FLIGHT_SEARCH_CACHE_TTL_SECONDS ?? 600);
/** Cheapest-by-day for flexible dates — can live a bit longer. */
const CALENDAR_TTL_SECONDS = Number(process.env.FLIGHT_CALENDAR_CACHE_TTL_SECONDS ?? 1800);

type MemoryEntry<T> = {
  value: T;
  expiresAt: number;
};

/** Process-local L1 cache (warm Next.js / Node instances). */
const memory = new Map<string, MemoryEntry<unknown>>();
/** Process-local in-flight search coalescing (same instance, same key). */
const inflight = new Map<string, Promise<NormalizedOffer[]>>();

function memoryGet<T>(key: string): T | undefined {
  const hit = memory.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expiresAt) {
    memory.delete(key);
    return undefined;
  }
  return hit.value as T;
}

function memorySet<T>(key: string, value: T, ttlSeconds: number) {
  memory.set(key, {
    value,
    expiresAt: Date.now() + Math.max(1, ttlSeconds) * 1000,
  });
  // Soft cap so flexible-date traffic can't grow forever in one process.
  if (memory.size > 500) {
    const first = memory.keys().next().value;
    if (first) memory.delete(first);
  }
}

export function flightSearchCacheKey(input: FlightSearchInput): string {
  return [
    input.origin.trim().toUpperCase(),
    input.destination.trim().toUpperCase(),
    input.departDate,
    input.returnDate ?? '',
    input.adults,
    input.children,
    input.infants,
    input.cabin,
  ].join('|');
}

function cheapestOf(offers: NormalizedOffer[]): Money | null {
  if (!offers.length) return null;
  return offers.reduce(
    (best, offer) => (offer.price.total.amount < best.amount ? offer.price.total : best),
    offers[0]!.price.total,
  );
}

function searchTtl(): number {
  return Number.isFinite(SEARCH_TTL_SECONDS) && SEARCH_TTL_SECONDS > 0
    ? SEARCH_TTL_SECONDS
    : 600;
}

function calendarTtl(): number {
  return Number.isFinite(CALENDAR_TTL_SECONDS) && CALENDAR_TTL_SECONDS > 0
    ? CALENDAR_TTL_SECONDS
    : 1800;
}

/**
 * Cached flight search for Next.js route handlers.
 * L1: in-process Map (fast, per instance)
 * L2: Next.js `unstable_cache` (Data Cache when available)
 */
export async function getCachedFlightSearch(
  input: FlightSearchInput,
): Promise<NormalizedOffer[]> {
  const key = flightSearchCacheKey(input);
  const memKey = `search:${key}`;
  const warm = memoryGet<NormalizedOffer[]>(memKey);
  if (warm) return warm;

  const existing = inflight.get(memKey);
  if (existing) return existing;

  const ttl = searchTtl();
  const pending = (async () => {
    const results = await unstable_cache(
      async () => searchFlights(input),
      ['flight-search', key],
      { revalidate: ttl },
    )();
    memorySet(memKey, results, ttl);
    rememberCalendarQuote(input, results);
    return results;
  })().finally(() => {
    inflight.delete(memKey);
  });

  inflight.set(memKey, pending);
  return pending;
}

export type FlexibleDateQuote = {
  departDate: string;
  returnDate?: string;
  cheapest: Money | null;
};

function calendarKey(input: FlightSearchInput): string {
  return `calendar:${flightSearchCacheKey(input)}`;
}

function rememberCalendarQuote(input: FlightSearchInput, offers: NormalizedOffer[]) {
  memorySet(calendarKey(input), { cheapest: cheapestOf(offers) }, calendarTtl());
}

function peekCheapestQuote(input: FlightSearchInput): Money | null {
  const cachedSearch = memoryGet<NormalizedOffer[]>(`search:${flightSearchCacheKey(input)}`);
  if (cachedSearch) return cheapestOf(cachedSearch);
  const cachedQuote = memoryGet<{ cheapest: Money | null }>(calendarKey(input));
  return cachedQuote?.cheapest ?? null;
}

/**
 * Nearby-date cheapest fares from cache only — never starts extra Duffel searches.
 * A live search runs when the traveller taps a day (or searches that date directly).
 */
export async function getFlexibleDateQuotes(input: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabin: FlightSearchInput['cabin'];
  offsets?: number[];
}): Promise<FlexibleDateQuote[]> {
  const offsets = input.offsets ?? [-3, -2, -1, 0, 1, 2, 3];
  const baseDepart = input.departDate;
  const tripNights =
    input.returnDate != null
      ? Math.max(
          0,
          Math.round(
            (Date.parse(`${input.returnDate}T12:00:00Z`) -
              Date.parse(`${baseDepart}T12:00:00Z`)) /
              86_400_000,
          ),
        )
      : null;

  return offsets.map((offset) => {
    const departDate = shiftUtcDate(baseDepart, offset);
    const returnDate =
      tripNights != null ? shiftUtcDate(departDate, tripNights) : undefined;
    const searchInput: FlightSearchInput = {
      origin: input.origin,
      destination: input.destination,
      departDate,
      returnDate,
      adults: input.adults,
      children: input.children,
      infants: input.infants,
      cabin: input.cabin,
    };

    return {
      departDate,
      returnDate,
      cheapest: peekCheapestQuote(searchInput),
    };
  });
}

function shiftUtcDate(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
