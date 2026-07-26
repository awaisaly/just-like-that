'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { FlightSelection, NormalizedOffer, TravellerSummary } from './flight';

export type FlightSearchRequest = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabin: string;
};

export function flightSearchCacheKey(input: FlightSearchRequest): string {
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

type LiveFlightSearchState = {
  key: string | null;
  results: NormalizedOffer[] | null;
  version: number;
  /** Bumps when the form wants a smooth scroll/reveal into results. */
  revealNonce: number;
  /** Cache key the reveal is intended for (avoids animating a stale page). */
  revealForKey: string | null;
  setResults: (key: string, results: NormalizedOffer[]) => void;
  requestReveal: (cacheKey: string) => void;
  clearReveal: () => void;
};

type Cabin = 'economy' | 'premium_economy' | 'business' | 'first';

export type SearchDraft = {
  tripType: 'return' | 'oneway';
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  cabin: Cabin;
};

export type ResultsFilterDraft = {
  maxStops: number | null;
  airlines: string[];
  maxPrice: number | null;
  departWindows: string[];
  arriveWindows: string[];
  maxDurationMin: number | null;
  bagsIncluded: boolean;
  flexibleFares: boolean;
};

type CheckoutState = {
  selection: FlightSelection | null;
  hasHydrated: boolean;
  selectOffer: (offer: NormalizedOffer, travellers: TravellerSummary) => void;
  clearSelection: () => void;
  setHasHydrated: (value: boolean) => void;
};

type SearchState = SearchDraft & {
  isSearching: boolean;
  hasHydrated: boolean;
  setField: <K extends keyof SearchDraft>(key: K, value: SearchDraft[K]) => void;
  setDraft: (draft: Partial<SearchDraft>) => void;
  setSearching: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
};

type ResultsFilterState = ResultsFilterDraft & {
  hasHydrated: boolean;
  setFilters: (next: ResultsFilterDraft) => void;
  setHasHydrated: (value: boolean) => void;
};

const emptyResultsFilters: ResultsFilterDraft = {
  maxStops: null,
  airlines: [],
  maxPrice: null,
  departWindows: [],
  arriveWindows: [],
  maxDurationMin: null,
  bagsIncluded: false,
  flexibleFares: false,
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      tripType: 'return',
      origin: '',
      destination: '',
      departDate: '',
      returnDate: '',
      adults: 1,
      children: 0,
      infants: 0,
      cabin: 'economy',
      isSearching: false,
      hasHydrated: false,
      setField: (key, value) => set({ [key]: value }),
      setDraft: (draft) => set(draft),
      setSearching: (isSearching) => set({ isSearching }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'jlt-search-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tripType: state.tripType,
        origin: state.origin,
        destination: state.destination,
        departDate: state.departDate,
        returnDate: state.returnDate,
        adults: state.adults,
        children: state.children,
        infants: state.infants,
        cabin: state.cabin,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

export const useResultsFilterStore = create<ResultsFilterState>()(
  persist(
    (set) => ({
      ...emptyResultsFilters,
      hasHydrated: false,
      setFilters: (next) => set(next),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'jlt-results-filters',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        maxStops: state.maxStops,
        airlines: state.airlines,
        maxPrice: state.maxPrice,
        departWindows: state.departWindows,
        arriveWindows: state.arriveWindows,
        maxDurationMin: state.maxDurationMin,
        bagsIncluded: state.bagsIncluded,
        flexibleFares: state.flexibleFares,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<ResultsFilterState>),
        arriveWindows:
          (persisted as Partial<ResultsFilterDraft>)?.arriveWindows ??
          current.arriveWindows,
        maxDurationMin:
          (persisted as Partial<ResultsFilterDraft>)?.maxDurationMin ??
          current.maxDurationMin,
        bagsIncluded:
          (persisted as Partial<ResultsFilterDraft>)?.bagsIncluded ??
          current.bagsIncluded,
        flexibleFares:
          (persisted as Partial<ResultsFilterDraft>)?.flexibleFares ??
          current.flexibleFares,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      selection: null,
      hasHydrated: false,
      selectOffer: (offer, travellers) => set({ selection: { offer, travellers } }),
      clearSelection: () => set({ selection: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'jlt-flight-selection',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ selection: state.selection }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

/** In-memory cache so the form can finish fetching before navigating to results. */
export const useLiveFlightSearchStore = create<LiveFlightSearchState>((set) => ({
  key: null,
  results: null,
  version: 0,
  revealNonce: 0,
  revealForKey: null,
  setResults: (key, results) => set((state) => ({ key, results, version: state.version + 1 })),
  requestReveal: (cacheKey) =>
    set((state) => ({
      revealNonce: state.revealNonce + 1,
      revealForKey: cacheKey,
    })),
  clearReveal: () => set({ revealForKey: null }),
}));
