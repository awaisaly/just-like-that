import { formatMoney } from '@jlt/shared';
import { getSeoPagesByType, seoPath, type SeoPage } from './seo-pages';

export type DestinationCard = {
  slug: string;
  city: string;
  country: string;
  iata: string;
  image: string;
  blurb: string;
  fromAmount?: number;
  region: string;
};

/** Display order on /destinations. */
export const destinationSlugs = [
  // United Kingdom
  'london',
  'manchester',
  'birmingham',
  'edinburgh',
  'glasgow',
  'bristol',
  'newcastle',
  'leeds',
  'east-midlands',
  // Nigeria
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
  // Africa (beyond Nigeria)
  'accra',
  'nairobi',
  'johannesburg',
  'cape-town',
  'cairo',
  'casablanca',
  // Middle East
  'dubai',
  'doha',
  'abu-dhabi',
  'jeddah',
  'riyadh',
  // Europe
  'paris',
  'amsterdam',
  'istanbul',
  'rome',
  'madrid',
  'barcelona',
  'frankfurt',
  // Asia
  'islamabad',
  'delhi',
  'mumbai',
  'bangkok',
  'singapore',
  'hong-kong',
  // Americas
  'new-york',
  'toronto',
] as const;

/** Region section order for destinations page & footer. */
export const destinationRegionOrder = [
  'United Kingdom',
  'Nigeria',
  'Africa',
  'Middle East',
  'Europe',
  'Asia',
  'Americas',
] as const;

export type DestinationRegion = (typeof destinationRegionOrder)[number];

/** Curated mix shown on the home page. */
export const homeDestinationSlugs = [
  'lagos',
  'london',
  'dubai',
  'accra',
  'manchester',
  'paris',
  'johannesburg',
  'new-york',
] as const;

const destinationExtras: Record<
  string,
  Omit<DestinationCard, 'slug' | 'city' | 'fromAmount'> & { city?: string }
