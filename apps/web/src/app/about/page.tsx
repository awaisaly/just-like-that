import Image from 'next/image';
import Link from 'next/link';
import { InstalmentSpotlight } from '../../components/Instalments';
import {
  formatSupportPhone,
  getSupportPhone,
  supportTelHref,
} from '../../lib/contact';
import { buildPageMetadata } from '../../lib/seo';

export const metadata = buildPageMetadata({
  title: 'About us',
  description:
    'Elca Airbridge helps travellers book now and pay in instalments — live fares online, agent-booked tickets, and all instalments paid before you fly.',
  path: '/about',
  ogTitle: 'About Elca Airbridge',
});

const pillars = [
  {
    title: 'Book now. Pay in instalments.',
    body: 'Instalment plans are our primary way to book. Search live fares, book with a UK agent, and pay on a schedule — every instalment must be paid before you fly. Or settle in full if you prefer.',
  },
  {
    title: 'Airline access that matters',
    body: 'Through IATA-accredited relationships with major international carriers, our consultants compare real inventory — not just a single website’s leftover seats.',
  },
  {
    title: 'People on the booking',
    body: 'Search online, then speak with a UK agent who re-checks the fare, bags, and seats, books your ticket, and sets up instalments — all paid before you fly.',
  },
];

const moments = [
  {
    label: 'Family visits',
    text: 'Multi-city trips, school holidays, and group travel arranged with care.',
  },
  {
    label: 'Business & events',
    text: 'Corporate itineraries, sporting fixtures, and time-sensitive departures.',
  },
  {
    label: 'Tailor-made plans',
    text: 'Custom routes, stopovers, and last-minute discounts when the calendar shifts.',
  },
];

export default function AboutPage() {
  const phone = getSupportPhone();
  const phoneDisplay = formatSupportPhone(phone);

  return (
    <div className="about-page">
      <section className="full-bleed-x relative -mt-6 overflow-hidden">
        <Image
          src="/img/hero-flights.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/90 via-brand-navy/65 to-brand/40" />
        <div className="relative mx-auto w-[min(1200px,calc(100%-2rem))] px-0 py-20 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            About Elca Airbridge
          </p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold leading-[0.95] tracking-tight text-white">
            Flights found online.
            <br />
            <span className="text-accent">Booked with people.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            A UK travel desk built so you can book now and pay in instalments — with a real
            consultant when the details matter.
          </p>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Who we are
          </p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight text-brand-navy sm:text-4xl">
            Established UK agency. Global reach. Local care.
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted">
            <p>
              Elca Airbridge is a UK-based travel agency with deep experience in worldwide flights
              and holiday packages. We specialise in competitive airline tickets, inclusive tours,
              business travel, and late travel deals that still feel considered.
            </p>
            <p>
              As an IATA-accredited agency, we work directly with major international airlines. That
              access is how we unlock strong fares for individuals, families, groups, and corporate
              travellers — whether you are heading to a family visit, a conference, or a tailor-made
              itinerary across continents.
            </p>
            <p>
              Bookings are arranged with financial protection and peace of mind in mind. We serve
              both corporate and leisure clients with the same standard: find the right journey, then
              deliver it properly.
            </p>
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-3xl">
          <Image
            src="/img/dest-london.jpg"
            alt="London"
            fill
            sizes="(max-width: 1024px) 100vw, 480px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/65">
              From our UK desk
            </p>
            <p className="mt-2 text-xl font-bold leading-snug">
              Loyal customers stay because we treat every booking like it is the only one that
              matters that day.
            </p>
          </div>
        </div>
      </section>

      <section className="full-bleed-x border-y border-line bg-[linear-gradient(180deg,#eaf1fd_0%,#f4f6f9_100%)]">
        <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-8 py-12 sm:grid-cols-3 sm:gap-6 sm:py-16">
          {pillars.map((pillar) => (
            <div key={pillar.title}>
              <h3 className="m-0 text-lg font-extrabold text-brand-navy">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stack">
        <div className="max-w-2xl">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            How we work
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-brand-navy">
            Direct lines to airlines. Room to negotiate the impossible.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Our reservations team gives you consultant-led access across airlines, car hire, and
            major hotels worldwide — so we can surface the cheapest workable fares, not the first
            result that looks fine. When everything appears sold out, that is usually when we get
            interesting.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {moments.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-line bg-white px-5 py-5 shadow-sm"
            >
              <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-accent">
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-brand-navy">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <InstalmentSpotlight compact />

      <section className="grid gap-8 overflow-hidden rounded-3xl bg-brand-navy text-white lg:grid-cols-[1fr_1.1fr]">
        <div className="relative min-h-[240px] lg:min-h-full">
          <Image
            src="/img/dest-lagos.jpg"
            alt="Lagos"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover opacity-80"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
            Talk to us
          </p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight">
            Prefer a human voice to a form?
          </h2>
          <p className="mt-3 max-w-md text-base text-white/80">
            Pick up the phone. That is still the fastest way to set up an instalment plan — our
            primary promise — or to sort groups and sold-out dates.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={supportTelHref(phone)}
              className="inline-flex rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-white transition hover:bg-accent-dark"
            >
              Call {phoneDisplay}
            </a>
            <Link
              href="/flights/search"
              className="inline-flex rounded-xl border border-white/30 px-6 py-3.5 text-base font-bold text-white transition hover:bg-white/10"
            >
              Search flights
            </Link>
            <Link
              href="/faq"
              className="inline-flex rounded-xl border border-white/30 px-6 py-3.5 text-base font-bold text-white transition hover:bg-white/10"
            >
              Read FAQs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
