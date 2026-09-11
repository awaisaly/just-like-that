import Image from 'next/image';
import Link from 'next/link';
import { InstalmentMottoAccent, PayInInstalmentsAccent } from '../../components/InstalmentAccent';
import { InstalmentSpotlight } from '../../components/Instalments';
import {
  EmailChannelIcon,
  PhoneCallIcon,
  WhatsAppChannelIcon,
} from '../../components/ContactChannelIcons';
import {
  getContactCallDisplay,
  getContactCallPhone,
  getSupportEmail,
  getWhatsAppLines,
  supportMailtoHref,
  supportTelHref,
  whatsappChatHref,
} from '../../lib/contact';
import { AGENCY_NAME } from '../../lib/brand';
import { INSTALMENTS_HREF, instalmentCopy } from '../../lib/instalments';
import { buildPageMetadata } from '../../lib/seo';

export const metadata = buildPageMetadata({
  title: 'Contact us',
  description:
    'Talk to Elca Airbridge about flying now and paying in instalments — UK support by phone, WhatsApp, or email.',
  path: '/contact',
  ogTitle: 'Contact Elca Airbridge',
});

export default function ContactPage() {
  const callPhone = getContactCallPhone();
  const callDisplay = getContactCallDisplay();
  const supportEmail = getSupportEmail();
  const whatsappLines = getWhatsAppLines();
  const whatsapp = whatsappLines[0];
  const whatsappMessage = `Hi, I have a question about flights on ${AGENCY_NAME}.`;
  const whatsappHref = whatsapp
    ? whatsappChatHref(whatsapp.digits, whatsappMessage)
    : undefined;
  const whatsappDisplay = whatsapp?.display;

  return (
    <div className="contact-page">
      <section className="full-bleed-x relative -mt-6 overflow-hidden">
        <Image
          src="/img/hero-flights.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-brand-navy/92 via-brand-navy/70 to-brand/45" />
        <div className="relative mx-auto w-[min(1200px,calc(100%-2rem))] px-0 py-20 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            UK travel desk
          </p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.4rem,6vw,4.1rem)] font-extrabold leading-[0.95] tracking-tight text-white">
            Talk to a UK agent.
            <br />
            <InstalmentMottoAccent />
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            WhatsApp or call to confirm your fare. Instalments are how most travellers book — every
            payment complete before you fly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-bold text-white transition hover:bg-[#1ebe57]"
              >
                <WhatsAppChannelIcon className="h-5 w-5" />
                WhatsApp {whatsappDisplay}
              </a>
            ) : null}
            <a
              href={supportTelHref(callPhone)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <PhoneCallIcon className="h-5 w-5" />
              Call {callDisplay}
            </a>
          </div>
        </div>
      </section>

      <section className="contact-instalment-banner" aria-labelledby="contact-instalment-title">
        <div className="contact-instalment-copy-wrap">
          <p className="contact-instalment-eyebrow">How most travellers book</p>
          <h2 id="contact-instalment-title" className="contact-instalment-title">
            Pay in instalments
          </h2>
          <p className="contact-instalment-copy">
            {instalmentCopy.tagline} WhatsApp or call and we’ll set the plan up with you.
          </p>
          <Link href={INSTALMENTS_HREF} className="contact-instalment-link">
            How instalments work →
          </Link>
        </div>
        <div className="contact-instalment-actions">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-instalment-cta is-whatsapp"
            >
              <WhatsAppChannelIcon className="h-5 w-5" />
              WhatsApp to set up a plan
            </a>
          ) : null}
          <a href={supportTelHref(callPhone)} className="contact-instalment-cta is-call">
            <PhoneCallIcon className="h-5 w-5" />
            Call {callDisplay}
          </a>
        </div>
      </section>

      <section className="contact-methods" aria-label="Ways to reach us">
        {whatsappLines.map((line) => (
          <a
            key={line.digits}
            href={whatsappChatHref(line.digits, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-method-card is-whatsapp"
          >
            <span className="contact-method-icon" aria-hidden="true">
              <WhatsAppChannelIcon />
            </span>
            <span className="contact-method-kicker">Fastest reply</span>
            <h2 className="contact-method-title">{line.label}</h2>
            <p className="contact-method-value">
              <span aria-hidden="true">🇬🇧</span> {line.display}
            </p>
            <p className="contact-method-hint">
              Fastest way to set up{' '}
              <PayInInstalmentsAccent>pay in instalments</PayInInstalmentsAccent>.
            </p>
          </a>
        ))}

        <a href={supportTelHref(callPhone)} className="contact-method-card is-phone">
          <span className="contact-method-icon" aria-hidden="true">
            <PhoneCallIcon />
          </span>
          <span className="contact-method-kicker">UK voice line</span>
          <h2 className="contact-method-title">Call us</h2>
          <p className="contact-method-value">
            <span aria-hidden="true">🇬🇧</span> {callDisplay}
          </p>
          <p className="contact-method-hint">
            Ask about instalments on the call — or settle in full if you prefer.
          </p>
        </a>

        <a href={supportMailtoHref(supportEmail)} className="contact-method-card is-email">
          <span className="contact-method-icon" aria-hidden="true">
            <EmailChannelIcon />
          </span>
          <span className="contact-method-kicker">Written follow-up</span>
          <h2 className="contact-method-title">Email</h2>
          <p className="contact-method-value contact-method-email">{supportEmail}</p>
          <p className="contact-method-hint">Best for itineraries, groups, and documents.</p>
        </a>
      </section>

      <section className="contact-meta">
        <div className="contact-hours">
          <p className="contact-hours-label">Hours</p>
          <p className="contact-hours-value">Mon–Sat · 9:00–18:00 UK time</p>
          <p className="contact-hours-note">We don’t take payment on this website.</p>
        </div>
        <div className="contact-search">
          <p className="m-0 text-base font-bold text-brand-navy">Already found a fare?</p>
          <p className="mt-1 text-sm text-muted">
            Search live prices, then WhatsApp the offer — we’ll re-price, book it, and set up{' '}
            <PayInInstalmentsAccent>pay in instalments</PayInInstalmentsAccent>.
          </p>
          <Link
            href="/flights/search"
            className="mt-4 inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            Search flights
          </Link>
        </div>
      </section>

      <InstalmentSpotlight compact />

      <section className="relative overflow-hidden rounded-3xl bg-brand-navy text-white">
        <div className="absolute inset-0">
          <Image
            src="/img/dest-lagos.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-brand-navy/65" />
        </div>
        <div className="relative px-6 py-12 sm:px-10 sm:py-16">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
            {instalmentCopy.motto}
          </p>
          <h2 className="mt-2 max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Compare fares online.
            <br />
            <PayInInstalmentsAccent>Pay in instalments</PayInInstalmentsAccent> with us.
          </h2>
          <p className="mt-3 max-w-lg text-base text-white/80">
            London to Lagos, Nigeria to London, and routes worldwide — a UK agent stays with you
            through bags, dates, and every instalment before you fly.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/flights/search"
              className="inline-flex rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-white transition hover:bg-accent-dark"
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
