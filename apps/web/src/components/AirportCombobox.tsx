'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  airportSelectionLabel,
  countryLabel,
  findAirport,
  flattenAirportPicks,
  formatDistanceKm,
  searchAirportGroups,
  type Airport,
  type AirportPickItem,
} from '../data/airports';
import { FieldError } from './FieldError';

const countryFlags: Record<string, string> = {
  GB: '🇬🇧',
  AE: '🇦🇪',
  US: '🇺🇸',
  FR: '🇫🇷',
  NL: '🇳🇱',
  ES: '🇪🇸',
  DE: '🇩🇪',
  IT: '🇮🇹',
  TR: '🇹🇷',
  GR: '🇬🇷',
  PT: '🇵🇹',
  PK: '🇵🇰',
  IN: '🇮🇳',
  SG: '🇸🇬',
  TH: '🇹🇭',
  HK: '🇭🇰',
  AU: '🇦🇺',
  IE: '🇮🇪',
  QA: '🇶🇦',
  NG: '🇳🇬',
  ZA: '🇿🇦',
  KE: '🇰🇪',
  GH: '🇬🇭',
  EG: '🇪🇬',
  MA: '🇲🇦',
  CA: '🇨🇦',
  BR: '🇧🇷',
  MX: '🇲🇽',
  CN: '🇨🇳',
  JP: '🇯🇵',
  KR: '🇰🇷',
  SA: '🇸🇦',
};

function pickId(item: AirportPickItem): string {
  if (item.kind === 'city') return `city-${item.group.key}`;
  if (item.kind === 'nearby') return `nearby-${item.group.key}-${item.airport.iata}`;
  return `airport-${item.airport.iata}`;
}

function pickAirport(item: AirportPickItem): Airport {
  return item.kind === 'city' ? item.pick : item.airport;
}

