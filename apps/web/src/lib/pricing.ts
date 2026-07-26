import { applyMarkup, money, type Money } from '@jlt/shared';

/**
 * Single place to configure flight price markup (percent).
 *
 * Default: 5
 * Override via env: FLIGHT_PRICE_MARKUP_PERCENT=5  (use 0 to show provider prices as-is)
 *
 * Applied to every live/mock flight offer total shown in search, offer details, and checkout.
 */
export const FLIGHT_PRICE_MARKUP_PERCENT = parseMarkupPercent(
  process.env.FLIGHT_PRICE_MARKUP_PERCENT,
  5,
);

function parseMarkupPercent(raw: string | undefined, fallback: number): number {
  if (raw == null || raw.trim() === '') return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** Mark up a Money value by FLIGHT_PRICE_MARKUP_PERCENT. */
export function markUpFlightMoney(value: Money): Money {
  if (FLIGHT_PRICE_MARKUP_PERCENT === 0) return value;
  return applyMarkup(value, { type: 'percent', value: FLIGHT_PRICE_MARKUP_PERCENT });
}

/** Mark up an integer minor-unit amount (same currency). */
export function markUpFlightAmount(amountMinor: number, currency = 'GBP'): number {
  return markUpFlightMoney(money(amountMinor, currency)).amount;
}
