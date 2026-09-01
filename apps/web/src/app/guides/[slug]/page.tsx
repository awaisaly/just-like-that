import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { InstalmentSpotlight } from '../../../components/Instalments';
import { InstalmentPhrase, PayInInstalmentsAccent } from '../../../components/InstalmentAccent';
import { findAirport } from '../../../data/airports';
import { getSeoPage, getSeoPagesByType, seoPath } from '../../../data/seo-pages';
import { AGENCY_NAME } from '../../../lib/brand';
import { INSTALMENTS_FAQ_HREF, INSTALMENTS_HREF, instalmentCopy } from '../../../lib/instalments';
import { buildPageMetadata, CAMPAIGN_SEARCH_TERMS } from '../../../lib/seo';
import { TOURS_SLUG, tourCopy } from '../../../lib/tours';

export const revalidate = 3600;

export function generateStaticParams() {
  return getSeoPagesByType('guide').map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPage(slug);
  if (!page) return { title: slug };
  return buildPageMetadata({
    title: page.title,
    description: page.metaDescription,
    path: seoPath(page),
    ogTitle: page.h1,
    keywords: [...CAMPAIGN_SEARCH_TERMS, page.title, AGENCY_NAME],
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getSeoPage(slug);
  if (!page || page.type !== 'guide') notFound();

  if (slug === 'paying-for-flights-in-instalments') {
    return <InstalmentsGuide />;
  }

  if (slug === TOURS_SLUG) {
    return <ToursGuide faq={page.faq} />;
  }

  if (slug === 'cheap-flights-to-africa') {
    return <AfricaFlightsGuide faq={page.faq} />;
  }

  if (slug === 'flights-uk-nigeria') {
    return <UkNigeriaFlightsGuide faq={page.faq} />;
  }

  return (
    <div className="stack">
      <h1>{page.h1}</h1>
      <p>{page.metaDescription}</p>
      <InstalmentSpotlight compact />
    </div>
  );
}

function GuideFaq({ faq }: { faq: { q: string; a: string }[] }) {
  if (!faq.length) return null;
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="stack max-w-2xl">
        <h2 className="m-0 text-2xl font-extrabold text-brand-navy">Frequently asked questions</h2>
        <div className="grid gap-3">
          {faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-line bg-white px-5 py-4 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none text-base font-bold text-brand-navy marker:content-none">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

function AfricaFlightsGuide({ faq }: { faq: { q: string; a: string }[] }) {
  const routes = getSeoPagesByType('route').filter((page) => {
    const to = page.route?.destinationIata;
    return to && ['LOS', 'ABV', 'PHC', 'ACC', 'NBO', 'JNB'].includes(to);
  });

  return (
    <div className="stack">
      <section className="stack max-w-2xl">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-accent">Travel guide</p>
        <h1 className="m-0 text-4xl font-extrabold leading-tight text-brand-navy sm:text-5xl">
          Cheap flights to Africa from the UK
        </h1>
        <p className="text-lg text-muted">
          {AGENCY_NAME} helps UK travellers find cheap flights to Africa — Nigeria, Ghana, Kenya,
          South Africa and more. Search live fares online, then book with a UK agent. Instalments are
          our primary way to pay.
        </p>
      </section>

      <section className="stack max-w-2xl">
        <h2 className="m-0 text-2xl font-extrabold text-brand-navy">Popular Africa destinations</h2>
        <p className="m-0 text-muted">
          Start with a destination guide, or jump straight into a city-pair route with indicative
          fares.
        </p>
        <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
          {[
            { href: '/flights/london-to-lagos', label: 'Cheap flights from London to Lagos' },
            { href: '/destinations/lagos', label: 'Lagos, Nigeria' },
            { href: '/destinations/abuja', label: 'Abuja, Nigeria' },
            { href: '/destinations/accra', label: 'Accra, Ghana' },
            { href: '/destinations/nairobi', label: 'Nairobi, Kenya' },
            { href: '/destinations/johannesburg', label: 'Johannesburg, South Africa' },
            { href: '/destinations/cape-town', label: 'Cape Town, South Africa' },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex rounded-xl border border-line bg-white px-4 py-3 text-sm font-bold text-brand-navy hover:border-brand/40"
              >
                {item.label} →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="stack">
        <h2 className="m-0 text-2xl font-extrabold text-brand-navy">UK to Africa route guides</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {routes.map((route) => {
            const from = findAirport(route.route!.originIata)?.city ?? route.route!.originIata;
            const to = findAirport(route.route!.destinationIata)?.city ?? route.route!.destinationIata;
            return (
              <Link
                key={route.slug}
                href={seoPath(route)}
                className="rounded-2xl border border-line bg-white px-5 py-4 font-bold text-brand-navy shadow-sm hover:border-brand/40"
              >
                {from} → {to}
                <span className="mt-1 block text-sm font-semibold text-muted">Cheap flights guide</span>
              </Link>
            );
          })}
        </div>
      </section>

      <InstalmentSpotlight compact />
      <GuideFaq faq={faq} />

      <section className="flex flex-wrap gap-3">
        <Link
          href="/flights/search"
          className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-dark"
        >
          Search Africa flights
        </Link>
        <Link
          href="/guides/flights-uk-nigeria"
          className="inline-flex rounded-xl border border-line px-5 py-3 text-sm font-bold text-brand-navy hover:border-brand/40"
        >
          UK–Nigeria guide
        </Link>
      </section>
    </div>
  );
}

function UkNigeriaFlightsGuide({ faq }: { faq: { q: string; a: string }[] }) {
  const routes = getSeoPagesByType('route').filter((page) => {
    const o = page.route?.originIata;
    const d = page.route?.destinationIata;
    if (!o || !d) return false;
    const nigeria = ['LOS', 'ABV', 'PHC'];
    const uk = ['LHR', 'LGW', 'MAN', 'BHX'];
    return (uk.includes(o) && nigeria.includes(d)) || (nigeria.includes(o) && uk.includes(d));
  });

  return (
    <div className="stack">
      <section className="stack max-w-2xl">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-accent">Travel guide</p>
        <h1 className="m-0 text-4xl font-extrabold leading-tight text-brand-navy sm:text-5xl">
          Flights to Nigeria from London &amp; Nigeria to London
        </h1>
        <p className="text-lg text-muted">
          Book flights to Nigeria from London and a flight from Nigeria to London with {AGENCY_NAME}.
          Cheap flights from London to Lagos, tickets from Lagos to London, a flight ticket to
          Nigeria from London, Abuja, Port Harcourt, Manchester and Birmingham — confirmed by a UK
          agent, with instalments available.
        </p>
      </section>

      <section className="stack max-w-2xl">
        <h2 className="m-0 text-2xl font-extrabold text-brand-navy">Both directions, one agency</h2>
        <p className="m-0 text-muted">
          Search a flight ticket to Nigeria from London, or tickets from Lagos to London if you are
          heading the other way. Family visits, student travel, and business trips use the same
          callback booking flow.
        </p>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>Search live fares for your dates and travellers</li>
          <li>Request a callback — no online payment on this site</li>
          <li>Your UK agent re-confirms price, bags, seats, and instalments</li>
        </ul>
      </section>

      <section className="stack">
        <h2 className="m-0 text-2xl font-extrabold text-brand-navy">Popular UK ↔ Nigeria routes</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {routes.map((route) => {
            const from = findAirport(route.route!.originIata)?.city ?? route.route!.originIata;
            const to = findAirport(route.route!.destinationIata)?.city ?? route.route!.destinationIata;
            return (
              <Link
                key={route.slug}
                href={seoPath(route)}
                className="rounded-2xl border border-line bg-white px-5 py-4 font-bold text-brand-navy shadow-sm hover:border-brand/40"
              >
                {from} → {to}
                <span className="mt-1 block text-sm font-semibold text-muted">{route.title}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <InstalmentSpotlight compact />
      <GuideFaq faq={faq} />

      <section className="flex flex-wrap gap-3">
        <Link
          href="/flights/london-to-lagos"
          className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-dark"
        >
          Cheap flights from London to Lagos
        </Link>
        <Link
          href="/flights/lagos-to-london"
          className="inline-flex rounded-xl border border-line px-5 py-3 text-sm font-bold text-brand-navy hover:border-brand/40"
        >
          Tickets from Lagos to London
        </Link>
        <Link
          href="/guides/cheap-flights-to-africa"
          className="inline-flex rounded-xl border border-line px-5 py-3 text-sm font-bold text-brand-navy hover:border-brand/40"
        >
          More Africa flights
        </Link>
      </section>
    </div>
  );
}

function InstalmentsGuide() {
  return (
    <div className="stack">
      <section className="stack max-w-2xl">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-accent">
          Our primary promise
        </p>
        <h1 className="m-0 text-4xl font-extrabold leading-tight text-brand-navy sm:text-5xl">
          <InstalmentPhrase>{instalmentCopy.motto}</InstalmentPhrase>
        </h1>
        <p className="text-lg text-muted">
          Instalment plans are how most {AGENCY_NAME} travellers book. Search live fares, book with
          a UK agent, and pay on a schedule — every instalment must be paid before you fly. Or pay
          in full if you prefer.
        </p>
      </section>

      <InstalmentSpotlight compact />

      <section className="stack max-w-2xl">
        <h2 className="m-0 text-2xl font-extrabold">How instalments work with us</h2>
        <div className="grid gap-4">
          {instalmentCopy.steps.map((step) => (
            <div key={step.n} className="border-l-2 border-accent pl-4">
              <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-muted">{step.n}</p>
              <h3 className="mt-1 text-lg font-bold text-brand-navy">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.body}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted">
          Exact terms depend on the airline, fare rules, and how soon you travel. Your agent
          confirms everything before you commit — nothing is ticketed until the plan is clear.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/flights/search"
            className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-dark"
          >
            Search flights
          </Link>
          <Link
            href={INSTALMENTS_FAQ_HREF}
            className="inline-flex rounded-xl border border-line px-5 py-3 text-sm font-bold text-brand-navy hover:border-brand/40"
          >
            More FAQs
          </Link>
          <Link
            href="/contact"
            className="inline-flex rounded-xl border border-line px-5 py-3 text-sm font-bold text-brand-navy hover:border-brand/40"
          >
            Contact us
          </Link>
        </div>
      </section>
    </div>
  );
}

function ToursGuide({ faq }: { faq: { q: string; a: string }[] }) {
  const faqJsonLd =
    faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }
      : null;

  return (
    <div className="stack">
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <section className="full-bleed-x relative -mt-6 overflow-hidden">
        <Image
          src="/img/hero-flights.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/90 via-brand-navy/70 to-brand/45" />
        <div className="relative mx-auto w-[min(1200px,calc(100%-2rem))] px-0 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            Travel guide
          </p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.25rem,5.5vw,3.75rem)] font-extrabold leading-[0.98] tracking-tight text-white">
            {tourCopy.motto}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            {tourCopy.heroSupport} Or{' '}
            <PayInInstalmentsAccent>pay in instalments</PayInInstalmentsAccent> on the flights
            that get you there.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-dark"
            >
              Plan a tour
            </Link>
            <Link
              href="/destinations"
              className="inline-flex rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20"
            >
              Browse destinations
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="stack max-w-2xl">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-brand">
            Tours with {AGENCY_NAME}
          </p>
          <h2 className="m-0 text-2xl font-extrabold text-brand-navy sm:text-3xl">
            More than a seat on a plane
          </h2>
          <p className="m-0 text-base leading-relaxed text-muted">
            {tourCopy.tagline} Search live fares online when you know the route — or speak with us
            first and we will shape the full trip around your dates, travellers, and budget.
          </p>
          <p className="m-0 text-base leading-relaxed text-muted">
            Nothing is ticketed on the website. A UK agent re-confirms availability, explains what is
            included, and sets up instalments or full payment before you commit.
          </p>
        </div>
        <div className="relative min-h-[240px] overflow-hidden rounded-3xl">
          <Image
            src="/img/dest-london.jpg"
            alt="City skyline for holiday travel"
            fill
            sizes="(max-width: 1024px) 100vw, 480px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/75 via-transparent to-transparent" />
          <p className="absolute inset-x-0 bottom-0 m-0 p-5 text-sm font-semibold text-white">
            City breaks, family visits, and longer holidays — built around real travel plans.
          </p>
        </div>
      </section>

      <section className="stack">
        <div className="max-w-xl">
          <h2 className="m-0 text-2xl font-extrabold text-brand-navy">What we can arrange</h2>
          <p className="mt-2 text-muted">
            Tell your agent what kind of trip you need — we match the package to the journey.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {tourCopy.types.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-line bg-white px-5 py-5 shadow-sm"
            >
              <h3 className="m-0 text-base font-bold text-brand-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stack max-w-2xl">
        <h2 className="m-0 text-2xl font-extrabold text-brand-navy">How tour booking works</h2>
        <div className="grid gap-4">
          {tourCopy.steps.map((step) => (
            <div key={step.n} className="border-l-2 border-brand pl-4">
              <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-muted">{step.n}</p>
              <h3 className="mt-1 text-lg font-bold text-brand-navy">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <InstalmentSpotlight compact />

      <section className="flex flex-col gap-4 rounded-3xl border border-line bg-surface px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-accent">Next step</p>
          <h2 className="mt-1 text-xl font-extrabold text-brand-navy sm:text-2xl">
            Ready to plan your tour?
          </h2>
          <p className="mt-1 max-w-lg text-sm text-muted">
            Contact us with your destinations and dates, or start with a flight search and ask about
            a package on the callback.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-dark"
          >
            Contact us
          </Link>
          <Link
            href="/flights/search"
            className="inline-flex rounded-xl border border-line bg-white px-5 py-3 text-sm font-bold text-brand-navy hover:border-brand/40"
          >
            Search flights
          </Link>
          <Link
            href={INSTALMENTS_HREF}
            className="inline-flex rounded-xl border border-line bg-white px-5 py-3 text-sm font-bold text-brand-navy hover:border-brand/40"
          >
            Instalments
          </Link>
        </div>
      </section>

      {faq.length > 0 ? (
        <section className="stack max-w-2xl">
          <h2 className="m-0 text-2xl font-extrabold text-brand-navy">Tours FAQs</h2>
          <div className="grid gap-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-line bg-white px-5 py-4 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none text-base font-bold text-brand-navy marker:content-none">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
          <p className="m-0 text-sm text-muted">
            More answers on our{' '}
            <Link href="/faq" className="font-semibold text-brand hover:underline">
              FAQs page
            </Link>
            .
          </p>
        </section>
      ) : null}
    </div>
  );
}
