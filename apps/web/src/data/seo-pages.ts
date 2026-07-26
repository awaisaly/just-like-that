import { AGENCY_NAME, AGENCY_NAME_POSSESSIVE } from '../lib/brand';
import { findAirport } from './airports';

export type SeoPageType = 'route' | 'destination' | 'guide' | 'airline' | 'custom';

export type SeoPage = {
  type: SeoPageType;
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  faq: { q: string; a: string }[];
  indicativePrices?: { month: string; from: { amount: number; currency: string } }[];
  route?: { originIata: string; destinationIata: string };
  redirectsFrom?: string[];
  updatedAt: string;
};

const thisMonth = new Date().toISOString().slice(0, 7);

type DestinationSeoSeed = {
  slug: string;
  city: string;
  iata: string;
  /** Phrase after "from" / "to" in titles, e.g. "the UK" or "Nigeria". */
  market: 'the UK' | 'Nigeria';
  faq?: SeoPage['faq'];
};

const nigeriaCitySlugs = new Set([
  'lagos',
  'abuja',
  'port-harcourt',
  'enugu',
  'kano',
  'calabar',
  'asaba',
  'owerri',
  'benin-city',
  'ibadan',
  'kaduna',
  'jos',
  'akure',
]);

const africaCitySlugs = new Set([
  'accra',
  'nairobi',
  'johannesburg',
  'cape-town',
  'cairo',
  'casablanca',
]);

function destinationSeoPage(seed: DestinationSeoSeed): SeoPage {
  const isNigeriaCity = nigeriaCitySlugs.has(seed.slug);
  const isAfricaCity = africaCitySlugs.has(seed.slug) || isNigeriaCity;

  let title: string;
  let metaDescription: string;
  let h1: string;

  if (seed.market === 'Nigeria') {
    title = `Flights to ${seed.city} from Nigeria`;
    metaDescription = `Book flights to ${seed.city} (${seed.iata}) from Nigeria with ${AGENCY_NAME}. Compare Nigeria to UK fares and finalise with a UK agent — instalments available.`;
    h1 = `Flights to ${seed.city} from Nigeria`;
  } else if (isNigeriaCity) {
    title = `Cheap Flights to ${seed.city}, Nigeria from the UK`;
    metaDescription = `Search cheap flights to ${seed.city}, Nigeria (${seed.iata}) from the UK. Compare London, Manchester and more with ${AGENCY_NAME} — book with a UK agent, pay in instalments or in full.`;
    h1 = `Cheap flights to ${seed.city}, Nigeria`;
  } else if (isAfricaCity) {
    title = `Cheap Flights to ${seed.city}, Africa from the UK`;
    metaDescription = `Find cheap flights to ${seed.city}, Africa (${seed.iata}) from the UK. Compare live fares with ${AGENCY_NAME} and book through a UK travel agent.`;
    h1 = `Cheap flights to ${seed.city}`;
  } else {
    title = `Cheap Flights to ${seed.city} from the UK`;
    metaDescription = `Find cheap flights to ${seed.city} (${seed.iata}) from the UK. Search live fares with ${AGENCY_NAME} and request a callback to book with a UK agent.`;
    h1 = `Cheap flights to ${seed.city}`;
  }

  return {
    type: 'destination',
    slug: seed.slug,
    title,
    metaDescription,
    h1,
    faq:
      seed.faq ??
      [
        {
          q: `How do I book flights to ${seed.city}?`,
          a: 'Search live fares, select an offer, then request a callback. A UK agent confirms availability and completes your booking by phone or WhatsApp.',
        },
        {
          q: 'Can I pay in instalments?',
          a: 'Yes — instalment plans are our primary way of helping travellers book. After you select a fare and request a callback, your agent will set up a plan that suits you. You can also pay in full if you prefer.',
        },
      ],
    updatedAt: '2026-07-26T00:00:00.000Z',
  };
}

