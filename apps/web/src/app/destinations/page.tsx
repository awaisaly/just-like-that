import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PayInInstalmentsAccent } from '../../components/InstalmentAccent';
import {
  destinationHref,
  destinationRegionOrder,
  formatFromPrice,
  getDestinationCards,
  getDestinationsByRegion,
} from '../../data/destinations';

import { buildPageMetadata } from '../../lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Cheap Flights to Africa, Nigeria & Worldwide Destinations',
  description:
    'Browse cheap flight destinations to Nigeria and Africa from the UK, plus Europe, the Middle East, Asia, and the Americas. Book with Elca Airbridge — a UK agent.',
  path: '/destinations',
  ogTitle: 'Flight destinations — Africa, Nigeria & worldwide',
});

const regionBlurbs: Record<(typeof destinationRegionOrder)[number], string> = {
  Nigeria:
    'Cheap flights to Lagos, Abuja, Port Harcourt and more from the UK — and Nigeria to UK arrivals.',
  'United Kingdom': 'Major UK cities for Nigeria to UK arrivals and UK departures.',
  Africa: 'Cheap flights to Africa from the UK — West, East, North, and Southern Africa.',
  'Middle East': 'Gulf hubs and Saudi gateways — stopovers, Umrah, and business travel.',
  Europe: 'Short-haul city breaks and major European hubs.',
  Asia: 'India and Southeast Asia corridors for family and business travel.',
  Americas: 'North America gateways for family visits and city trips.',
};

function DestinationGrid({
  destinations,
  priorityCount = 0,
}: {
  destinations: ReturnType<typeof getDestinationCards>;
  priorityCount?: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {destinations.map((dest, index) => {
        const price = formatFromPrice(dest.fromAmount);
        return (
          <Link
            key={dest.slug}
            href={destinationHref(dest.slug)}
            className="group relative block min-h-[240px] overflow-hidden rounded-3xl shadow-md ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Image
              src={dest.image}
              alt={`${dest.city}, ${dest.country}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
              priority={index < priorityCount}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
                {dest.region}
                {dest.iata ? ` · ${dest.iata}` : ''}
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-white">{dest.city}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-white/80">{dest.blurb}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {price ? (
                  <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-brand-navy">
                    {price}
                  </span>
                ) : null}
                <span className="text-sm font-semibold text-white/90 group-hover:underline">
                  Explore →
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function DestinationsIndexPage() {
  const destinations = getDestinationCards();
  const sections = destinationRegionOrder
    .map((region) => ({
      region,
      destinations: getDestinationsByRegion(region),
      blurb: regionBlurbs[region],
    }))
    .filter((s) => s.destinations.length > 0);

  return (
    <div className="stack">
      <section className="full-bleed-x relative -mt-6 overflow-hidden">
        <Image
          src="/img/hero-flights.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/70 via-brand-navy/55 to-brand-navy/80" />
        <div className="relative mx-auto w-[min(1200px,calc(100%-2rem))] px-0 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
            Elca Airbridge
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Cheap flights to Africa, Nigeria &amp; beyond
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/90 sm:text-lg">
            {destinations.length} cities — from Lagos and Accra to London returns, Europe, the Middle
            East, Asia, and the Americas. Compare fares, then{' '}
            <PayInInstalmentsAccent>pay in instalments</PayInInstalmentsAccent> with a UK agent.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/flights/search"
              className="inline-flex rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-white transition hover:bg-accent-dark"
            >
              Search flights
            </Link>
            <Link
              href="/guides/flights-uk-nigeria"
              className="inline-flex rounded-xl border border-white/35 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              UK–Nigeria guide
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-xl border border-white/35 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>

      {sections.map((section, index) => (
        <section key={section.region} className="stack">
          <div>
            <h2 className="m-0 text-2xl font-extrabold">{section.region}</h2>
            <p className="mt-1 text-sm text-muted">{section.blurb}</p>
          </div>
          <DestinationGrid
            destinations={section.destinations}
            priorityCount={index === 0 ? 3 : 0}
          />
        </section>
      ))}

      <section className="overflow-hidden rounded-3xl bg-brand-navy px-5 py-8 text-white sm:px-8 sm:py-10">
        <h2 className="m-0 text-2xl font-extrabold text-white">Book now. Pay in instalments.</h2>
        <p className="mt-2 max-w-xl text-white/80">
          Search London–Lagos, Dubai, Accra, Paris, New York, and more — then book with a UK agent
          and pay in instalments. Every instalment must be paid before you fly.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/flights/search"
            className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-dark"
          >
            Open flight search
          </Link>
          <Link
            href="/contact"
            className="inline-flex rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            Talk to us
          </Link>
        </div>
      </section>
    </div>
  );
}
