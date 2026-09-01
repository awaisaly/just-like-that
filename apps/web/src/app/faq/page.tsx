import Image from 'next/image';
import Link from 'next/link';
import { PayInInstalmentsAccent } from '../../components/InstalmentAccent';
import {
  getPrimaryWhatsAppLine,
  getSupportEmail,
  supportMailtoHref,
  whatsappChatHref,
} from '../../lib/contact';
import { buildPageMetadata } from '../../lib/seo';
import { TOURS_HREF } from '../../lib/tours';

export const metadata = buildPageMetadata({
  title: 'FAQs',
  description:
    'Answers about cheap flights from London to Lagos, flights to Nigeria from London, tickets from Lagos to London, instalments, and booking with a UK agent.',
  path: '/faq',
  ogTitle: 'Elca Airbridge FAQs',
});

type FaqItem = { q: string; a: string };

const faqGroups: { title: string; items: FaqItem[] }[] = [
  {
    title: 'Payment & instalments',
    items: [
      {
        q: 'Can I pay for flights in instalments?',
        a: 'Yes — instalment plans are our primary way of helping travellers book. You book the ticket with a UK agent, then pay in instalments. Every instalment must be paid before you fly. You can also pay in full if you prefer. Exact terms depend on the airline, fare rules, and how soon you travel.',
      },
      {
        q: 'Which cards do you accept?',
        a: 'When you book with an agent, Visa, Mastercard, and American Express are commonly accepted. Card details are never collected through the public website checkout.',
      },
      {
        q: 'Is my booking protected?',
        a: 'We arrange travel as an IATA-accredited UK agency, with the protections and processes that come with working through recognised airline distribution. Your agent will explain any applicable protections for your specific itinerary before you pay.',
      },
    ],
  },
  {
    title: 'Booking with Elca Airbridge',
    items: [
      {
        q: 'Do you create bookings or take payment on the website?',
        a: 'No. The site helps you compare live fares and request a callback. A UK agent re-confirms availability, then finalises the ticket with you by phone, WhatsApp, or email. Payment is arranged securely with our team — not through an online checkout here.',
      },
      {
        q: 'Why book with an agent instead of only using an airline website?',
        a: 'Our consultants work with IATA-accredited airline access, hotels, and partners worldwide. That means sharper comparisons, help when inventory looks sold out, and a person who stays with you through bags, changes, and instalments.',
      },
      {
        q: 'Are you a UK travel agency?',
        a: 'Yes. Elca Airbridge is a UK-based agency with a UK call centre. We specialise in competitive flights and tour packages for families, groups, and business travellers flying worldwide.',
      },
      {
        q: 'Do you arrange tours and holiday packages?',
        a: 'Yes. As well as flight-only bookings, we can help with inclusive tours and tailor-made packages — flights, hotels, and itinerary planning confirmed with a UK agent. See our Tours guide for how it works.',
      },
    ],
  },
  {
    title: 'Fares, dates & travellers',
    items: [
      {
        q: 'Are the prices I see guaranteed?',
        a: 'Fares on screen are indicative and can move until ticketed. When you request a callback, your agent re-checks the live price before anything is confirmed — so you are never surprised after the fact.',
      },
      {
        q: 'Can you help if flights look sold out?',
        a: 'Often, yes. Our reservations desk can probe alternative cabins, nearby airports, connections, and partner inventory. If a date is truly closed, we will say so clearly and offer the next best options.',
      },
      {
        q: 'Do you handle group bookings and special occasions?',
        a: 'Absolutely — sporting events, weddings, multi-city family visits, corporate trips, and fully tailor-made itineraries. Tell us the story of the trip; we will shape the routing around it.',
      },
    ],
  },
  {
    title: 'Bags, changes & support',
    items: [
      {
        q: 'How do I know what baggage is included?',
        a: 'Offer details show cabin and checked baggage when the airline provides that data. Weight limits are shown when available. Your agent double-checks allowances before ticketing.',
      },
      {
        q: 'What if I need to change dates later?',
        a: 'Change and refund rules vary by fare brand. Flexible tickets cost more up front but are easier to adjust. Tell us your risk tolerance when you call — we will recommend the right balance.',
      },
      {
        q: 'How quickly will someone get back to me?',
        a: 'Callback requests are prioritised during UK business hours. For the fastest response, call the team directly — that is still the best way to get the prompt service our clients expect.',
      },
    ],
  },
  {
    title: 'London, Lagos & Nigeria',
    items: [
      {
        q: 'Do you sell cheap flights from London to Lagos?',
        a: 'Yes. Search cheap flights from London to Lagos on our London to Lagos page, then request a callback. A UK agent re-confirms the fare and books your ticket — pay in instalments or in full.',
      },
      {
        q: 'Where can I buy a flight ticket to Nigeria from London?',
        a: 'Search a flight ticket to Nigeria from London for Lagos, Abuja or Port Harcourt. Most travellers start with flights to Nigeria from London via Heathrow or Gatwick, then book with our UK desk.',
      },
      {
        q: 'Can I buy tickets from Lagos to London?',
        a: 'Yes. Compare tickets from Lagos to London and a cheap ticket from Lagos to London on our Lagos to London page. We also book a flight from Nigeria to London from Abuja and other Nigerian cities.',
      },
      {
        q: 'How do I book a flight from Nigeria to London?',
        a: 'Search a flight from Nigeria to London, pick a fare, then request a callback. Your agent confirms seats, bags, and payment before ticketing.',
      },
    ],
  },
];