const destinationSeoPages: SeoPage[] = (
  [
    {
      slug: 'lagos',
      city: 'Lagos',
      iata: 'LOS',
      market: 'the UK',
      faq: [
        {
          q: 'How do I find cheap flights to Lagos from the UK?',
          a: `Search live fares on ${AGENCY_NAME} for London, Manchester, Birmingham and other UK cities to Lagos (LOS). Select an offer, then request a callback — a UK agent confirms the price before you book.`,
        },
        {
          q: 'Can I pay for Lagos flights in instalments?',
          a: 'Yes — instalments are our primary way to book. After you request a callback, your UK agent will set up a plan that suits you. You can also pay in full if you prefer.',
        },
        {
          q: 'Which UK airports fly to Lagos?',
          a: 'Most travellers search Heathrow (LHR), Gatwick (LGW), Manchester (MAN) or Birmingham (BHX) to Lagos (LOS). An agent can check other UK departure options for your dates.',
        },
        {
          q: 'Do you also book Lagos to London flights?',
          a: 'Yes — we book both UK to Nigeria and Nigeria to UK. See our Lagos to London route guide or search LOS to LHR for return or one-way travel.',
        },
      ],
    },
    {
      slug: 'abuja',
      city: 'Abuja',
      iata: 'ABV',
      market: 'the UK',
      faq: [
        {
          q: 'How long is the flight to Abuja from London?',
          a: 'London–Abuja journeys are typically around 6–7 hours depending on the airline and whether you fly direct or with a connection.',
        },
        {
          q: 'Are Abuja flight prices final?',
          a: `Displayed fares are indicative. An ${AGENCY_NAME} agent re-confirms the live price before you book.`,
        },
      ],
    },
    {
      slug: 'port-harcourt',
      city: 'Port Harcourt',
      iata: 'PHC',
      market: 'the UK',
      faq: [
        {
          q: 'Do flights to Port Harcourt go via Lagos?',
          a: 'Many itineraries connect via Lagos or another hub. Search live fares first; your agent will confirm the best option for your dates.',
        },
        {
          q: 'Can I book Port Harcourt flights with an instalment plan?',
          a: 'Yes — instalments are our primary way to book. Request a callback after selecting a fare and your UK agent will set up a plan for your itinerary.',
        },
      ],
    },
    { slug: 'enugu', city: 'Enugu', iata: 'ENU', market: 'the UK' },
    { slug: 'kano', city: 'Kano', iata: 'KAN', market: 'the UK' },
    { slug: 'calabar', city: 'Calabar', iata: 'CBQ', market: 'the UK' },
    { slug: 'asaba', city: 'Asaba', iata: 'ABB', market: 'the UK' },
    { slug: 'owerri', city: 'Owerri', iata: 'QOW', market: 'the UK' },
    { slug: 'benin-city', city: 'Benin City', iata: 'BNI', market: 'the UK' },
    { slug: 'ibadan', city: 'Ibadan', iata: 'IBA', market: 'the UK' },
    { slug: 'kaduna', city: 'Kaduna', iata: 'KAD', market: 'the UK' },
    { slug: 'jos', city: 'Jos', iata: 'JOS', market: 'the UK' },
    { slug: 'akure', city: 'Akure', iata: 'AKR', market: 'the UK' },
    {
      slug: 'london',
      city: 'London',
      iata: 'LHR',
      market: 'Nigeria',
      faq: [
        {
          q: 'Which London airport should I fly into?',
          a: 'Heathrow (LHR) is the most common London arrival. Tell your agent if Gatwick (LGW) or another airport suits your onward plans better.',
        },
        {
          q: 'How do I book family travel to London?',
          a: 'Add adults, children, and infants in search, pick a fare, then request a callback so we can check baggage and seating needs together.',
        },
      ],
    },
    { slug: 'manchester', city: 'Manchester', iata: 'MAN', market: 'Nigeria' },
    { slug: 'birmingham', city: 'Birmingham', iata: 'BHX', market: 'Nigeria' },
    { slug: 'edinburgh', city: 'Edinburgh', iata: 'EDI', market: 'Nigeria' },
    { slug: 'glasgow', city: 'Glasgow', iata: 'GLA', market: 'Nigeria' },
    { slug: 'bristol', city: 'Bristol', iata: 'BRS', market: 'Nigeria' },
    { slug: 'newcastle', city: 'Newcastle', iata: 'NCL', market: 'Nigeria' },
    { slug: 'leeds', city: 'Leeds Bradford', iata: 'LBA', market: 'Nigeria' },
    { slug: 'east-midlands', city: 'East Midlands', iata: 'EMA', market: 'Nigeria' },
    // Africa
    { slug: 'accra', city: 'Accra', iata: 'ACC', market: 'the UK' },
    { slug: 'nairobi', city: 'Nairobi', iata: 'NBO', market: 'the UK' },
    { slug: 'johannesburg', city: 'Johannesburg', iata: 'JNB', market: 'the UK' },
    { slug: 'cape-town', city: 'Cape Town', iata: 'CPT', market: 'the UK' },
    { slug: 'cairo', city: 'Cairo', iata: 'CAI', market: 'the UK' },
    { slug: 'casablanca', city: 'Casablanca', iata: 'CMN', market: 'the UK' },
    // Middle East
    { slug: 'dubai', city: 'Dubai', iata: 'DXB', market: 'the UK' },
    { slug: 'doha', city: 'Doha', iata: 'DOH', market: 'the UK' },
    { slug: 'abu-dhabi', city: 'Abu Dhabi', iata: 'AUH', market: 'the UK' },
    { slug: 'jeddah', city: 'Jeddah', iata: 'JED', market: 'the UK' },
    { slug: 'riyadh', city: 'Riyadh', iata: 'RUH', market: 'the UK' },
    // Europe
    { slug: 'paris', city: 'Paris', iata: 'CDG', market: 'the UK' },
    { slug: 'amsterdam', city: 'Amsterdam', iata: 'AMS', market: 'the UK' },
    { slug: 'istanbul', city: 'Istanbul', iata: 'IST', market: 'the UK' },
    { slug: 'rome', city: 'Rome', iata: 'FCO', market: 'the UK' },
    { slug: 'madrid', city: 'Madrid', iata: 'MAD', market: 'the UK' },
    { slug: 'barcelona', city: 'Barcelona', iata: 'BCN', market: 'the UK' },
    { slug: 'frankfurt', city: 'Frankfurt', iata: 'FRA', market: 'the UK' },
    // Asia
    { slug: 'delhi', city: 'New Delhi', iata: 'DEL', market: 'the UK' },
    { slug: 'mumbai', city: 'Mumbai', iata: 'BOM', market: 'the UK' },
    { slug: 'bangkok', city: 'Bangkok', iata: 'BKK', market: 'the UK' },
    { slug: 'singapore', city: 'Singapore', iata: 'SIN', market: 'the UK' },
    { slug: 'hong-kong', city: 'Hong Kong', iata: 'HKG', market: 'the UK' },
    // Americas
    { slug: 'new-york', city: 'New York', iata: 'JFK', market: 'the UK' },
    { slug: 'toronto', city: 'Toronto', iata: 'YYZ', market: 'the UK' },
  ] satisfies DestinationSeoSeed[]
).map(destinationSeoPage);

