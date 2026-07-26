import { describe, expect, it } from 'vitest';
import { applyMarkup, canTransition, formatMoney, money } from './index.js';

describe('money', () => {
  it('formats GBP minor units', () => {
    expect(formatMoney(money(41250))).toBe('£412.50');
  });

  it('applies percent markup', () => {
    expect(applyMarkup(money(10000), { type: 'percent', value: 5 })).toEqual(
      money(10500),
    );
  });
});

describe('booking state machine', () => {
  it('allows draft → call_requested', () => {
    expect(canTransition('draft', 'call_requested')).toBe(true);
  });

  it('blocks draft → confirmed', () => {
    expect(canTransition('draft', 'confirmed')).toBe(false);
  });
});
