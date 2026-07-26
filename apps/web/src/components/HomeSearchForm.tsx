'use client';

import dynamic from 'next/dynamic';
import { SearchFormSkeleton } from './SearchFormSkeleton';

/** Homepage search — heavy form/airport JS loads in a separate chunk after first paint. */
const SearchForm = dynamic(
  () => import('./SearchForm').then((mod) => mod.SearchForm),
  {
    ssr: false,
    loading: () => <SearchFormSkeleton label="Loading flight search…" />,
  },
);

export function HomeSearchForm() {
  return <SearchForm />;
}