function routePage(input: {
  slug: string;
  fromCity: string;
  toCity: string;
  originIata: string;
  destinationIata: string;
  metaExtra: string;
  h1?: string;
  amount: number;
  redirectsFrom?: string[];
  faq?: SeoPage['faq'];
}): SeoPage {
  const title = `Cheap Flights from ${input.fromCity} to ${input.toCity}`;
  return {
    type: 'route',
    slug: input.slug,
    title,
    metaDescription: `${input.metaExtra} Book with ${AGENCY_NAME} — a UK agent. Pay in instalments or in full.`,
    h1: input.h1 ?? `Cheap flights from ${input.fromCity} to ${input.toCity}`,
    faq: input.faq ?? [],
    route: { originIata: input.originIata, destinationIata: input.destinationIata },
    indicativePrices: [{ month: thisMonth, from: { amount: input.amount, currency: 'GBP' } }],
    redirectsFrom: input.redirectsFrom,
    updatedAt: '2026-07-26T00:00:00.000Z',
  };
}

const curatedRoutes: SeoPage[] = [
  routePage({
    slug: 'london-to-lagos',
    fromCity: 'London',
    toCity: 'Lagos',
    originIata: 'LHR',
    destinationIata: 'LOS',
    metaExtra:
      'Compare cheap flights from London to Lagos, Nigeria. Search Heathrow & Gatwick fares to LOS.',
    amount: 48900,
    redirectsFrom: ['london-lagos', 'lhr-los', 'cheap-flights-london-lagos'],
    faq: [
      {
        q: 'How much are cheap flights from London to Lagos?',
        a: 'Indicative fares often start from a few hundred pounds depending on season, airline, and how early you book. Search live prices for your dates — an agent re-confirms before you pay.',
      },
      {
        q: 'Can I pay for London–Lagos flights in instalments?',
        a: 'Yes — instalments are our primary way to book. After you request a callback, your UK agent will set up a plan that suits you.',
      },
      {
        q: 'Are London to Lagos flights direct?',
        a: 'Direct and one-stop options both appear depending on the airline and dates. Filter results for fewer stops, then ask your agent to confirm the best itinerary.',
      },
    ],
  }),
  routePage({
    slug: 'lagos-to-london',
    fromCity: 'Lagos',
    toCity: 'London',
    originIata: 'LOS',
    destinationIata: 'LHR',
    metaExtra:
      'Find cheap flights from Lagos, Nigeria to London, UK. Compare LOS to Heathrow fares for family and business travel.',
    amount: 49900,
    redirectsFrom: ['lagos-london', 'los-lhr', 'flights-nigeria-to-uk'],
    faq: [
      {
        q: 'How do I book Lagos to London flights from Nigeria?',
        a: `Search live fares on ${AGENCY_NAME}, select an offer, then request a callback. A UK agent confirms availability, bags, and your payment plan.`,
      },
      {
        q: 'Can I fly Lagos to Gatwick instead of Heathrow?',
        a: 'Yes — tell your agent if Gatwick (LGW) or another London airport suits you better. We check live options across major UK arrivals.',
      },
    ],
  }),
  routePage({
    slug: 'london-to-abuja',
    fromCity: 'London',
    toCity: 'Abuja',
    originIata: 'LHR',
    destinationIata: 'ABV',
    metaExtra: 'Search cheap flights from London to Abuja, Nigeria. Compare UK to ABV fares.',
    amount: 51900,
    redirectsFrom: ['london-abuja', 'lhr-abv'],
    faq: [
      {
        q: 'How long is the flight from London to Abuja?',
        a: 'London–Abuja journeys are typically around 6–7 hours depending on the airline and whether you fly direct or with a connection.',
      },
    ],
  }),
  routePage({
    slug: 'abuja-to-london',
    fromCity: 'Abuja',
    toCity: 'London',
    originIata: 'ABV',
    destinationIata: 'LHR',
    metaExtra: 'Compare flights from Abuja, Nigeria to London, UK. Book Nigeria to UK travel with a UK agent.',
    amount: 52900,
    redirectsFrom: ['abuja-london', 'abv-lhr'],
  }),
  routePage({
    slug: 'manchester-to-lagos',
    fromCity: 'Manchester',
    toCity: 'Lagos',
    originIata: 'MAN',
    destinationIata: 'LOS',
    metaExtra: 'Compare cheap flights from Manchester to Lagos, Nigeria. Search MAN to LOS fares.',
    amount: 50900,
    redirectsFrom: ['manchester-lagos', 'man-los'],
  }),
  routePage({
    slug: 'lagos-to-manchester',
    fromCity: 'Lagos',
    toCity: 'Manchester',
    originIata: 'LOS',
    destinationIata: 'MAN',
    metaExtra: 'Find flights from Lagos, Nigeria to Manchester, UK. Compare LOS to MAN options.',
    amount: 51900,
    redirectsFrom: ['lagos-manchester', 'los-man'],
  }),
  routePage({
    slug: 'london-to-port-harcourt',
    fromCity: 'London',
    toCity: 'Port Harcourt',
    originIata: 'LHR',
    destinationIata: 'PHC',
    metaExtra: 'Find cheap flights from London to Port Harcourt, Nigeria.',
    amount: 54900,
    redirectsFrom: ['london-port-harcourt', 'lhr-phc'],
  }),
  routePage({
    slug: 'birmingham-to-lagos',
    fromCity: 'Birmingham',
    toCity: 'Lagos',
    originIata: 'BHX',
    destinationIata: 'LOS',
    metaExtra: 'Search cheap flights from Birmingham to Lagos, Nigeria. Compare BHX to LOS fares.',
    amount: 52900,
    redirectsFrom: ['birmingham-lagos', 'bhx-los'],
  }),
  routePage({
    slug: 'lagos-to-birmingham',
    fromCity: 'Lagos',
    toCity: 'Birmingham',
    originIata: 'LOS',
    destinationIata: 'BHX',
    metaExtra: 'Compare flights from Lagos, Nigeria to Birmingham, UK.',
    amount: 53900,
    redirectsFrom: ['lagos-birmingham', 'los-bhx'],
  }),
  routePage({
    slug: 'london-to-accra',
    fromCity: 'London',
    toCity: 'Accra',
    originIata: 'LHR',
    destinationIata: 'ACC',
    metaExtra: 'Find cheap flights from London to Accra, Ghana — a popular West Africa route from the UK.',
    amount: 45900,
    redirectsFrom: ['london-accra', 'lhr-acc', 'cheap-flights-to-accra'],
  }),
  routePage({
    slug: 'london-to-nairobi',
    fromCity: 'London',
    toCity: 'Nairobi',
    originIata: 'LHR',
    destinationIata: 'NBO',
    metaExtra: 'Search cheap flights from London to Nairobi, Kenya from the UK.',
    amount: 47900,
    redirectsFrom: ['london-nairobi', 'lhr-nbo'],
  }),
  routePage({
    slug: 'london-to-johannesburg',
    fromCity: 'London',
    toCity: 'Johannesburg',
    originIata: 'LHR',
    destinationIata: 'JNB',
    metaExtra: 'Compare cheap flights from London to Johannesburg, South Africa.',
    amount: 56900,
    redirectsFrom: ['london-johannesburg', 'lhr-jnb'],
  }),
  routePage({
    slug: 'manchester-to-abuja',
    fromCity: 'Manchester',
    toCity: 'Abuja',
    originIata: 'MAN',
    destinationIata: 'ABV',
    metaExtra: 'Search flights from Manchester to Abuja, Nigeria.',
    amount: 53900,
    redirectsFrom: ['manchester-abuja', 'man-abv'],
  }),
];