export function AirportCombobox({
  label,
  value,
  onChange,
  placeholder = 'City or airport',
  icon = '🛫',
  trailing,
  leading,
  error,
  open: openControlled,
  onOpenChange,
  onSelected,
}: {
  label: string;
  value: string;
  onChange: (iata: string) => void;
  placeholder?: string;
  icon?: string;
  /** Extra content inside the control on the trailing edge (e.g. route arrow). */
  trailing?: ReactNode;
  /** Extra content inside the control on the leading edge (after the icon). */
  leading?: ReactNode;
  error?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fires after the user picks a value (not on controlled resets). */
  onSelected?: (iata: string) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openControlled ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (openControlled === undefined) setUncontrolledOpen(next);
  };

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selected = useMemo(() => (value ? findAirport(value) ?? null : null), [value]);
  const selectedLabel = selected ? airportSelectionLabel(selected) : null;
  const groups = useMemo(() => searchAirportGroups(query, query ? 10 : 8), [query]);
  const list = useMemo(() => flattenAirportPicks(groups, query), [groups, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open || !list.length) return;
    const node = optionRefs.current[activeIndex];
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open, list.length]);

  function pick(item: AirportPickItem) {
    const airport = pickAirport(item);
    onChange(airport.iata);
    setQuery('');
    setOpen(false);
    onSelected?.(airport.iata);
  }

  function moveActive(delta: number) {
    if (!list.length) return;
    setActiveIndex((current) => {
      const next = current + delta;
      if (next < 0) return list.length - 1;
      if (next >= list.length) return 0;
      return next;
    });
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        if (list.length) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (list.length) {
          event.preventDefault();
          setActiveIndex(list.length - 1);
        }
        break;
      case 'Enter':
        if (list[activeIndex]) {
          event.preventDefault();
          pick(list[activeIndex]!);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }

  const listboxId = `airport-listbox-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const activeOptionId = list[activeIndex] ? `${listboxId}-${pickId(list[activeIndex]!)}` : undefined;
  const isDestination = label.toLowerCase() === 'to';
  const panelTitle = isDestination ? 'To' : 'From';
  const panelHint = isDestination
    ? 'Choose where you’re flying to'
    : 'Choose where you’re flying from';
  const searchPlaceholder = isDestination
    ? 'Search destination city, airport or code'
    : 'Search departure city, airport or code';

  return (
    <div className={error ? 'field-wrap has-error' : 'field-wrap'}>
      <span className={`field-label${error ? ' is-error' : ''}`}>{label}</span>
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setTimeout(() => inputRef.current?.focus(), 10);
        }}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            className={`control ${open ? 'is-open' : ''} ${trailing ? 'has-trailing' : ''} ${leading ? 'has-leading' : ''} ${error ? 'control-error' : ''}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-invalid={error ? true : undefined}
            onKeyDown={onTriggerKeyDown}
          >
            <span aria-hidden className="text-lg leading-none">
              {icon}
            </span>
            {leading}
            <span className="min-w-0 flex-1">
              <span className={`control-value block ${selectedLabel ? '' : 'text-muted'}`}>
                {selectedLabel ? selectedLabel.title : placeholder}
              </span>
              <span className="control-sub">
                {selectedLabel ? selectedLabel.subtitle : 'Airport or city'}
              </span>
            </span>
            {trailing}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="popover-panel w-[min(400px,calc(100vw-2rem))] p-0"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              inputRef.current?.focus();
            }}
            onPointerDownOutside={(event) => {
              // Switching to another search-form control should not flash-close this panel;
              // the parent activePanel state opens the next one instead.
              const target = event.target;
              if (
                target instanceof Element &&
                (target.closest('.search-form .control') ||
                  target.closest('.search-route-swap') ||
                  target.closest('.search-form [data-radix-popper-content-wrapper]'))
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
            <div className="airport-panel-head">
              <div className="airport-panel-title-row">
                <span className="airport-panel-icon" aria-hidden="true">
                  {icon}
                </span>
                <div className="min-w-0">
                  <p className="airport-panel-kicker">{panelTitle}</p>
                  <p className="airport-panel-hint">{panelHint}</p>
                </div>
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                className="field-input"
                role="combobox"
                aria-label={searchPlaceholder}
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-activedescendant={activeOptionId}
              />
            </div>
            <ul id={listboxId} role="listbox" aria-label={panelTitle} className="max-h-80 list-none overflow-auto p-2">
              {!query ? (
                <li className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Popular {isDestination ? 'destinations' : 'departures'}
                </li>
              ) : null}
              {list.map((item, index) => {
                const active = index === activeIndex;
                const id = `${listboxId}-${pickId(item)}`;

                if (item.kind === 'city') {
                  return (
                    <li key={pickId(item)} role="presentation">
                      <button
                        ref={(node) => {
                          optionRefs.current[index] = node;
                        }}
                        id={id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => pick(item)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                          active ? 'bg-chip' : 'hover:bg-chip'
                        }`}
                      >
                        <span aria-hidden className="grid h-8 w-8 place-items-center text-base text-muted">
                          📍
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink">
                            {item.group.city}, {countryLabel(item.group.country)}
                          </span>
                        </span>
                        <span className="text-xs font-semibold text-muted">All airports</span>
                      </button>
                    </li>
                  );
                }

                if (item.kind === 'nearby') {
                  return (
                    <li key={pickId(item)} role="presentation">
                      <button
                        ref={(node) => {
                          optionRefs.current[index] = node;
                        }}
                        id={id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => pick(item)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 pl-10 py-2.5 text-left transition ${
                          active ? 'bg-chip' : 'hover:bg-chip'
                        }`}
                      >
                        <span aria-hidden className="grid h-8 w-8 place-items-center text-base">
                          ✈️
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">
                            {item.airport.name}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-chip px-1.5 py-0.5 text-[11px] font-bold text-brand">
                              Nearby
                            </span>
                            <span className="text-xs text-muted">{formatDistanceKm(item.km)}</span>
                          </span>
                        </span>
                        <span className="rounded-md bg-surface px-2 py-1 text-xs font-bold text-brand-navy">
                          {item.airport.iata}
                        </span>
                      </button>
                    </li>
                  );
                }

                const indented = item.group.airports.length > 1 || Boolean(item.group.allAirports);
                return (
                  <li key={pickId(item)} role="presentation">
                    <button
                      ref={(node) => {
                        optionRefs.current[index] = node;
                      }}
                      id={id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => pick(item)}
                      className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-left transition ${
                        indented ? 'px-3 pl-10' : 'px-3'
                      } ${active ? 'bg-chip' : 'hover:bg-chip'}`}
                    >
                      <span aria-hidden className="grid h-8 w-8 place-items-center text-base">
                        {indented ? '✈️' : countryFlags[item.airport.country] ?? '📍'}
                      </span>
                      <span className="min-w-0 flex-1">
                        {indented ? (
                          <span className="block truncate text-sm font-medium text-ink">
                            {item.airport.name}
                          </span>
                        ) : (
                          <>
                            <span className="block text-sm font-semibold text-ink">
                              {item.group.city}, {countryLabel(item.group.country)}
                            </span>
                            <span className="block truncate text-xs text-muted">{item.airport.name}</span>
                          </>
                        )}
                      </span>
                      <span className="rounded-md bg-surface px-2 py-1 text-xs font-bold text-brand-navy">
                        {item.airport.iata}
                      </span>
                    </button>
                  </li>
                );
              })}
              {!list.length ? (
                <li className="px-3 py-6 text-center text-sm text-muted">No airports found</li>
              ) : null}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <FieldError message={error} />
    </div>
  );
}
