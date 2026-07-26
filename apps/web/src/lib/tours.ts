/** Shared tours / holiday-package messaging. */

export const TOURS_HREF = '/guides/tours';
export const TOURS_SLUG = 'tours';

export const tourCopy = {
  motto: 'Flights, stays, and tours — planned with you.',
  short: 'Tours & packages',
  tagline: 'Inclusive holidays and tailor-made itineraries, finalised with a UK agent.',
  heroSupport:
    'From city breaks to family visits and multi-stop trips — we build the plan, then you fly when ready.',
  spotlightTitle: 'Looking for more than a flight?',
  spotlightBody:
    'Ask about inclusive tours and holiday packages when you request a callback. Your agent can combine flights, hotels, and ground arrangements into one clear plan.',
  types: [
    {
      title: 'City breaks',
      body: 'Short stays with flights and hotel options matched to your dates and budget.',
    },
    {
      title: 'Family & group travel',
      body: 'Multi-passenger itineraries, school holidays, and reunion trips coordinated in one booking conversation.',
    },
    {
      title: 'Business & events',
      body: 'Time-sensitive departures, flexible returns, and practical hotel choices near where you need to be.',
    },
    {
      title: 'Tailor-made packages',
      body: 'Custom routes, stopovers, and longer holidays shaped around the places you actually want to visit.',
    },
  ],
  steps: [
    {
      n: '01',
      title: 'Tell us the trip',
      body: 'Share destinations, dates, travellers, and whether you want flights only or a fuller package.',
    },
    {
      n: '02',
      title: 'We shape options',
      body: 'A UK agent compares inventory and builds clear choices — stays, routing, and timing included where needed.',
    },
    {
      n: '03',
      title: 'Confirm & travel',
      body: 'Agree the plan (instalments or pay in full), then we finalise tickets and any package elements with you.',
    },
  ],
} as const;