export const seoPages: SeoPage[] = [
  ...curatedRoutes,
  ...destinationSeoPages,
  {
    type: 'guide',
    slug: 'cheap-flights-to-africa',
    title: 'Cheap Flights to Africa from the UK',
    metaDescription: `Find cheap flights to Africa from the UK with ${AGENCY_NAME}. Compare fares to Nigeria, Ghana, Kenya, South Africa and more — book with a UK agent, pay in instalments.`,
    h1: 'Cheap flights to Africa from the UK',
    faq: [
      {
        q: 'Where can I find cheap flights to Africa from the UK?',
        a: `${AGENCY_NAME} specialises in UK to Africa travel. Search live fares to Lagos, Accra, Nairobi, Johannesburg and other cities, then request a callback to book with a UK agent.`,
      },
      {
        q: 'Which African destinations are most popular from the UK?',
        a: 'Lagos and Abuja (Nigeria), Accra (Ghana), Nairobi (Kenya), and Johannesburg are among the most searched. Browse our Africa destination pages or search any city pair.',
      },
      {
        q: 'Can I pay for Africa flights in instalments?',
        a: 'Yes — instalments are our primary way to book. After you select a fare and request a callback, your agent sets up a schedule that fits your travel dates.',
      },
    ],
    redirectsFrom: ['africa-flights', 'flights-to-africa', 'cheap-africa-flights'],
    updatedAt: '2026-07-26T00:00:00.000Z',
  },
  {
    type: 'guide',
    slug: 'flights-uk-nigeria',
    title: 'Flights from UK to Nigeria & Nigeria to UK',
    metaDescription: `Book cheap flights from the UK to Nigeria and Nigeria to the UK with ${AGENCY_NAME}. London–Lagos, Abuja, Port Harcourt and reverse routes — UK agent booking & instalments.`,
    h1: 'Flights between the UK and Nigeria',
    faq: [
      {
        q: 'Do you book both UK to Nigeria and Nigeria to UK flights?',
        a: `Yes. ${AGENCY_NAME} regularly books both directions — London to Lagos, Lagos to London, Abuja, Port Harcourt, Manchester, Birmingham and more.`,
      },
      {
        q: 'What is the cheapest way to fly from the UK to Nigeria?',
        a: 'Flexible dates, early booking, and comparing direct vs one-stop itineraries usually help. Search live fares for your dates; your agent will highlight the best value option before you book.',
      },
      {
        q: 'Can families book Nigeria flights with instalments?',
        a: 'Yes. Add adults, children, and infants in search, then request a callback. We check baggage and seating needs and can set up an instalment plan.',
      },
    ],
    redirectsFrom: [
      'uk-nigeria-flights',
      'nigeria-uk-flights',
      'flights-to-nigeria',
      'cheap-flights-to-nigeria',
    ],
    updatedAt: '2026-07-26T00:00:00.000Z',
  },
  {
    type: 'guide',
    slug: 'paying-for-flights-in-instalments',
    title: 'Book Now, Pay in Instalments',
    metaDescription: `Instalment plans are ${AGENCY_NAME_POSSESSIVE} primary way to book cheap flights to Africa and Nigeria. Book with a UK agent, then pay in instalments — all paid before you fly.`,
    h1: 'Book now. Pay in instalments.',
    faq: [],
    updatedAt: '2026-07-26T00:00:00.000Z',
  },
  {
    type: 'guide',
    slug: 'tours',
    title: 'Tours & Holiday Packages',
    metaDescription: `Plan inclusive tours and holiday packages with ${AGENCY_NAME} — including Africa and Nigeria travel. Flights, hotels, and tailor-made itineraries with a UK agent.`,
    h1: 'Tours & holiday packages',
    faq: [
      {
        q: 'Do you arrange tours as well as flights?',
        a: `Yes. ${AGENCY_NAME} can help with inclusive tours and holiday packages — flights plus hotels and other arrangements — as well as flight-only bookings.`,
      },
      {
        q: 'Can I pay for a tour in instalments?',
        a: 'Yes — instalments are our primary way to book. After you request a callback, your agent will discuss a schedule that suits your travel dates. You can also pay in full if you prefer.',
      },
      {
        q: 'How do I start planning a tour?',
        a: 'Search flights for your dates if you already know the route, or contact us with your destinations and travel window. A UK agent will call back to shape the itinerary with you.',
      },
      {
        q: 'Can you help with family or group tours?',
        a: 'Yes. We regularly arrange multi-passenger and group travel. Tell your agent how many people are travelling and any must-have dates or cities.',
      },
    ],
    redirectsFrom: ['holiday-packages', 'inclusive-tours', 'tours-and-packages'],
    updatedAt: '2026-07-26T00:00:00.000Z',
  },
];

