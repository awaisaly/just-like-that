import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { formatMoney } from '@jlt/shared';
import { SearchForm } from '../../../components/SearchForm';
import { SearchResults } from '../../../components/SearchResults';
import { SearchScrollTarget } from '../../../components/SearchScrollTarget';
import {
  InstalmentMottoAccent,
  PayInInstalmentsAccent,
} from '../../../components/InstalmentAccent';
import { findAirport, formatAirportPlace } from '../../../data/airports';
import { getHomeDestinationCards } from '../../../data/destinations';
import { getSeoPagesByType, routeGuidePath, seoPath } from '../../../data/seo-pages';
import type { TravellerSummary } from '../../../lib/flight';
import { INSTALMENTS_HREF, instalmentCopy } from '../../../lib/instalments';
import { markUpFlightMoney } from '../../../lib/pricing';

export const metadata: Metadata = {
  title: 'Search flights',
  description:
    'Search worldwide flights and pay in instalments with a UK agent. Compare live fares, then finalise with a callback.',
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

const cabins: TravellerSummary['cabin'][] = [
  'economy',
  'premium_economy',
  'business',
  'first',
];

function parseCabin(value?: string): TravellerSummary['cabin'] {
  return cabins.includes(value as TravellerSummary['cabin'])
    ? (value as TravellerSummary['cabin'])
    : 'economy';
}

function formatShortDate(iso?: string) {
  if (!iso) return null;
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function cabinLabel(cabin: TravellerSummary['cabin']) {
  return cabin
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function FlightSearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const from = params.from?.toUpperCase() ?? '';
  const to = params.to?.toUpperCase() ?? '';
  const hasRoute = Boolean(from && to);
  const hasSearch = Boolean(from && to && params.depart);
  const canonicalPath = hasRoute ? routeGuidePath(from, to) : '/flights/search';

  const fromAirport = from ? findAirport(from) : undefined;
  const toAirport = to ? findAirport(to) : undefined;
  const fromCity = fromAirport?.city ?? from;
  const toCity = toAirport?.city ?? to;
  const fromPlace = fromAirport ? formatAirportPlace(fromAirport) : from;
  const toPlace = toAirport ? formatAirportPlace(toAirport) : to;

  const adults = Number(params.adults ?? 1);
  const children = Number(params.children ?? 0);
  const infants = Number(params.infants ?? 0);
  const cabin = parseCabin(params.cabin);
  const travellerTotal = adults + children + infants;

  const departLabel = formatShortDate(params.depart);
  const returnLabel = formatShortDate(params.return);

  const popularDestinations = getHomeDestinationCards().slice(0, 6);
  const popularRoutes = getSeoPagesByType('route').slice(0, 6);

  return (
    <div className="flights-page">
      <section className={`flights-hero full-bleed-x ${hasSearch ? 'is-compact' : ''}`}>
        <Image
          src="/img/hero-flights.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="flights-hero-media object-cover"
        />
        <div className="flights-hero-veil" />

        <div className="flights-hero-inner">
          <div className="flights-hero-copy">
            <p className="flights-hero-eyebrow">Elca Airbridge · Flights</p>
            <h1 className="flights-hero-title">
              {hasRoute ? (
                <>
                  <span className="flights-hero-route">
                    {fromCity}
                    <span aria-hidden className="flights-hero-arrow">
                      →
                    </span>
                    {toCity}
                  </span>
                  <span className="flights-hero-iata">
                    {from}–{to}
                  </span>
                </>
              ) : (
                <InstalmentMottoAccent />
              )}
            </h1>
            <p className="flights-hero-support">
              {hasRoute ? (
                <>
                  Book with a UK agent, then{' '}
                  <PayInInstalmentsAccent>pay in instalments</PayInInstalmentsAccent> — all paid
                  before you fly.
                </>
              ) : (
                <>
                  Compare live fares, then book with a UK agent —{' '}
                  <PayInInstalmentsAccent>pay in instalments</PayInInstalmentsAccent> is our primary
                  way to fly.
                </>
              )}
            </p>
          </div>

          <div className="flights-hero-form">
            <SearchForm
              initialParams={{
                from: params.from,
                to: params.to,
                depart: params.depart,
                return: params.return,
                trip: params.trip,
                adults: params.adults,
                children: params.children,
                infants: params.infants,
                cabin: params.cabin,
              }}
            />
          </div>
        </div>
      </section>

      {hasSearch ? (
        <>
          <SearchScrollTarget
            active
            searchKey={[from, to, params.depart, params.return, params.adults, params.children, params.infants, params.cabin, params.trip]
              .filter(Boolean)
              .join('|')}
            cacheKey={[
              from,
              to,
              params.depart ?? '',
              params.return ?? '',
              adults,
              children,
              infants,
              cabin,
            ].join('|')}
          />
          <div id="your-search" className="flights-summary">
            <div className="flights-summary-main">
              <p className="flights-summary-label">Your search</p>
              <p className="flights-summary-route">
                {fromPlace} <span aria-hidden>→</span> {toPlace}
              </p>
              <p className="flights-summary-meta">
                {[
                  departLabel,
                  returnLabel ? `Return ${returnLabel}` : 'One way',
                  `${travellerTotal} traveller${travellerTotal === 1 ? '' : 's'}`,
                  cabinLabel(cabin),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <div className="flights-summary-actions">
              <Link href={canonicalPath} className="flights-summary-link">
                About this route
              </Link>
              <Link href={INSTALMENTS_HREF} className="flights-summary-link is-accent">
                Pay in instalments
              </Link>
            </div>
          </div>
        </>
      ) : (
        <section className="flights-explore stack">
          <div className="flights-promise">
            <div>
              <p className="flights-promise-eyebrow">Primary promise</p>
              <h2 className="flights-promise-title">
                <InstalmentMottoAccent />
              </h2>
              <p className="flights-promise-body">{instalmentCopy.tagline}</p>
            </div>
            <Link href={INSTALMENTS_HREF} className="flights-promise-cta">
              How instalments work →
            </Link>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="m-0 text-xl font-extrabold text-brand-navy">Popular destinations</h2>
                <p className="mt-1 text-sm text-muted">Tap a city, then choose your dates above.</p>
              </div>
              <Link
                href="/destinations"
                className="text-sm font-semibold text-brand hover:text-brand-dark"
              >
                View all →
              </Link>
            </div>
            <div className="flights-dest-grid">
              {popularDestinations.map((dest) => (
                <Link
                  key={dest.slug}
                  href={`/flights/search?to=${dest.iata}`}
                  className="flights-dest-card group"
                >
                  <Image
                    src={dest.image}
                    alt=""
                    fill
                    sizes="200px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="flights-dest-veil" />
                  <div className="flights-dest-copy">
                    <p className="flights-dest-city">{dest.city}</p>
                    <p className="flights-dest-meta">
                      {dest.iata}
                      {dest.fromAmount != null
                        ? ` · from ${formatMoney({ amount: dest.fromAmount, currency: 'GBP' })}`
                        : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3">
              <h2 className="m-0 text-xl font-extrabold text-brand-navy">Popular routes</h2>
              <p className="mt-1 text-sm text-muted">Start from a route travellers book often.</p>
            </div>
            <div className="flights-route-grid">
              {popularRoutes.map((route) => {
                const origin = route.route?.originIata ?? '';
                const destination = route.route?.destinationIata ?? '';
                const originCity = findAirport(origin)?.city ?? origin;
                const destinationCity = findAirport(destination)?.city ?? destination;
                const fromPrice = route.indicativePrices?.[0]?.from
                  ? markUpFlightMoney(route.indicativePrices[0].from)
                  : undefined;
                return (
                  <Link
                    key={route.slug}
                    href={`/flights/search?from=${origin}&to=${destination}`}
                    className="flights-route-card"
                  >
                    <div className="min-w-0">
                      <p className="m-0 text-base font-bold text-brand-navy">
                        {originCity} <span className="font-semibold text-muted">→</span>{' '}
                        {destinationCity}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted">
                        {origin}–{destination}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {fromPrice ? (
                        <p className="m-0 text-sm font-extrabold text-brand">
                          from {formatMoney(fromPrice)}
                        </p>
                      ) : null}
                      <p className="mt-0.5 text-xs font-semibold text-muted">Search →</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-muted">
              Prefer reading first?{' '}
              <Link href="/destinations" className="font-semibold text-brand hover:underline">
                Browse destinations
              </Link>
              {popularRoutes[0] ? (
                <>
                  {' '}
                  or{' '}
                  <Link
                    href={seoPath(popularRoutes[0])}
                    className="font-semibold text-brand hover:underline"
                  >
                    open a route guide
                  </Link>
                </>
              ) : null}
              .
            </p>
          </div>
        </section>
      )}

      <div id="search-results-shell">
        <SearchResults
          from={from}
          to={to}
          depart={params.depart}
          returnDate={params.return}
          adults={adults}
          childrenCount={children}
          infants={infants}
          cabin={cabin}
          hideEmpty
        />
      </div>
    </div>
  );
}
