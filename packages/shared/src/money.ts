export type Money = {
  amount: number;
  currency: string;
};

export function money(amount: number, currency = 'GBP'): Money {
  if (!Number.isInteger(amount)) {
    throw new Error('Money amount must be integer minor units');
  }
  return { amount, currency: currency.toUpperCase() };
}

export function formatMoney(value: Money, locale = 'en-GB'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
  }).format(value.amount / 100);
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add ${a.currency} and ${b.currency}`);
  }
  return money(a.amount + b.amount, a.currency);
}

export function multiplyMoney(value: Money, factor: number): Money {
  return money(Math.round(value.amount * factor), value.currency);
}

export function applyMarkup(
  source: Money,
  rule: { type: 'percent' | 'fixed'; value: number },
): Money {
  if (rule.type === 'percent') {
    return multiplyMoney(source, 1 + rule.value / 100);
  }
  return money(source.amount + rule.value, source.currency);
}

export function convertMoney(
  source: Money,
  targetCurrency: string,
  rate: number,
): Money {
  return money(Math.round(source.amount * rate), targetCurrency);
}