/** Old path (without leading slash) → target slug */
export const seoRedirects: Record<string, string> = Object.fromEntries(
  seoPages.flatMap((page) => (page.redirectsFrom ?? []).map((from) => [from, page.slug])),
);

export function getSeoPage(slug: string): SeoPage | undefined {
  return seoPages.find((page) => page.slug === slug);
}

export function getSeoPagesByType(type: SeoPageType): SeoPage[] {
  return seoPages.filter((page) => page.type === type);
}

export function seoPath(page: SeoPage): string {
  if (page.type === 'route') return `/flights/${page.slug}`;
  if (page.type === 'destination') return `/destinations/${page.slug}`;
  if (page.type === 'guide') return `/guides/${page.slug}`;
  if (page.type === 'airline') return `/airlines/${page.slug}`;
  return `/${page.slug}`;
}

/** Prefer curated SEO routes, otherwise `/flights/lhr-to-los` style. */
export function routeGuidePath(originIata: string, destinationIata: string): string {
  const origin = originIata.trim().toUpperCase();
  const destination = destinationIata.trim().toUpperCase();
  const curated = seoPages.find(
    (page) =>
      page.type === 'route' &&
      page.route?.originIata === origin &&
      page.route?.destinationIata === destination,
  );
  if (curated) return `/flights/${curated.slug}`;
  return `/flights/${origin}-to-${destination}`.toLowerCase();
}

