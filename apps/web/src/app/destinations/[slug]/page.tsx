import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatMoney } from '@jlt/shared';
import { SearchForm } from '../../../components/SearchForm';
import { PayInInstalmentsAccent } from '../../../components/InstalmentAccent';
import { findAirport } from '../../../data/airports';
import { InstalmentSpotlight } from '../../../components/Instalments';
import {
  formatFromPrice,
  getDestinationCard,
  getDestinationCards,
  routesToDestination,
} from '../../../data/destinations';
import { getSeoPage, getSeoPagesByType, seoPath } from '../../../data/seo-pages';
import { AGENCY_NAME } from '../../../lib/brand';
import { instalmentCopy } from '../../../lib/instalments';
import { markUpFlightMoney } from '../../../lib/pricing';
import { destinationAboutCopy } from '../../../lib/seo-content';
import { buildPageMetadata, getSiteUrl } from '../../../lib/seo';

export const revalidate = 3600;

export function generateStaticParams() {
  return getSeoPagesByType('destination').map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPage(slug);
  if (!page || page.type !== 'destination') return { title: 'Destination' };
  return buildPageMetadata({
    title: page.title,
    description: page.metaDescription,
    path: seoPath(page),
    ogTitle: page.h1,
    keywords: [
      page.title,
      `flights to ${page.h1}`,
      'cheap flights to Africa',
      'cheap flights to Nigeria',
      AGENCY_NAME,
    ],
  });
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getSeoPage(slug);
  if (!page || page.type !== 'destination') notFound();

  const dest = getDestinationCard(slug);
  if (!dest) notFound();

  const routes = routesToDestination(dest.iata);
  const priceLabel = formatFromPrice(dest.fromAmount);
  const others = getDestinationCards().filter((d) => d.slug !== slug).slice(0, 6);

  const faq =
    page.faq.length > 0
      ? page.faq
      : [
          {
            q: `How do I book flights to ${dest.city}?`,
            a: 'Search live fares, select an offer, then request a callback. A UK agent confirms availability and booking by phone or WhatsApp.',
          },
          {
            q: 'Can I pay in instalments?',
            a: 'Yes — instalment plans are our primary way of helping travellers book. After you select a fare and request a callback, your agent will set up a plan that suits you.',
          },
        ];

  const siteUrl = getSiteUrl().replace(/\/$/, '');
  const pagePath = seoPath(page);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${siteUrl}/destinations` },
      { '@type': 'ListItem', position: 3, name: page.h1, item: `${siteUrl}${pagePath}` },
    ],
  };

  return (
    <div className="stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-brand hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/destinations" className="hover:text-brand hover:underline">
          Destinations
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{dest.city}</span>
      </nav>

      <section className="full-bleed-x relative overflow-hidden sm:rounded-3xl">
        <div className="relative min-h-[320px] sm:min-h-[380px]">
          <Image
            src={dest.image}
            alt={`${dest.city}, ${dest.country}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/45 to-brand-navy/20" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
              Elca Airbridge · {dest.region}
            </p>
            <h1 className="mt-2 max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-2 max-w-xl text-base text-white/90">
              {dest.blurb} Book with a UK agent and{' '}
              <PayInInstalmentsAccent>pay in instalments</PayInInstalmentsAccent>.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {priceLabel ? (
                <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-brand-navy">
                  {priceLabel}
                  <span className="ml-1 font-semibold text-muted">indicative</span>
                </span>
              ) : null}
              <Link
                href={`/flights/search?to=${dest.iata}`}
                className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-dark"
              >
                See flights to {dest.city}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="mt-0">Search flights to {dest.city}</h2>
        <p className="muted text-sm">
          Prefills {dest.city} ({dest.iata}) as your destination. Add your departure city and dates,
          then open live flight results.
        </p>
        <div className="mt-4">
          <SearchForm initialParams={{ to: dest.iata }} />
        </div>
      </section>

      {routes.length > 0 ? (
        <section className="stack">
          <div>
            <h2 className="m-0">Popular routes</h2>
            <p className="mt-1 text-sm text-muted">Curated routes with indicative fares.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {routes.map((route) => {
              const origin = route.route?.originIata ?? '';
              const destination = route.route?.destinationIata ?? '';
              const fromCity = findAirport(origin)?.city ?? origin;
              const toCity = findAirport(destination)?.city ?? destination;
              const amount = route.indicativePrices?.[0]?.from
                ? markUpFlightMoney(route.indicativePrices[0].from)
                : undefined;
              return (
                <Link
                  key={route.slug}
                  href={seoPath(route)}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white px-5 py-4 shadow-sm transition hover:border-brand/40 hover:shadow-md"
                >
                  <div>
                    <p className="m-0 text-base font-bold text-brand-navy">
                      {fromCity} → {toCity}
                    </p>
                    <p className="m-0 text-sm text-muted">
                      {origin}–{destination} · route guide
                    </p>
                  </div>
                  {amount ? (
                    <span className="shrink-0 text-right text-sm font-bold text-brand-navy">
                      from {formatMoney(amount)}
                    </span>
                  ) : (
                    <span className="shrink-0 text-sm font-semibold text-brand">View →</span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <InstalmentSpotlight compact />

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: instalmentCopy.short,
            body: 'Book now with a UK agent, then pay in instalments — all paid before you fly.',
          },
          {
            title: 'Live fares, then confirmed',
            body: `See indicative prices for ${dest.city}, then let a UK agent confirm the live fare before you book.`,
          },
          {
            title: 'Agent-assisted booking',
            body: 'No online payment here. We finalise seats, bags, and your instalment plan with you.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h3 className="m-0 text-base font-bold text-brand-navy">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="panel">
        <h2 className="mt-0">About flights to {dest.city}</h2>
        {(() => {
          const about = destinationAboutCopy(dest.city, dest.country, dest.iata, dest.region);
          return (
            <>
              <p>{about.lead}</p>
              <p className="muted text-sm">
                {about.support}{' '}
                <Link href="/contact" className="font-semibold text-brand hover:underline">
                  Contact us
                </Link>
                .
              </p>
            </>
          );
        })()}
      </section>

      <section className="panel">
        <h2 className="mt-0">Frequently asked questions</h2>
        <div className="grid gap-4">
          {faq.map((f) => (
            <div key={f.q}>
              <strong className="text-brand-navy">{f.q}</strong>
              <p className="mt-1 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {others.length > 0 ? (
        <section className="stack">
          <h2 className="m-0">More destinations</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/destinations/${other.slug}`}
                className="group relative block h-40 overflow-hidden rounded-2xl"
              >
                <Image
                  src={other.image}
                  alt={other.city}
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-navy/45" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="m-0 text-lg font-bold">{other.city}</p>
                  <p className="m-0 text-xs text-white/80">{other.country}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
