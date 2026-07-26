/** Shared instalment messaging — primary brand promise. */

export const INSTALMENTS_HREF = '/guides/paying-for-flights-in-instalments';
export const INSTALMENTS_FAQ_HREF = '/faq';

export const instalmentCopy = {
  motto: 'Book now. Pay in instalments.',
  short: 'Pay in instalments',
  tagline:
    'Book your ticket with a UK agent, then pay in instalments — all paid before you fly.',
  heroSupport:
    'Compare live fares, book with a UK agent, then pay in instalments before you fly.',
  barLead: 'Book now',
  barAction: 'Pay in instalments',
  barCta: 'How it works',
  markHint: 'Instalments available',
  priceNote: 'or pay in instalments',
  spotlightTitle: 'Book now. Pay in instalments.',
  spotlightBody:
    'Instalment plans are how most of our travellers book. Search live fares, book with a UK agent, and pay on a schedule — every instalment must be paid before you fly. Or settle in full if you prefer.',
  steps: [
    {
      n: '01',
      title: 'Choose your flight',
      body: 'Search live fares and pick the itinerary that works.',
    },
    {
      n: '02',
      title: 'Book with a UK agent',
      body: 'Request a callback — we confirm the fare and book your ticket.',
    },
    {
      n: '03',
      title: 'Pay before you fly',
      body: 'Spread the cost in instalments. All payments must be complete before departure.',
    },
  ],
  checkoutPrimary: 'Pay in instalments',
  checkoutPrimaryBody:
    'Book now, then pay on a schedule. Every instalment must be paid before you fly.',
  checkoutFull: 'Pay in full',
  checkoutFullBody: 'Settle the full fare by phone with your agent if you prefer.',
  footerLine: 'Book now · Pay in instalments',
  ctaPrimary: 'Book now · pay in instalments',
  offerNote:
    'No payment online. Your agent books the ticket and sets up instalments — all paid before you fly.',
} as const;
