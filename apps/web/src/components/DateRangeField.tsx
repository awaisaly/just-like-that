'use client';

import { useEffect, useId, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  format,
  parseISO,
  isBefore,
  startOfDay,
  differenceInCalendarDays,
} from 'date-fns';
import { FieldError } from './FieldError';
import { LazyDayPicker } from './LazyDayPicker';

function toISO(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function fromISO(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const d = parseISO(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function useWideCalendar() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return wide;
}

type Step = 'depart' | 'return';

export function DateRangeField({
  mode,
  departDate,
  returnDate,
  onDepartChange,
  onReturnChange,
  min = new Date().toISOString().slice(0, 10),
  departError,
  returnError,
  open: openControlled,
  onOpenChange,
  onComplete,
}: {
  mode: 'return' | 'oneway';
  departDate: string;
  returnDate: string;
  onDepartChange: (iso: string) => void;
  onReturnChange: (iso: string) => void;
  min?: string;
  departError?: string;
  returnError?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onComplete?: () => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openControlled ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (openControlled === undefined) setUncontrolledOpen(next);
  };

  const wide = useWideCalendar();
  const monthsToShow = mode === 'return' && wide ? 2 : 1;
  const labelId = useId();
  const departErrorId = useId();
  const returnErrorId = useId();

  const minDate = startOfDay(fromISO(min) ?? new Date());
  const depart = fromISO(departDate);
  const ret = fromISO(returnDate);

  const [step, setStep] = useState<Step>('depart');
  const [month, setMonth] = useState<Date>(() => depart ?? minDate);
  const openIntentRef = useRef<Step | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  /**
   * Incomplete range → edit the missing date first (e.g. one-way → return with
   * only depart set opens on Return even if Depart was clicked).
   * Both dates set → edit whichever field the user clicked.
   */
  function resolveOpenStep(requested: Step): Step {
    if (mode === 'oneway') return 'depart';

    const hasDepart = Boolean(departDate);
    const hasReturn = Boolean(returnDate);

    if (hasDepart && hasReturn) return requested;
    if (!hasDepart) return 'depart';
    return 'return';
  }

  function focusStep(nextStep: Step) {
    setStep(nextStep);
    if (nextStep === 'return') setMonth(ret ?? depart ?? minDate);
    else setMonth(depart ?? minDate);
  }

  useEffect(() => {
    if (!open) {
      openIntentRef.current = null;
      return;
    }

    const intent = openIntentRef.current;
    openIntentRef.current = null;

    if (intent) {
      focusStep(intent);
      return;
    }

    // Opened without an explicit field click (e.g. auto-advance).
    focusStep(resolveOpenStep('depart'));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open-gated sync only
  }, [open, mode]);

  const error = departError || returnError;
  const nights =
    depart && ret ? Math.max(0, differenceInCalendarDays(ret, depart)) : null;
  const bothSelected = Boolean(departDate && returnDate);

  function openAt(requested: Step) {
    const target = resolveOpenStep(requested);

    // Already open: only switch which date we’re editing — don’t remount/close.
    if (open) {
      focusStep(target);
      return;
    }

    openIntentRef.current = target;
    focusStep(target);
    setOpen(true);
  }

  function isAnchorTarget(target: EventTarget | null) {
    return Boolean(target instanceof Node && anchorRef.current?.contains(target));
  }

  function selectDay(day: Date | undefined) {
    if (!day) return;
    const picked = startOfDay(day);
    if (isBefore(picked, minDate)) return;

    // One-way or editing departure
    if (mode === 'oneway' || step === 'depart') {
      const iso = toISO(picked);
      const hadCompleteRange = Boolean(departDate && returnDate);

      onDepartChange(iso);

      if (mode === 'oneway') {
        onReturnChange('');
        setOpen(false);
        onComplete?.();
        return;
      }

      const returnStillValid = Boolean(returnDate && returnDate >= iso);
      if (!returnStillValid) {
        onReturnChange('');
        setStep('return');
        return;
      }

      // Editing an existing range via Depart — only change start, keep return.
      if (hadCompleteRange) {
        setOpen(false);
        return;
      }

      // First-time flow: move on to return.
      setStep('return');
      return;
    }

    // Editing / selecting return
    if (!depart) {
      onDepartChange(toISO(picked));
      onReturnChange('');
      setStep('return');
      return;
    }

    // Should be disabled already, but keep safe.
    if (isBefore(picked, startOfDay(depart))) return;

    onReturnChange(toISO(picked));
    setOpen(false);
    onComplete?.();
  }

  const selectedDepart = depart;
  const selectedReturn = mode === 'return' ? ret : undefined;
  const disabledBefore =
    step === 'return' && selectedDepart ? startOfDay(selectedDepart) : minDate;

  // Highlight the date currently being edited in the grid.
  const activeSelected = step === 'return' ? selectedReturn : selectedDepart;

  const hint =
    mode === 'oneway'
      ? 'Tap a date to depart'
      : step === 'depart'
        ? bothSelected
          ? 'Tap a new departure date'
          : 'Tap your departure date'
        : bothSelected
          ? 'Tap a new return date'
          : 'Tap your return date';

  const departActive = open && step === 'depart';
  const returnActive = open && mode === 'return' && step === 'return';

  return (
    <div className={error ? 'field-wrap has-error' : 'field-wrap'}>
      <span id={labelId} className={`field-label${error ? ' is-error' : ''}`}>
        {mode === 'return' ? 'Dates' : 'Depart'}
      </span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <div
            ref={anchorRef}
            className={`control date-field-control${open ? ' is-open' : ''}${error ? ' control-error' : ''}${mode === 'oneway' ? ' is-oneway' : ' is-return'}`}
            aria-invalid={error ? true : undefined}
            onClick={(event) => {
              // Clicks on the shell / gaps (not a slot or icon) still open the calendar.
              const target = event.target;
              if (!(target instanceof Element)) return;
              if (target.closest('.date-field-slot') || target.closest('.date-field-icon')) return;
              openAt(mode === 'oneway' ? 'depart' : resolveOpenStep('depart'));
            }}
          >
            <button
              type="button"
              className="date-field-icon"
              aria-label={mode === 'return' ? 'Open dates calendar' : 'Open departure calendar'}
              onClick={() => openAt(mode === 'oneway' ? 'depart' : resolveOpenStep('depart'))}
            >
              <span aria-hidden>📅</span>
            </button>
            <div
              className={`date-field-slots${mode === 'return' ? ' is-return' : ' is-oneway'}`}
            >
              <button
                type="button"
                onClick={() => openAt('depart')}
                className={`date-field-slot date-field-depart${departActive ? ' is-active' : ''}${departError ? ' is-invalid' : ''}`}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-labelledby={labelId}
                aria-invalid={departError ? true : undefined}
                aria-describedby={departError ? departErrorId : undefined}
              >
                <span className="date-field-slot-label">Depart</span>
                <span className={`date-field-value${depart ? '' : ' is-empty'}`}>
                  {depart ? format(depart, 'EEE d MMM') : 'Add date'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mode === 'oneway') return;
                  openAt('return');
                }}
                tabIndex={mode === 'oneway' ? -1 : undefined}
                aria-hidden={mode === 'oneway'}
                aria-expanded={mode === 'return' ? open : undefined}
                aria-haspopup={mode === 'return' ? 'dialog' : undefined}
                aria-invalid={returnError ? true : undefined}
                aria-describedby={returnError ? returnErrorId : undefined}
                className={`date-field-slot date-field-return${returnActive ? ' is-active' : ''}${returnError ? ' is-invalid' : ''}`}
              >
                <span className="date-field-slot-label">Return</span>
                <span className={`date-field-value${ret ? '' : ' is-empty'}`}>
                  {ret ? format(ret, 'EEE d MMM') : 'Add date'}
                </span>
              </button>
            </div>
          </div>
        </Popover.Anchor>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            collisionPadding={12}
            className="jlt-datepicker-popover popover-panel max-w-[calc(100vw-1.5rem)] p-0"
            style={{
              width:
                monthsToShow === 2
                  ? 'min(640px, calc(100vw - 1.5rem))'
                  : 'min(360px, calc(100vw - 1.5rem))',
            }}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => {
              // Depart/Return sit outside the panel — keep calendar open and let
              // their click handlers switch the active step.
              // Also ignore other search-form controls so switching panels doesn't flash-close.
              const t = e.target;
              if (isAnchorTarget(t)) e.preventDefault();
              else if (
                t instanceof Element &&
                (t.closest('.search-form .control') || t.closest('.search-route-swap'))
              ) {
                e.preventDefault();
              }
            }}
            onInteractOutside={(e) => {
              const t = e.target;
              if (isAnchorTarget(t)) e.preventDefault();
              else if (
                t instanceof Element &&
                (t.closest('.search-form .control') || t.closest('.search-route-swap'))
              ) {
                e.preventDefault();
              }
            }}
            onFocusOutside={(e) => {
              const t = e.target;
              if (isAnchorTarget(t)) e.preventDefault();
              else if (
                t instanceof Element &&
                (t.closest('.search-form .control') || t.closest('.search-route-swap'))
              ) {
                e.preventDefault();
              }
            }}
          >
            <div className="border-b border-line bg-gradient-to-b from-chip/80 to-white px-4 pb-3 pt-4">
              {mode === 'return' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('depart');
                      setMonth(depart ?? minDate);
                    }}
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      step === 'depart'
                        ? 'border-brand bg-white shadow-sm ring-2 ring-brand/15'
                        : 'border-transparent bg-white/60 hover:border-line'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-muted">
                      <span
                        className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${
                          step === 'depart' ? 'bg-brand text-white' : 'bg-surface text-muted'
                        }`}
                      >
                        1
                      </span>
                      Depart
                    </span>
                    <span
                      className={`mt-1 block text-base font-extrabold ${
                        depart ? 'text-brand-navy' : 'text-muted'
                      }`}
                    >
                      {depart ? format(depart, 'EEE d MMM') : 'Select date'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!departDate) {
                        setStep('depart');
                        setMonth(minDate);
                        return;
                      }
                      setStep('return');
                      setMonth(ret ?? depart ?? minDate);
                    }}
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      step === 'return'
                        ? 'border-brand bg-white shadow-sm ring-2 ring-brand/15'
                        : 'border-transparent bg-white/60 hover:border-line'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-muted">
                      <span
                        className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${
                          step === 'return' ? 'bg-brand text-white' : 'bg-surface text-muted'
                        }`}
                      >
                        2
                      </span>
                      Return
                    </span>
                    <span
                      className={`mt-1 block text-base font-extrabold ${
                        ret ? 'text-brand-navy' : 'text-muted'
                      }`}
                    >
                      {ret ? format(ret, 'EEE d MMM') : 'Select date'}
                    </span>
                  </button>
                </div>
              ) : (
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-muted">
                    Departure
                  </p>
                  <p
                    className={`m-0 mt-1 text-lg font-extrabold ${
                      depart ? 'text-brand-navy' : 'text-muted'
                    }`}
                  >
                    {depart ? format(depart, 'EEEE d MMMM') : 'Select a date'}
                  </p>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="m-0 text-sm font-semibold text-brand">{hint}</p>
                {nights != null ? (
                  <span className="rounded-full bg-brand-navy px-2.5 py-1 text-xs font-bold text-white">
                    {nights === 0 ? 'Same day' : `${nights} night${nights === 1 ? '' : 's'}`}
                  </span>
                ) : null}
              </div>
            </div>

            <div
              className={`jlt-datepicker px-3 py-3 ${
                monthsToShow === 2 ? 'jlt-datepicker-dual' : 'jlt-datepicker-single'
              } ${step === 'depart' ? 'jlt-editing-depart' : 'jlt-editing-return'}`}
            >
              <LazyDayPicker
                key={`${mode}-${monthsToShow}-${step}`}
                mode="single"
                required={false}
                selected={activeSelected}
                month={month}
                onMonthChange={setMonth}
                numberOfMonths={monthsToShow}
                disabled={{ before: disabledBefore }}
                onSelect={selectDay}
                showOutsideDays={monthsToShow === 1}
                modifiers={{
                  depart: selectedDepart ? [selectedDepart] : [],
                  returning: selectedReturn ? [selectedReturn] : [],
                  inRange:
                    selectedDepart && selectedReturn
                      ? { from: selectedDepart, to: selectedReturn }
                      : false,
                  editing: activeSelected ? [activeSelected] : [],
                }}
                modifiersClassNames={{
                  depart: 'jlt-day-depart',
                  returning: 'jlt-day-return',
                  inRange: 'jlt-day-in-range',
                  editing: 'jlt-day-editing',
                }}
              />
            </div>

            {mode === 'return' ? (
              <div className="flex items-center justify-between gap-3 border-t border-line bg-surface/60 px-4 py-3">
                <button
                  type="button"
                  className="text-sm font-semibold text-muted transition hover:text-ink"
                  onClick={() => {
                    onDepartChange('');
                    onReturnChange('');
                    setStep('depart');
                    setMonth(minDate);
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={!departDate || !returnDate}
                  className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => {
                    setOpen(false);
                    onComplete?.();
                  }}
                >
                  Apply dates
                </button>
              </div>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {departError ? <FieldError id={departErrorId} message={departError} /> : null}
      {returnError ? <FieldError id={returnErrorId} message={returnError} /> : null}
    </div>
  );
}