> = {
  lagos: {
    country: 'Nigeria',
    iata: 'LOS',
    image: '/img/dest-lagos.jpg',
    blurb: 'Cheap flights from London to Lagos — Nigeria’s commercial capital for family and business travel.',
    region: 'Nigeria',
  },
  abuja: {
    country: 'Nigeria',
    iata: 'ABV',
    image: '/img/dest-abuja.jpg',
    blurb: 'The federal capital — Aso Rock, government city, and smooth UK connections.',
    region: 'Nigeria',
  },
  'port-harcourt': {
    city: 'Port Harcourt',
    country: 'Nigeria',
    iata: 'PHC',
    image: '/img/dest-portharcourt.jpg',
    blurb: 'Gateway to the Niger Delta — work trips and family travel from the UK.',
    region: 'Nigeria',
  },
  enugu: {
    country: 'Nigeria',
    iata: 'ENU',
    image: '/img/dest-enugu.jpg',
    blurb: 'Eastern Nigeria’s hub — family visits, business, and links across the South East.',
    region: 'Nigeria',
  },
  kano: {
    country: 'Nigeria',
    iata: 'KAN',
    image: '/img/dest-kano.jpg',
    blurb: 'Northern Nigeria’s historic trading city — Hajj, business, and family travel.',
    region: 'Nigeria',
  },
  calabar: {
    country: 'Nigeria',
    iata: 'CBQ',
    image: '/img/dest-calabar.jpg',
    blurb: 'Cross River’s coastal capital — carnival season, tourism, and regional connections.',
    region: 'Nigeria',
  },
  asaba: {
    country: 'Nigeria',
    iata: 'ABB',
    image: '/img/dest-asaba.jpg',
    blurb: 'Delta State gateway — convenient for Onitsha, Asaba, and South-South travel.',
    region: 'Nigeria',
  },
  owerri: {
    country: 'Nigeria',
    iata: 'QOW',
    image: '/img/dest-owerri.jpg',
    blurb: 'Imo State’s airport city — popular for South-East family visits from the UK.',
    region: 'Nigeria',
  },
  'benin-city': {
    city: 'Benin City',
    country: 'Nigeria',
    iata: 'BNI',
    image: '/img/dest-benin-city.jpg',
    blurb: 'Edo State capital — culture, business, and straightforward UK flight searches.',
    region: 'Nigeria',
  },
  ibadan: {
    country: 'Nigeria',
    iata: 'IBA',
    image: '/img/dest-ibadan.jpg',
    blurb: 'South-West Nigeria’s historic city — university town energy with Lagos close by.',
    region: 'Nigeria',
  },
  kaduna: {
    country: 'Nigeria',
    iata: 'KAD',
    image: '/img/dest-kaduna.jpg',
    blurb: 'Northern transport hub — useful for Kaduna, Zaria, and wider North-West travel.',
    region: 'Nigeria',
  },
  jos: {
    country: 'Nigeria',
    iata: 'JOS',
    image: '/img/dest-jos.jpg',
    blurb: 'Plateau State’s cooler highland city — family trips and regional connections.',
    region: 'Nigeria',
  },
  akure: {
    country: 'Nigeria',
    iata: 'AKR',
    image: '/img/dest-akure.jpg',
    blurb: 'Ondo State capital — a practical South-West option for Nigeria itineraries.',
    region: 'Nigeria',
  },
  london: {
    country: 'United Kingdom',
    iata: 'LHR',
    image: '/img/dest-london.jpg',
    blurb: 'Flights from Nigeria to London — tickets from Lagos to London into Heathrow and the city.',
    region: 'United Kingdom',
  },
  manchester: {
    country: 'United Kingdom',
    iata: 'MAN',
    image: '/img/dest-manchester.jpg',
    blurb: 'North England’s major hub — direct and one-stop options worldwide.',
    region: 'United Kingdom',
  },
  birmingham: {
    country: 'United Kingdom',
    iata: 'BHX',
    image: '/img/dest-birmingham.jpg',
    blurb: 'Midlands gateway — well placed for Birmingham, Coventry, and the wider region.',
    region: 'United Kingdom',
  },
  edinburgh: {
    country: 'United Kingdom',
    iata: 'EDI',
    image: '/img/dest-edinburgh.jpg',
    blurb: 'Scotland’s capital — festival city energy with strong international connections.',
    region: 'United Kingdom',
  },
  glasgow: {
    country: 'United Kingdom',
    iata: 'GLA',
    image: '/img/dest-glasgow.jpg',
    blurb: 'West Scotland’s main airport city — strong for family and student travel to the UK.',
    region: 'United Kingdom',
  },
  bristol: {
    country: 'United Kingdom',
    iata: 'BRS',
    image: '/img/dest-bristol.jpg',
    blurb: 'South-West England — handy for Bristol, Bath, and Wales-bound travellers.',
    region: 'United Kingdom',
  },
  newcastle: {
    country: 'United Kingdom',
    iata: 'NCL',
    image: '/img/dest-newcastle.jpg',
    blurb: 'North-East England — a practical UK arrival point beyond London and Manchester.',
    region: 'United Kingdom',
  },
  leeds: {
    city: 'Leeds Bradford',
    country: 'United Kingdom',
    iata: 'LBA',
    image: '/img/dest-leeds.jpg',
    blurb: 'Yorkshire’s airport city — convenient for Leeds, Bradford, and the North.',
    region: 'United Kingdom',
  },
  'east-midlands': {
    city: 'East Midlands',
    country: 'United Kingdom',
    iata: 'EMA',
    image: '/img/dest-east-midlands.jpg',
    blurb: 'Central England option — useful for Nottingham, Leicester, and Derby travellers.',
    region: 'United Kingdom',
  },
  accra: {
    country: 'Ghana',
    iata: 'ACC',
    image: '/img/dest-accra.jpg',
    blurb: 'West Africa’s friendly capital — family visits and business from the UK.',
    region: 'Africa',
  },
  nairobi: {
    country: 'Kenya',
    iata: 'NBO',
    image: '/img/dest-nairobi.jpg',
    blurb: 'East Africa hub — safari gateways, business, and strong UK connections.',
    region: 'Africa',
  },
  johannesburg: {
    country: 'South Africa',
    iata: 'JNB',
    image: '/img/dest-johannesburg.jpg',
    blurb: 'Southern Africa’s main hub — onward links across the region from the UK.',
    region: 'Africa',
  },
  'cape-town': {
    city: 'Cape Town',
    country: 'South Africa',
    iata: 'CPT',
    image: '/img/dest-cape-town.jpg',
    blurb: 'Table Mountain city — leisure and family travel with UK flight options.',
    region: 'Africa',
  },
  cairo: {
    country: 'Egypt',
    iata: 'CAI',
    image: '/img/dest-cairo.jpg',
    blurb: 'North Africa’s historic capital — culture trips and Middle East connections.',
    region: 'Africa',
  },
  casablanca: {
    country: 'Morocco',
    iata: 'CMN',
    image: '/img/dest-casablanca.jpg',
    blurb: 'Morocco’s commercial gateway — Atlantic city energy with UK routes.',
    region: 'Africa',
  },
  dubai: {
    country: 'United Arab Emirates',
    iata: 'DXB',
    image: '/img/dest-dubai.jpg',
    blurb: 'Global hub city — stopovers, leisure, and seamless UK–Gulf connections.',
    region: 'Middle East',
  },
  doha: {
    country: 'Qatar',
    iata: 'DOH',
    image: '/img/dest-doha.jpg',
    blurb: 'Qatar’s capital — a popular one-stop hub between the UK and Africa or Asia.',
    region: 'Middle East',
  },
  'abu-dhabi': {
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    iata: 'AUH',
    image: '/img/dest-abu-dhabi.jpg',
    blurb: 'UAE capital — business travel and calm Gulf city breaks from the UK.',
    region: 'Middle East',
  },
  jeddah: {
    country: 'Saudi Arabia',
    iata: 'JED',
    image: '/img/dest-jeddah.jpg',
    blurb: 'Gateway for Umrah and Red Sea travel — book with a UK agent who knows the route.',
    region: 'Middle East',
  },
  riyadh: {
    country: 'Saudi Arabia',
    iata: 'RUH',
    image: '/img/dest-riyadh.jpg',
    blurb: 'Saudi capital — business trips and family travel with UK departure options.',
    region: 'Middle East',
  },
  paris: {
    country: 'France',
    iata: 'CDG',
    image: '/img/dest-paris.jpg',
    blurb: 'Europe’s classic city break — short hops and connecting itineraries from the UK.',
    region: 'Europe',
  },
  amsterdam: {
    country: 'Netherlands',
    iata: 'AMS',
    image: '/img/dest-amsterdam.jpg',
    blurb: 'Schiphol hub — weekend trips and onward European connections.',
    region: 'Europe',
  },
  istanbul: {
    country: 'Türkiye',
    iata: 'IST',
    image: '/img/dest-istanbul.jpg',
    blurb: 'Bridge between Europe and Asia — popular for stopovers and city breaks.',
    region: 'Europe',
  },
  rome: {
    country: 'Italy',
    iata: 'FCO',
    image: '/img/dest-rome.jpg',
    blurb: 'Italy’s capital — leisure travel with flexible UK flight searches.',
    region: 'Europe',
  },
  madrid: {
    country: 'Spain',
    iata: 'MAD',
    image: '/img/dest-madrid.jpg',
    blurb: 'Spain’s capital hub — city breaks and Iberian connections from the UK.',
    region: 'Europe',
  },
  barcelona: {
    country: 'Spain',
    iata: 'BCN',
    image: '/img/dest-barcelona.jpg',
    blurb: 'Mediterranean favourite — leisure trips with easy UK search options.',
    region: 'Europe',
  },
  frankfurt: {
    country: 'Germany',
    iata: 'FRA',
    image: '/img/dest-frankfurt.jpg',
    blurb: 'Germany’s major hub — business travel and European onward links.',
    region: 'Europe',
  },
  delhi: {
    city: 'New Delhi',
    country: 'India',
    iata: 'DEL',
    image: '/img/dest-delhi.jpg',
    blurb: 'North India gateway — family visits and business with UK agents on hand.',
    region: 'Asia',
  },
  islamabad: {
    country: 'Pakistan',
    iata: 'ISB',
    image: '/img/dest-islamabad.jpg',
    blurb: 'Pakistan’s capital — family visits, business, and Margalla Hills city travel from the UK.',
    region: 'Asia',
  },
  mumbai: {
    country: 'India',
    iata: 'BOM',
    image: '/img/dest-mumbai.jpg',
    blurb: 'India’s commercial capital — busy corridor for UK–India family travel.',
    region: 'Asia',
  },
  bangkok: {
    country: 'Thailand',
    iata: 'BKK',
    image: '/img/dest-bangkok.jpg',
    blurb: 'Southeast Asia hub — holidays and stopovers from the UK.',
    region: 'Asia',
  },
  singapore: {
    country: 'Singapore',
    iata: 'SIN',
    image: '/img/dest-singapore.jpg',
    blurb: 'Asia’s efficient hub city — leisure, business, and onward connections.',
    region: 'Asia',
  },
  'hong-kong': {
    city: 'Hong Kong',
    country: 'Hong Kong',
    iata: 'HKG',
    image: '/img/dest-hong-kong.jpg',
    blurb: 'Harbour city gateway — Asia trips with UK departure options.',
    region: 'Asia',
  },
  'new-york': {
    city: 'New York',
    country: 'United States',
    iata: 'JFK',
    image: '/img/dest-newyork.jpg',
    blurb: 'USA’s busiest international gateway — city trips and onward US travel.',
    region: 'Americas',
  },
  toronto: {
    country: 'Canada',
    iata: 'YYZ',
    image: '/img/dest-toronto.jpg',
    blurb: 'Canada’s main hub — family visits and business from the UK.',
    region: 'Americas',
  },
};

