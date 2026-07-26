'use client';

import { DateRangeField } from './DateRangeField';

/** @deprecated Prefer DateRangeField — kept for simple single-date call sites. */
export function DateField({
  label: _label,
  value,
  onChange,
  min,
  error,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  icon?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <DateRangeField
      mode="oneway"
      departDate={value}
      returnDate=""
      onDepartChange={onChange}
      onReturnChange={() => {}}
      min={min}
      departError={error}
    />
  );
}