/**
 * Resolve a route landing page from a curated SEO slug or any valid `xxx-to-yyy` IATA pair.
 */
export function resolveRouteSeoPage(slug: string): SeoPage | undefined {
  const curated = getSeoPage(slug);
  if (curated?.type === 'route') return curated;

  const match = /^([a-z]{3})-to-([a-z]{3})$/i.exec(slug.trim());
  if (!match) return undefined;

  const origin = match[1]!.toUpperCase();
  const destination = match[2]!.toUpperCase();
  if (origin === destination) return undefined;

  const fromAirport = findAirport(origin);
  const toAirport = findAirport(destination);
  if (!fromAirport || !toAirport) return undefined;

  return {
    type: 'route',
    slug: `${origin}-to-${destination}`.toLowerCase(),
    title: `Cheap Flights from ${fromAirport.city} to ${toAirport.city}`,
    metaDescription: `Compare cheap flights from ${fromAirport.city} (${origin}) to ${toAirport.city} (${destination}). Book with ${AGENCY_NAME} — a UK agent. Instalments available.`,
    h1: `Cheap flights from ${fromAirport.city} to ${toAirport.city}`,
    faq: [
      {
        q: `How do I book flights from ${fromAirport.city} to ${toAirport.city}?`,
        a: 'Search flights, select an offer, then request a callback. A UK agent confirms your booking by phone or WhatsApp.',
      },
      {
        q: 'Are the prices I see final?',
        a: `Displayed fares are indicative. An ${AGENCY_NAME} agent re-confirms the live price before you book.`,
      },
    ],
    route: { originIata: origin, destinationIata: destination },
    updatedAt: new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z',
  };
}