export default function FaqPage() {
  const email = getSupportEmail();
  const whatsapp = getPrimaryWhatsAppLine();
  const whatsappHref = whatsapp ? whatsappChatHref(whatsapp.digits) : '/contact';
  const whatsappDisplay = whatsapp?.display ?? 'WhatsApp';

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqGroups.flatMap((group) =>
      group.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    ),
  };

  return (
    <div className="faq-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="full-bleed-x relative -mt-6 overflow-hidden">
        <Image
          src="/img/dest-abuja.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-navy/75" />
        <div className="relative mx-auto w-[min(1200px,calc(100%-2rem))] px-0 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            Help centre
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.4rem,5.5vw,3.75rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            Questions, answered clearly
          </h1>
          <p className="mt-4 max-w-lg text-lg text-white/85">
            How Elca Airbridge works — from searching fares to{' '}
            <PayInInstalmentsAccent>paying in instalments</PayInInstalmentsAccent> with a UK agent.
          </p>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:items-start">
        <aside
          className="lg:sticky"
          style={{ top: 'calc(var(--site-chrome-height, 6.5rem) + 0.75rem)' }}
        >
          <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-muted">
            Jump to
          </p>
          <nav className="mt-3 grid gap-2">
            {faqGroups.map((group) => (
              <a
                key={group.title}
                href={`#${slugify(group.title)}`}
                className="text-sm font-semibold text-brand-navy transition hover:text-brand"
              >
                {group.title}
              </a>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-line bg-chip px-4 py-4">
            <p className="m-0 text-sm font-bold text-brand-navy">Still unsure?</p>
            <p className="mt-1 text-xs text-muted">WhatsApp or email the UK desk.</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-sm font-bold text-brand hover:underline"
            >
              WhatsApp {whatsappDisplay}
            </a>
            <a
              href={supportMailtoHref(email)}
              className="mt-1 block break-all text-sm font-bold text-brand hover:underline"
            >
              {email}
            </a>
          </div>
        </aside>

        <div className="grid gap-10">
          {faqGroups.map((group) => (
            <section key={group.title} id={slugify(group.title)} className="scroll-mt-28">
              <h2 className="m-0 text-2xl font-extrabold text-brand-navy">{group.title}</h2>
              <div className="mt-4 grid gap-3">
                {group.items.map((item) => (
                  <details key={item.q} className="faq-item group">
                    <summary className="faq-summary">
                      <span>{item.q}</span>
                      <span className="faq-chevron" aria-hidden>
                        +
                      </span>
                    </summary>
                    <p className="faq-answer">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <section className="overflow-hidden rounded-3xl bg-brand-navy px-6 py-10 text-white sm:px-10">
            <h2 className="m-0 text-2xl font-extrabold text-white sm:text-3xl">
              Ready to find a fare?
            </h2>
            <p className="mt-2 max-w-lg text-white/80">
              Search flights, request a callback, and{' '}
              <PayInInstalmentsAccent>pay in instalments</PayInInstalmentsAccent> — or speak with us
              now.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/flights/search"
                className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-dark"
              >
                Search flights
              </Link>
              <Link
                href={TOURS_HREF}
                className="inline-flex rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                Tours guide
              </Link>
              <Link
                href="/about"
                className="inline-flex rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                About us
              </Link>
              <Link
                href="/contact"
                className="inline-flex rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                Contact
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
