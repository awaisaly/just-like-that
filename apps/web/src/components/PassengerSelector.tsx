'use client';

import * as Popover from '@radix-ui/react-popover';

export type Cabin = 'economy' | 'premium_economy' | 'business' | 'first';

export type Passengers = {
  adults: number;
  children: number;
  infants: number;
  cabin: Cabin;
};

const cabinLabels: Record<Cabin, string> = {
  economy: 'Economy',
  premium_economy: 'Premium Economy',
  business: 'Business',
  first: 'First',
};

const rows: { key: keyof Omit<Passengers, 'cabin'>; label: string; hint: string; min: number }[] = [
  { key: 'adults', label: 'Adults', hint: 'Aged 12+', min: 1 },
  { key: 'children', label: 'Children', hint: 'Aged 2–11', min: 0 },
  { key: 'infants', label: 'Infants', hint: 'Under 2', min: 0 },
];

function Stepper({
  value,
  onChange,
  min,
  max = 9,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="stepper-btn"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        aria-label="Decrease"
      >
        −
      </button>
      <span className="w-5 text-center text-sm font-bold">{value}</span>
      <button
        type="button"
        className="stepper-btn"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

export function PassengerSelector({
  value,
  onChange,
  open: openControlled,
  onOpenChange,
}: {
  value: Passengers;
  onChange: (v: Passengers) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const total = value.adults + value.children + value.infants;

  return (
    <div>
      <span className="field-label">Travellers &amp; cabin</span>
      <Popover.Root open={openControlled} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>
          <button type="button" className="control">
            <span aria-hidden className="text-lg leading-none">
              👤
            </span>
            <span className="min-w-0">
              <span className="control-value block">
                {total} traveller{total > 1 ? 's' : ''}
              </span>
              <span className="control-sub">{cabinLabels[value.cabin]}</span>
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={6}
            className="popover-panel w-[min(320px,calc(100vw-2rem))]"
            onPointerDownOutside={(event) => {
              const target = event.target;
              if (
                target instanceof Element &&
                (target.closest('.search-form .control') || target.closest('.search-route-swap'))
              ) {
                event.preventDefault();
              }
            }}
            onFocusOutside={(event) => {
              const target = event.target;
              if (
                target instanceof Element &&
                (target.closest('.search-form .control') || target.closest('.search-route-swap'))
              ) {
                event.preventDefault();
              }
            }}
          >
            <div className="grid gap-3">
              {rows.map((row) => (
                <div key={row.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-ink">{row.label}</div>
                    <div className="text-xs text-muted">{row.hint}</div>
                  </div>
                  <Stepper
                    value={value[row.key]}
                    min={row.key === 'infants' ? 0 : row.min}
                    max={row.key === 'infants' ? value.adults : 9}
                    onChange={(v) => onChange({ ...value, [row.key]: v })}
                  />
                </div>
              ))}

              <div className="mt-1 border-t border-line pt-3">
                <div className="field-label">Cabin class</div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(cabinLabels) as Cabin[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onChange({ ...value, cabin: c })}
                      className={`flex h-12 items-center justify-center rounded-xl border px-3 text-center text-sm font-semibold leading-tight transition ${
                        value.cabin === c
                          ? 'border-brand bg-chip text-brand'
                          : 'border-line text-ink hover:border-brand/50'
                      }`}
                    >
                      {cabinLabels[c]}
                    </button>
                  ))}
                </div>
              </div>

              <Popover.Close asChild>
                <button
                  type="button"
                  className="mt-1 w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Done
                </button>
              </Popover.Close>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
