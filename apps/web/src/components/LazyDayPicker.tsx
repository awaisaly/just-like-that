'use client';

import dynamic from 'next/dynamic';
import 'react-day-picker/style.css';

/** Calendar UI — loaded on demand so search form shell stays lighter. */
export const LazyDayPicker = dynamic(
  () => import('react-day-picker').then((mod) => mod.DayPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[280px] items-center justify-center p-6 text-sm text-muted">
        Loading calendar…
      </div>
    ),
  },
);
