/** Shared instalment messaging — primary brand promise. */

export const INSTALMENTS_HREF = '/guides/paying-for-flights-in-instalments';
export const INSTALMENTS_FAQ_HREF = '/faq';

export const instalmentCopy = {
  motto: 'Fly now. Pay in instalments.',
  short: 'Pay in instalments',
  tagline: 'Spread the cost with a UK agent — our primary way to book.',
  heroSupport:
    'Compare live fares, then spread the cost with instalments — our primary way to book.',
  barLead: 'Fly now',
  barAction: 'Pay in instalments',
  barCta: 'How it works',
  markHint: 'Instalments available',
  priceNote: 'or pay in instalments',
  spotlightTitle: 'Fly now. Pay in instalments.',
  spotlightBody:
    'Instalment plans are how most of our travellers book. Search live fares, request a callback, and your UK agent sets up a payment plan that fits — or settle in full if you prefer.',
  steps: [
    {
      n: '01',
      title: 'Choose your flight',
      body: 'Search live fares and pick the itinerary that works.',
    },
    {
      n: '02',
      title: 'Request a callback',
      body: 'Tell us you want instalments — no payment on the website.',
    },
    {
      n: '03',
      title: 'Pay your way',
      body: 'Your agent confirms the plan, then tickets when ready.',
    },
  ],
  checkoutPrimary: 'Pay in instalments',
  checkoutPrimaryBody:
    'Our primary option. Your agent will set up a scheduled plan that suits your travel dates.',
  checkoutFull: 'Pay in full',
  checkoutFullBody: 'Settle the full fare by phone with your agent if you prefer.',
  footerLine: 'Fly now · Pay in instalments',
} as const;
