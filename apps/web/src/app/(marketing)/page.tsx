import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { formatMoney } from '@jlt/shared';
import { AgencyWordmark } from '../../components/AgencyWordmark';
import {
  HomeHero,
  HomeInView,
  HomeStaggerItem,
} from '../../components/HomeMotion';
import { InstalmentSpotlight } from '../../components/Instalments';
import { HomeSearchForm } from '../../components/HomeSearchForm';
import { findAirport } from '../../data/airports';
import {
  destinationHref,
  formatFromPrice,
  getHomeDestinationCards,
} from '../../data/destinations';
import { getSeoPagesByType, seoPath } from '../../data/seo-pages';
import { AGENCY_NAME } from '../../lib/brand';
import {
  formatSupportPhone,
  getSupportEmail,
  getSupportPhone,
  supportMailtoHref,
  supportTelHref,
} from '../../lib/contact';
import { instalmentCopy } from '../../lib/instalments';
import { markUpFlightMoney } from '../../lib/pricing';
import { buildPageMetadata } from '../../lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: `Cheap Flights to Africa & Nigeria from the UK`,
  description: `Search cheap flights to Africa and Nigeria from the UK — and Nigeria to the UK. London–Lagos, Abuja, Accra and more with ${AGENCY_NAME}. Pay in instalments with a UK agent.`,
  path: '/',
  ogTitle: 'Cheap flights to Africa & Nigeria',
});

const supportPhone = getSupportPhone();
const supportEmail = getSupportEmail();
const supportPhoneDisplay = formatSupportPhone(supportPhone);

const steps = [
  {
    n: '01',
    title: 'Search live fares',
    body: 'Compare worldwide flights — dates, cabins, and travellers in one place.',
  },
  {
    n: '02',
    title: 'Book with a UK agent',
    body: 'Request a callback — we confirm the fare and book your ticket. No payment online.',
  },
  {
    n: '03',
    title: 'Pay before you fly',
    body: 'Spread the cost in instalments. All payments must be complete before departure.',
  },
];

const reasons = [
  {
    title: 'Pay in instalments',
    body: 'Book now, then pay on a schedule — every instalment must be paid before you fly.',
  },
  {
    title: 'Agent-confirmed fares',
    body: 'Every booking is verified by a UK specialist before you commit — no surprise tickets.',
  },
  {
    title: 'Worldwide destinations',
    body: 'Lagos, London, Dubai, Accra, Europe, Asia, and more — search the routes you actually fly.',
  },
  {
    title: 'Phone & WhatsApp',
    body: 'Talk to a real person. We stay with you through changes, bags, and travel dates.',
  },
];

