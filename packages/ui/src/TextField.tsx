import type { InputHTMLAttributes } from 'react';

export function TextField({
  label,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`grid gap-1.5 text-sm ${className}`}>
      <span className="font-semibold text-ink">{label}</span>
      <input
        {...rest}
        className="rounded-lg border border-line px-3.5 py-[0.7rem] text-[15px] text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}
