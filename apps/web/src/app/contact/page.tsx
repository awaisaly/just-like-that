import Image from 'next/image';
import Link from 'next/link';
import { ContactForm } from '../../components/ContactForm';
import {
  formatSupportPhone,
  getSupportEmail,
  getSupportPhone,
  supportMailtoHref,
  supportPhoneDigits,
  supportTelHref,
} from '../../lib/contact';
import { buildPageMetadata } from '../../lib/seo';

export const metadata = buildPageMetadata({
  title: 'Contact us',
  description:
    'Talk to Elca Airbridge about flying now and paying in instalments — UK support by phone, WhatsApp, or email.',
  path: '/contact',
  ogTitle: 'Contact Elca Airbridge',
});

export default function ContactPage() {
  const supportPhone = getSupportPhone();
  const supportEmail = getSupportEmail();
  const phoneDisplay = formatSupportPhone(supportPhone);
  const whatsappRaw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, '') ||
    supportPhoneDigits(supportPhone);
  const whatsappUrl = whatsappRaw
    ? `https://wa.me/${whatsappRaw}?text=${encodeURIComponent('Hi, I have a question about flights on Elca Airbridge.')}`
    : null;

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
        <div className="absolute inset-0 bg-brand-navy/70" />
        <div className="relative mx-auto w-[min(1200px,calc(100%-2rem))] px-0 py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
            Elca Airbridge
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Contact us
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/90 sm:text-lg">
            Want to fly now and pay in instalments? Our UK call centre is ready to set up your plan.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <aside className="stack">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mt-0 text-lg font-extrabold">UK call centre</h2>
            <p className="text-sm text-muted">
              We don’t take payment online. Reach out and we’ll confirm availability, set up your
              instalment plan, then finalise your booking with you.
            </p>

            <ul className="mt-5 grid gap-4">
              <li>
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">
                  Phone
                </p>
                <a
                  href={supportTelHref(supportPhone)}
                  className="mt-1 inline-block text-lg font-bold text-brand hover:underline"
                >
                  {phoneDisplay}
                </a>
              </li>
              <li>
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">
                  Email
                </p>
                <a
                  href={supportMailtoHref(supportEmail)}
                  className="mt-1 inline-block text-lg font-bold text-brand hover:underline break-all"
                >
                  {supportEmail}
                </a>
              </li>
              {whatsappUrl ? (
                <li>
                  <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">
                    WhatsApp
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-lg font-bold text-brand hover:underline"
                  >
                    Message us on WhatsApp
                  </a>
                </li>
              ) : null}
              <li>
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">Hours</p>
                <p className="m-0 mt-1 text-sm font-semibold text-ink">
                  Mon–Sat · 9:00–18:00 UK time
                </p>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-chip px-5 py-5">
            <p className="m-0 text-base font-bold text-brand-navy">Already found a fare?</p>
            <p className="mt-1 text-sm text-muted">
              Select the offer and request a callback — we’ll re-price and book it with you.
            </p>
            <Link
              href="/flights/search"
              className="mt-4 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
            >
              Search flights
            </Link>
          </div>
        </aside>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mt-0 text-lg font-extrabold">Send a message</h2>
          <p className="mb-5 text-sm text-muted">
            Tell us what you need and we’ll get back to you. For urgent bookings, call{' '}
            <a href={supportTelHref(supportPhone)} className="font-semibold text-brand hover:underline">
              {phoneDisplay}
            </a>{' '}
            or email{' '}
            <a
              href={supportMailtoHref(supportEmail)}
              className="font-semibold text-brand hover:underline"
            >
              {supportEmail}
            </a>
            .
          </p>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
