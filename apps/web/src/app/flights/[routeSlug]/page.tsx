import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatMoney } from '@jlt/shared';
import { RouteGuideCta } from '../../../components/RouteGuideCta';
import { SearchForm } from '../../../components/SearchForm';
import { countryLabel, findAirport } from '../../../data/airports';
import { getSeoPagesByType, resolveRouteSeoPage, seoPath } from '../../../data/seo-pages';
import { AGENCY_NAME } from '../../../lib/brand';
import { markUpFlightMoney } from '../../../lib/pricing';
import { routeAboutCopy } from '../../../lib/seo-content';
import { buildPageMetadata, getSiteUrl } from '../../../lib/seo';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return getSeoPagesByType('route').map((page) => ({ routeSlug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ routeSlug: string }>;
}): Promise<Metadata> {
  const { routeSlug } = await params;
  const page = resolveRouteSeoPage(routeSlug);
  if (!page) return { title: 'Flights' };
  return buildPageMetadata({
    title: page.title,
    description: page.metaDescription,
    path: seoPath(page),
    ogTitle: page.h1,
    keywords: [
      page.title,
      `flights ${page.route?.originIata} to ${page.route?.destinationIata}`,
      'cheap flights to Africa',
      'cheap flights to Nigeria',
      'flights from UK to Nigeria',
      'flights from Nigeria to UK',
      AGENCY_NAME,
    ],
  });
}

export default async function RouteLandingPage({
  params,
}: {
  params: Promise<{ routeSlug: string }>;
}) {
  const { routeSlug } = await params;
  const page = resolveRouteSeoPage(routeSlug);
  if (!page || !page.route) notFound();

  const origin = page.route.originIata;
  const destination = page.route.destinationIata;
  const fromAirport = findAirport(origin);
  const toAirport = findAirport(destination);
  const fromCity = fromAirport?.city ?? origin;
  const toCity = toAirport?.city ?? destination;
  const fromCountry = fromAirport ? countryLabel(fromAirport.country) : '';
  const toCountry = toAirport ? countryLabel(toAirport.country) : '';
  const price = page.indicativePrices?.[0]?.from
    ? markUpFlightMoney(page.indicativePrices[0].from)
    : undefined;

  const faq =
    page.faq.length > 0
      ? page.faq
      : [
          {
            q: `How do I book flights from ${fromCity} to ${toCity}?`,
            a: 'Search live fares, select an offer, then request a callback. A UK agent confirms availability and booking by phone or WhatsApp.',
          },
          {
            q: 'Can I pay in instalments?',
            a: 'Yes — instalment plans are our primary way of helping travellers book. After you select a fare and request a callback, your agent will set up a plan that suits you.',
          },
          {
            q: 'Are the prices I see final?',
            a: `Displayed fares are indicative. An ${AGENCY_NAME} agent re-confirms the live price before you book.`,
          },
        ];

  const about = routeAboutCopy(fromCity, toCity, origin, destination);
  const siteUrl = getSiteUrl();
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
      { '@type': 'ListItem', position: 2, name: 'Flights', item: `${siteUrl}/flights/search` },
      { '@type': 'ListItem', position: 3, name: page.h1, item: `${siteUrl}${pagePath}` },
    ],
  };

  const productJsonLd = price
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: page.h1,
        description: page.metaDescription,
        brand: { '@type': 'Brand', name: AGENCY_NAME },
        offers: {
          '@type': 'Offer',
          priceCurrency: price.currency,
          price: (price.amount / 100).toFixed(2),
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}${pagePath}`,
        },
      }
    : null;

  return (
    <div className="stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {productJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      ) : null}

      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-brand hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/flights/search" className="hover:text-brand hover:underline">
          Flights
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">
          {fromCity} to {toCity}
        </span>
      </nav>

      <section className="overflow-hidden rounded-3xl bg-brand-navy px-5 py-8 text-white sm:px-8 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
          Route guide
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">
          {page.h1}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-white/85">
          {fromCity}
          {fromCountry ? `, ${fromCountry}` : ''} ({origin}) → {toCity}
          {toCountry ? `, ${toCountry}` : ''} ({destination})
        </p>
        {price ? (
          <p className="mt-5 text-3xl font-extrabold tracking-tight">
            From {formatMoney(price)}
            <span className="ml-2 text-sm font-semibold text-white/70">indicative · per adult</span>
          </p>
        ) : (
          <p className="mt-5 text-sm font-semibold text-white/80">Live fares update when you search</p>
        )}
        <div className="mt-6">
          <RouteGuideCta origin={origin} destination={destination} />
        </div>
      </section>

      <section className="panel">
        <h2 className="mt-0">Find {fromCity} to {toCity} flights</h2>
        <p className="muted text-sm">
          Your last dates and travellers are remembered. Change anything below, then search live
          fares — this page stays a guide, results open on search.
        </p>
        <div className="mt-4">
          <SearchForm
            initialParams={{
              from: origin,
              to: destination,
            }}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl bg-brand-navy px-5 py-8 text-white sm:px-8">
        <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
          Our primary promise
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
          Fly now. Pay in instalments.
        </h2>
        <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
          Instalment plans are how most of our travellers book {fromCity}–{toCity}. Search live
          fares, request a callback, and your UK agent sets up a plan — or pay in full if you prefer.
        </p>
        <Link
          href="/guides/paying-for-flights-in-instalments"
          className="mt-4 inline-flex text-sm font-bold text-accent hover:text-white"
        >
          How instalments work →
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: 'Pay in instalments',
            body: 'Our primary way to book — your agent sets up a scheduled plan after your callback.',
          },
          {
            title: 'Compare live fares',
            body: `See indicative prices for ${fromCity}–${toCity}, then let a UK agent confirm the live fare before you book.`,
          },
          {
            title: 'Agent-assisted booking',
            body: 'No online payment on this site. We finalise seats, bags, and your payment plan with you.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h3 className="m-0 text-base font-bold text-brand-navy">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="panel">
        <h2 className="mt-0">About cheap flights from {fromCity} to {toCity}</h2>
        <p>{about.lead}</p>
        <p className="muted text-sm">{about.support}</p>
        <p className="mt-3 text-sm">
          Related guides:{' '}
          <Link href="/guides/flights-uk-nigeria" className="font-semibold text-brand hover:underline">
            UK ↔ Nigeria flights
          </Link>
          {' · '}
          <Link
            href="/guides/cheap-flights-to-africa"
            className="font-semibold text-brand hover:underline"
          >
            Cheap flights to Africa
          </Link>
        </p>
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

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-chip px-5 py-5">
        <div>
          <p className="m-0 text-base font-bold text-brand-navy">
            Ready to compare {fromCity} to {toCity}?
          </p>
          <p className="m-0 text-sm text-muted">Open live results with your saved dates and travellers.</p>
        </div>
        <RouteGuideCta origin={origin} destination={destination} />
      </section>
    </div>
  );
}
