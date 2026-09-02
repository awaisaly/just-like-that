import { addMoney, applyMarkup, money, type Money } from '@jlt/shared';

/**
 * Instalment service fee (percent of the listed fare).
 *
 * Not applied to search listings or pay-in-full. Added only when the customer
 * selects a ticket and chooses instalments.
 *
 * Override via env: FLIGHT_PRICE_MARKUP_PERCENT=5  (use 0 for no fee)
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

/** Service fee in minor units for an instalment booking of this listed fare. */
export function flightServiceFeeAmount(listedMinor: number, currency = 'GBP'): number {
  return markUpFlightAmount(listedMinor, currency) - listedMinor;
}

export type OfferPrice = {
  total: Money;
  serviceFee?: Money;
};

export function instalmentServiceFee(price: OfferPrice): Money {
  return price.serviceFee ?? money(0, price.total.currency);
}

/** Listed fare, plus instalment service fee when that payment option is selected. */
export function payableFare(price: OfferPrice, payment: 'full' | 'installments'): Money {
  if (payment !== 'installments') return price.total;
  const fee = instalmentServiceFee(price);
  if (fee.amount === 0) return price.total;
  return addMoney(price.total, fee);
}