function priceForDestination(iata: string): number | undefined {
  const routes = getSeoPagesByType('route').filter(
    (p) => p.route?.destinationIata === iata || p.route?.originIata === iata,
  );
  const amounts = routes
    .map((p) => p.indicativePrices?.[0]?.from.amount)
    .filter((n): n is number => typeof n === 'number');
  if (amounts.length === 0) return undefined;
  return Math.min(...amounts);
}

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getDestinationCards(): DestinationCard[] {
  return destinationSlugs.flatMap((slug) => {
    const extra = destinationExtras[slug];
    if (!extra) return [];
    return [
      {
        slug,
        city: extra.city ?? titleFromSlug(slug),
        country: extra.country,
        iata: extra.iata,
        image: extra.image,
        blurb: extra.blurb,
        fromAmount: priceForDestination(extra.iata),
        region: extra.region,
      },
    ];
  });
}

export function getDestinationCard(slug: string): DestinationCard | undefined {
  return getDestinationCards().find((d) => d.slug === slug);
}

export function getDestinationsByRegion(region: string): DestinationCard[] {
  return getDestinationCards().filter((d) => d.region === region);
}

export function getHomeDestinationCards(): DestinationCard[] {
  const bySlug = new Map(getDestinationCards().map((d) => [d.slug, d]));
  return homeDestinationSlugs.flatMap((slug) => {
    const card = bySlug.get(slug);
    return card ? [card] : [];
  });
}

/** Destinations outside Nigeria and the UK — for footer “Worldwide” column. */
export function getWorldwideDestinationCards(): DestinationCard[] {
  return getDestinationCards().filter(
    (d) => d.region !== 'Nigeria' && d.region !== 'United Kingdom',
  );
}

export function formatFromPrice(amount?: number): string | null {
  if (amount == null) return null;
  return `from ${formatMoney({ amount, currency: 'GBP' })}`;
}

export function routesToDestination(iata: string): SeoPage[] {
  return getSeoPagesByType('route').filter(
    (p) => p.route?.destinationIata === iata || p.route?.originIata === iata,
  );
}

export function destinationHref(slug: string): string {
  return `/destinations/${slug}`;
}

export function routeHref(page: SeoPage): string {
  return seoPath(page);
}
