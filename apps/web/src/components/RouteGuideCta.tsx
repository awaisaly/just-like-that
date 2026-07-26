'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { buildSearchQuery } from './SearchForm';
import { useSearchStore } from '../lib/stores';

export function RouteGuideCta({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const tripType = useSearchStore((state) => state.tripType);
  const departDate = useSearchStore((state) => state.departDate);
  const returnDate = useSearchStore((state) => state.returnDate);
  const adults = useSearchStore((state) => state.adults);
  const children = useSearchStore((state) => state.children);
  const infants = useSearchStore((state) => state.infants);
  const cabin = useSearchStore((state) => state.cabin);

  const href = useMemo(() => {
    const query = buildSearchQuery({
      tripType,
      origin,
      destination,
      departDate,
      returnDate: tripType === 'return' ? returnDate : '',
      passengers: {
        adults,
        children,
        infants,
        cabin,
      },
    });
    if (query) return `/flights/search?${query}`;
    return `/flights/search?from=${origin}&to=${destination}&trip=${tripType}`;
  }, [tripType, departDate, returnDate, adults, children, infants, cabin, origin, destination]);

  return (
    <Link
      href={href}
      className="inline-flex rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-white transition hover:bg-accent-dark"
    >
      See flights
    </Link>
  );
}