export default function HomePage() {
  const destinations = getHomeDestinationCards();
  const routes = getSeoPagesByType('route').slice(0, 9);

  return (
    <div className="home-page">
      <HomeHero>
        <section className="full-bleed-x relative -mt-6 overflow-hidden">
          <Image
            src="/img/hero-flights.jpg"
            alt=""
            fill
            priority
            quality={75}
            sizes="100vw"
            className="home-hero-media object-cover"
          />
          <div className="home-hero-veil absolute inset-0" />

          <div className="relative mx-auto w-[min(1200px,calc(100%-2rem))] px-0 pt-16 pb-44 sm:pt-24 sm:pb-52">
            <p className="home-hero-line home-hero-brand">
              <AgencyWordmark size="hero" />
            </p>
            <h1 className="home-hero-line home-hero-title mt-5 max-w-xl text-xl font-semibold leading-snug text-white/95 sm:text-2xl">
              Cheap flights to Africa &amp; Nigeria
            </h1>
            <p className="home-hero-line home-hero-copy mt-3 max-w-md text-base text-white/80 sm:text-lg">
              UK to Nigeria and back — compare live fares, then {instalmentCopy.motto.toLowerCase()} with
              a UK agent.
            </p>
          </div>
        </section>

        <div className="home-hero-line home-hero-search relative z-10 mx-auto -mt-36 w-full max-w-280 sm:-mt-40">
          <HomeSearchForm />
        </div>
      </HomeHero>

      <HomeInView className="home-section stack pt-10 sm:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              Destinations
            </p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              Popular Africa &amp; worldwide destinations
            </h2>
            <p className="mt-1 max-w-lg text-sm text-muted sm:text-base">
              Cheap flights to Nigeria, Ghana, Kenya and beyond — plus Europe, the Middle East, and
              Asia. Fares update when you search.
            </p>
          </div>
          <Link
            href="/destinations"
            className="text-sm font-semibold text-brand transition hover:text-brand-dark"
          >
            View all destinations →
          </Link>
        </div>

        <HomeInView stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((dest, index) => {
            const price = formatFromPrice(dest.fromAmount);
            return (
              <HomeStaggerItem key={dest.slug} index={index}>
                <Link
                  href={destinationHref(dest.slug)}
                  className="home-dest-card group relative block min-h-[220px] overflow-hidden rounded-2xl ring-1 ring-black/5"
                >
                  <Image
                    src={dest.image}
                    alt={`${dest.city}, ${dest.country}`}
                    fill
                    quality={75}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/65">
                      {dest.region} · {dest.iata}
                    </p>
                    <p className="mt-0.5 text-lg font-bold">{dest.city}</p>
                    {price ? (
                      <p className="mt-1 text-sm font-semibold text-accent">{price}</p>
                    ) : (
                      <p className="mt-1 text-sm text-white/75">Search live fares</p>
                    )}
                  </div>
                </Link>
              </HomeStaggerItem>
            );
          })}
        </HomeInView>
      </HomeInView>

      <HomeInView className="home-section stack">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Popular routes
          </p>
          <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            UK ↔ Nigeria &amp; Africa routes
          </h2>
          <p className="mt-1 max-w-lg text-sm text-muted sm:text-base">
            Cheap flights from the UK to Nigeria and Africa — and Nigeria back to the UK. Open a
            route guide, search live prices, then book with a callback.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
            <Link href="/guides/flights-uk-nigeria" className="text-brand hover:underline">
              UK–Nigeria flights guide →
            </Link>
            <Link href="/guides/cheap-flights-to-africa" className="text-brand hover:underline">
              Cheap flights to Africa →
            </Link>
          </div>
        </div>

        <HomeInView stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route, index) => {
            const origin = route.route?.originIata ?? '';
            const destination = route.route?.destinationIata ?? '';
            const fromCity = findAirport(origin)?.city ?? origin;
            const toCity = findAirport(destination)?.city ?? destination;
            const fromPrice = route.indicativePrices?.[0]?.from
              ? markUpFlightMoney(route.indicativePrices[0].from)
              : undefined;
            return (
              <HomeStaggerItem key={route.slug} index={index}>
                <Link
                  href={seoPath(route)}
                  className="home-route-card group flex items-center justify-between gap-4 rounded-2xl border border-line bg-white px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-base font-bold text-brand-navy">
                      {fromCity} <span className="font-semibold text-muted">→</span> {toCity}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted">
                      {origin}–{destination}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {fromPrice ? (
                      <p className="text-sm font-extrabold text-brand">
                        from {formatMoney(fromPrice)}
                      </p>
                    ) : null}
                    <p className="mt-0.5 text-xs font-semibold text-muted transition group-hover:text-brand">
                      View route →
                    </p>
                  </div>
                </Link>
              </HomeStaggerItem>
            );
          })}
        </HomeInView>
      </HomeInView>

      <HomeInView>
        <InstalmentSpotlight />
      </HomeInView>

      <HomeInView className="home-band full-bleed-x">
        <div className="mx-auto w-[min(1200px,calc(100%-2rem))] py-12 sm:py-16">
          <div className="max-w-xl">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              How it works
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-brand-navy sm:text-3xl">
              Search online. Pay in instalments.
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              Live fares online, then a human hand on the booking — with instalments as the primary
              way most of our travellers fly.
            </p>
          </div>

          <HomeInView
            stagger
            className="mt-10 grid list-none gap-8 p-0 sm:grid-cols-3 sm:gap-6"
          >
            {steps.map((step, index) => (
              <HomeStaggerItem key={step.n} index={index}>
                <div>
                  <span className="home-step-num block text-4xl font-extrabold tracking-tight text-brand/25 sm:text-5xl">
                    {step.n}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-brand-navy">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </HomeStaggerItem>
            ))}
          </HomeInView>
        </div>
      </HomeInView>

      <HomeInView className="home-section stack">
        <div className="max-w-xl">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Why {AGENCY_NAME}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            The calm way to book now and pay in instalments
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-stretch">
          <HomeInView className="relative min-h-[280px] overflow-hidden rounded-3xl lg:min-h-full">
            <Image
              src="/img/dest-lagos.jpg"
              alt="Lagos skyline"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="home-why-media object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-brand-navy/85 via-brand-navy/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                Specialist desk
              </p>
              <p className="mt-2 max-w-sm text-xl font-bold leading-snug sm:text-2xl">
                Family visits, business trips, and multi-city plans — handled in one conversation.
              </p>
            </div>
          </HomeInView>

          <HomeInView stagger className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-1">
            {reasons.map((reason, index) => (
              <HomeStaggerItem key={reason.title} index={index}>
                <div className="home-reason-card rounded-2xl border border-line bg-white px-5 py-4">
                  <h3 className="m-0 text-base font-bold text-brand-navy">{reason.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{reason.body}</p>
                </div>
              </HomeStaggerItem>
            ))}
          </HomeInView>
        </div>
      </HomeInView>

      <HomeInView className="full-bleed-x overflow-hidden">
        <div className="home-cta relative mx-auto w-[min(1200px,calc(100%-2rem))] overflow-hidden rounded-3xl">
          <Image
            src="/img/dest-london.jpg"
            alt=""
            fill
            sizes="1200px"
            className="home-cta-media object-cover"
          />
          <div className="absolute inset-0 bg-brand-navy/80" />
          <div className="relative grid gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.2fr_auto] lg:items-end">
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-white/65">
                Ready when you are
              </p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Find your flight.
                <br />
                Pay in instalments.
              </h2>
              <p className="mt-3 max-w-md text-base text-white/80">
                Search now, book with a UK agent, then pay in instalments before you fly.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/flights/search"
                className="inline-flex rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-white transition hover:bg-accent-dark"
              >
                Search flights
              </Link>
              <a
                href={supportTelHref(supportPhone)}
                className="inline-flex rounded-xl border border-white/35 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Call {supportPhoneDisplay}
              </a>
              <a
                href={supportMailtoHref(supportEmail)}
                className="inline-flex rounded-xl border border-white/35 px-6 py-3.5 text-base font-bold text-white transition hover:bg-white/10"
              >
                Email us
              </a>
            </div>
          </div>
        </div>
      </HomeInView>
    </div>
  );
}
